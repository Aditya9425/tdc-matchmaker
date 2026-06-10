/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Customer, Note, Match, TimelineEvent } from '@/types';
import { callGroqWithJson } from './groqClient';
import { getCustomerNotes } from '@/firebase/notes';
import { getMatchesByCustomer } from '@/firebase/matches';
import { getTimelineEvents } from '@/firebase/timeline';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MeetingBrief {
  executiveSummary: string;
  currentSituation: string;
  keyDiscussionTopics: string[];
  importantConcerns: string[];
  suggestedQuestions: string[];
  recommendedNextSteps: string[];
  matchmakingOpportunities: string[];
  isAIGenerated: boolean;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface BriefCacheEntry {
  data: MeetingBrief;
  customerUpdatedAt: string;
  notesCount: number;
  matchesCount: number;
  timestamp: number;
}

const briefCache = new Map<string, BriefCacheEntry>();
const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function getCachedBrief(
  customerId: string,
  customerUpdatedAt: string,
  notesCount: number,
  matchesCount: number
): MeetingBrief | null {
  const entry = briefCache.get(customerId);
  if (!entry) return null;

  // Invalidate if data changed
  if (entry.customerUpdatedAt !== customerUpdatedAt) return null;
  if (entry.notesCount !== notesCount) return null;
  if (entry.matchesCount !== matchesCount) return null;
  if (Date.now() - entry.timestamp > CACHE_MAX_AGE_MS) return null;

  return entry.data;
}

function setCachedBrief(
  customerId: string,
  customerUpdatedAt: string,
  notesCount: number,
  matchesCount: number,
  data: MeetingBrief
): void {
  briefCache.set(customerId, {
    data,
    customerUpdatedAt,
    notesCount,
    matchesCount,
    timestamp: Date.now(),
  });
}

// ─── Data Gathering ───────────────────────────────────────────────────────────

interface GatheredData {
  notes: Note[];
  matches: Match[];
  timeline: TimelineEvent[];
}

async function gatherCustomerData(customerId: string): Promise<GatheredData> {
  // Fetch all data in parallel
  const [notes, matches, timeline] = await Promise.allSettled([
    getCustomerNotes(customerId),
    getMatchesByCustomer(customerId),
    getTimelineEvents(customerId),
  ]);

  return {
    notes: notes.status === 'fulfilled' ? notes.value : [],
    matches: matches.status === 'fulfilled' ? matches.value : [],
    timeline: timeline.status === 'fulfilled' ? timeline.value : [],
  };
}

// ─── Brief Building ──────────────────────────────────────────────────────────

function buildFallbackBrief(customer: Customer, data: GatheredData): MeetingBrief {
  const sentMatches = data.matches.filter(m => m.status === 'sent' || m.status === 'accepted');
  const declinedMatches = data.matches.filter(m => m.status === 'declined');
  const recentNotes = data.notes.slice(0, 3);

  return {
    executiveSummary: `${customer.firstName} ${customer.lastName} is a ${customer.age}-year-old ${customer.designation || customer.profession} based in ${customer.city}. Currently in "${customer.status}" phase with ${data.matches.length} total match interactions.`,
    currentSituation: `Profile status: ${customer.status}. Last active: ${customer.lastActive || 'Unknown'}. ${sentMatches.length} matches sent, ${declinedMatches.length} declined. ${data.notes.length} notes on file.`,
    keyDiscussionTopics: [
      `Review current matching preferences and expectations`,
      `Discuss ${data.matches.length > 0 ? 'recent match feedback' : 'initial matching criteria'}`,
      `Assess timeline and readiness for introductions`,
    ],
    importantConcerns: [
      declinedMatches.length > 2 ? `High decline rate (${declinedMatches.length} declined) — review matching criteria` : 'No significant concerns identified',
      ...(recentNotes.length > 0 ? ['Review recent notes for follow-up items'] : []),
    ].filter(Boolean),
    suggestedQuestions: [
      `Are you satisfied with the profiles being shared?`,
      `Have your preferences changed since our last conversation?`,
      `What qualities are most important to you in a partner?`,
      `Are you open to adjusting any of your deal-breakers?`,
      `How is your overall experience with the matchmaking process?`,
    ],
    recommendedNextSteps: [
      data.matches.length === 0 ? 'Generate initial match recommendations' : 'Review pending match responses',
      'Update profile with any recent life changes',
      'Schedule follow-up call within 2 weeks',
    ],
    matchmakingOpportunities: [
      'AI analysis unavailable — review candidates manually',
      `Customer has ${customer.preferredCities?.length || 0} preferred cities listed`,
    ],
    isAIGenerated: false,
  };
}

/**
 * Main entry point: Generate a meeting preparation brief.
 */
export async function generateMeetingBrief(
  customer: Customer,
  onProgress?: (step: string) => void
): Promise<MeetingBrief> {
  const customerUpdatedAt = customer.lastActive || customer.joinedDate || '';

  // Step 1: Gather all customer data
  onProgress?.('Gathering customer data...');
  const data = await gatherCustomerData(customer.id);

  // Check cache with data freshness
  const cached = getCachedBrief(
    customer.id,
    customerUpdatedAt,
    data.notes.length,
    data.matches.length
  );
  if (cached) {
    console.log('Generate Brief: returning cached result for', customer.id);
    return cached;
  }

  onProgress?.('Analyzing match history...');

  // Step 2: Build context for AI
  const notesContext = data.notes.length > 0
    ? data.notes.slice(0, 10).map((n, i) => `Note ${i + 1} (${n.createdAt}): ${n.content.substring(0, 200)}`).join('\n')
    : 'No notes on file.';

  const matchesContext = data.matches.length > 0
    ? data.matches.slice(0, 10).map((m, i) => {
        const analysis = m.aiAnalysis;
        return `Match ${i + 1}: Status=${m.status}, Score=${m.compatibilityScore}%, Reasons: ${m.reasons?.join(', ') || 'N/A'}${analysis ? `, AI Summary: ${analysis.relationshipSummary || 'N/A'}` : ''}`;
      }).join('\n')
    : 'No match history.';

  const timelineContext = data.timeline.length > 0
    ? data.timeline.slice(0, 15).map((t, i) => `${i + 1}. [${t.date}] ${t.type}: ${t.title} — ${t.description}`).join('\n')
    : 'No timeline events recorded.';

  // Count statuses for context
  const matchStatusCounts = data.matches.reduce((acc: Record<string, number>, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  onProgress?.('Preparing briefing...');

  // Step 3: Generate AI brief
  const systemPrompt = `You are an AI assistant for a premium matchmaking service. Generate a comprehensive meeting preparation brief for a matchmaker who is about to meet with a customer.

You will receive the customer's full profile, their match history (including accepts, declines, and pending), notes from previous interactions, and a timeline of activities.

Your job is to synthesize all this information chronologically and produce a structured briefing that helps the matchmaker prepare for a productive meeting.

Return a strictly formatted JSON object:
{
  "executiveSummary": "<3-4 sentence high-level overview of the customer and their journey>",
  "currentSituation": "<2-3 sentence summary of recent activity and current status>",
  "keyDiscussionTopics": ["<array of 4-5 specific topics to discuss during the meeting>"],
  "importantConcerns": ["<array of 2-4 potential risks, blockers, or unresolved issues>"],
  "suggestedQuestions": ["<array of 5-6 tailored questions the matchmaker should ask>"],
  "recommendedNextSteps": ["<array of 3-4 specific actions recommended after the meeting>"],
  "matchmakingOpportunities": ["<array of 2-3 areas where strong matches may exist based on the data>"]
}`;

  const userPrompt = `
CUSTOMER PROFILE:
Name: ${customer.firstName} ${customer.lastName}
Age: ${customer.age} | Gender: ${customer.gender}
Location: ${customer.city}, ${customer.state}, ${customer.country}
Religion: ${customer.religion} | Caste: ${customer.caste}
Profession: ${customer.designation || customer.profession}
Company: ${customer.currentCompany || customer.company}
Education: ${customer.undergraduateDegree}
Income: ${customer.annualIncome || customer.income}
Status: ${customer.status}
Joined: ${customer.joinedDate}
Last Active: ${customer.lastActive}
Looking For: ${customer.lookingFor}
Marriage Readiness: ${customer.marriageReadiness}
Family Orientation: ${customer.familyOrientation}
Lifestyle: ${customer.lifestyleType}
Career Focus: ${customer.careerFocus}
Deal Breakers: ${(customer.dealBreakers || []).join(', ') || 'None listed'}
Top Priorities: ${(customer.topPriorities || []).join(', ') || 'None listed'}
About: ${(customer.aboutMe || customer.bio || '').substring(0, 400)}
Expectations: ${(customer.expectationsFromPartner || '').substring(0, 400)}
Preferred Age: ${customer.preferredAgeMin || '?'}-${customer.preferredAgeMax || '?'}
Preferred Cities: ${customer.preferredCities?.join(', ') || 'Any'}
Open to Relocate: ${customer.openToRelocate || 'Unknown'}

MATCH HISTORY (${data.matches.length} total):
${Object.entries(matchStatusCounts).map(([status, count]) => `- ${status}: ${count}`).join('\n')}
${matchesContext}

NOTES FROM PREVIOUS INTERACTIONS:
${notesContext}

TIMELINE OF ACTIVITIES (chronological):
${timelineContext}
`;

  const fallbackBrief = buildFallbackBrief(customer, data);

  const fallbackData = {
    executiveSummary: fallbackBrief.executiveSummary,
    currentSituation: fallbackBrief.currentSituation,
    keyDiscussionTopics: fallbackBrief.keyDiscussionTopics,
    importantConcerns: fallbackBrief.importantConcerns,
    suggestedQuestions: fallbackBrief.suggestedQuestions,
    recommendedNextSteps: fallbackBrief.recommendedNextSteps,
    matchmakingOpportunities: fallbackBrief.matchmakingOpportunities,
  };

  try {
    const result = await callGroqWithJson<{
      executiveSummary: string;
      currentSituation: string;
      keyDiscussionTopics: string[];
      importantConcerns: string[];
      suggestedQuestions: string[];
      recommendedNextSteps: string[];
      matchmakingOpportunities: string[];
    }>(systemPrompt, userPrompt, fallbackData);

    // Check if AI actually produced content or we got fallback
    const isAI = result.executiveSummary !== fallbackBrief.executiveSummary;

    const brief: MeetingBrief = {
      ...result,
      isAIGenerated: isAI,
    };

    // Cache
    setCachedBrief(customer.id, customerUpdatedAt, data.notes.length, data.matches.length, brief);

    return brief;
  } catch (err) {
    console.error('Brief generation failed:', err);
    // Cache even the fallback
    setCachedBrief(customer.id, customerUpdatedAt, data.notes.length, data.matches.length, fallbackBrief);
    return fallbackBrief;
  }
}
