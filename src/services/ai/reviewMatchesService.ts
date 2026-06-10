/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Customer } from '@/types';
import { callGroqWithJson } from './groqClient';
import { matchEngine } from './matchEngine';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MatchRecommendation {
  candidateId: string;
  compatibilityScore: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  strengths: string[];
  concerns: string[];
  recommendedAction: string;
  reasoning: string;
}

export interface CustomerSummary {
  name: string;
  age: number;
  location: string;
  profession: string;
  preferences: string;
  profileCompletionStatus: string;
}

export interface AIInsights {
  overallProfileAssessment: string;
  matchReadinessAssessment: string;
  importantObservations: string[];
  suggestedPriorities: string[];
}

export interface ReviewMatchesResult {
  customerSummary: CustomerSummary;
  aiInsights: AIInsights;
  recommendations: MatchRecommendation[];
  isAIGenerated: boolean;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry {
  data: ReviewMatchesResult;
  customerUpdatedAt: string;
  candidateCount: number;
  timestamp: number;
}

const reviewCache = new Map<string, CacheEntry>();
const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes hard cap

function getCacheKey(customerId: string): string {
  return `review_${customerId}`;
}

function getCachedResult(
  customerId: string,
  customerUpdatedAt: string,
  candidateCount: number
): ReviewMatchesResult | null {
  const key = getCacheKey(customerId);
  const entry = reviewCache.get(key);
  if (!entry) return null;

  // Invalidate if profile changed or candidate pool size changed significantly
  if (entry.customerUpdatedAt !== customerUpdatedAt) return null;
  if (Math.abs(entry.candidateCount - candidateCount) > 5) return null;
  if (Date.now() - entry.timestamp > CACHE_MAX_AGE_MS) return null;

  return entry.data;
}

function setCachedResult(
  customerId: string,
  customerUpdatedAt: string,
  candidateCount: number,
  data: ReviewMatchesResult
): void {
  const key = getCacheKey(customerId);
  reviewCache.set(key, {
    data,
    customerUpdatedAt,
    candidateCount,
    timestamp: Date.now(),
  });
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Build a customer summary from profile data (no AI needed).
 */
function buildCustomerSummary(customer: Customer): CustomerSummary {
  const filledFields = [
    customer.firstName, customer.lastName, customer.age, customer.gender,
    customer.city, customer.designation || customer.profession,
    customer.religion, customer.aboutMe || customer.bio,
    customer.expectationsFromPartner, customer.lookingFor,
    customer.undergraduateDegree, customer.annualIncome || customer.income,
  ].filter(Boolean).length;
  const totalFields = 12;
  const pct = Math.round((filledFields / totalFields) * 100);

  return {
    name: `${customer.firstName} ${customer.lastName}`,
    age: customer.age,
    location: [customer.city, customer.state, customer.country].filter(Boolean).join(', '),
    profession: customer.designation || customer.profession || 'Not specified',
    preferences: [
      customer.lookingFor && `Looking for: ${customer.lookingFor}`,
      customer.preferredAgeMin && customer.preferredAgeMax && `Age range: ${customer.preferredAgeMin}-${customer.preferredAgeMax}`,
      customer.preferredCities?.length && `Preferred cities: ${customer.preferredCities.join(', ')}`,
      customer.religion && `Religion: ${customer.religion}`,
    ].filter(Boolean).join(' • '),
    profileCompletionStatus: pct >= 90 ? 'Complete' : pct >= 60 ? 'Mostly Complete' : 'Incomplete',
  };
}

/**
 * Deterministic pre-filtering and scoring of candidates.
 * Returns top N candidates sorted by score descending.
 */
function rankCandidatesDeterministically(
  customer: Customer,
  allCustomers: Customer[],
  topN: number = 8
): { candidate: Customer; score: number }[] {
  const primaryGender = (customer.gender || '').toLowerCase();

  // Filter: opposite gender only, no self-match
  const candidates = allCustomers.filter(c => {
    if (c.id === customer.id) return false;
    const cGender = (c.gender || '').toLowerCase();
    if (!primaryGender || !cGender) return false;
    if (primaryGender === cGender) return false;
    return true;
  });

  // Score every candidate deterministically
  const scored = candidates.map(candidate => ({
    candidate,
    score: matchEngine.calculateDeterministicScore(customer, candidate),
  }));

  // Sort descending by score and take topN
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN);
}

/**
 * Enhance top-ranked candidates with Groq AI analysis.
 * Falls back to deterministic data if AI is unavailable.
 */
async function enhanceWithAI(
  customer: Customer,
  rankedCandidates: { candidate: Customer; score: number }[]
): Promise<{ recommendations: MatchRecommendation[]; aiInsights: AIInsights; isAIGenerated: boolean }> {
  // Build candidate summaries for the prompt
  const candidateSummaries = rankedCandidates.map(({ candidate, score }, index) => `
Candidate ${index + 1} (ID: ${candidate.id}):
Name: ${candidate.firstName} ${candidate.lastName}
Age: ${candidate.age}
Location: ${candidate.city}, ${candidate.country}
Religion: ${candidate.religion}
Profession: ${candidate.designation || candidate.profession}
Education: ${candidate.undergraduateDegree}
Goal: ${candidate.lookingFor}
Family Orientation: ${candidate.familyOrientation}
Lifestyle: ${candidate.lifestyleType}
About: ${(candidate.aboutMe || candidate.bio || '').substring(0, 200)}
Expectations: ${(candidate.expectationsFromPartner || '').substring(0, 200)}
Deterministic Score: ${score}/100
`).join('\n---\n');

  const systemPrompt = `You are an expert AI matchmaker assistant. You are given a primary customer and a set of pre-ranked candidate profiles (already filtered and scored by a compatibility engine).

Your job is to:
1. Provide insights about the primary customer's profile and match readiness.
2. For each candidate, analyze compatibility deeply — explain WHY they match, identify concerns, and recommend a next action.
3. Assign a confidence level (High, Medium, or Low) based on how strongly you believe in each recommendation.

Return a strictly formatted JSON object with this schema:
{
  "aiInsights": {
    "overallProfileAssessment": "<1-2 sentence assessment of the primary customer's profile quality>",
    "matchReadinessAssessment": "<1 sentence on how ready this customer is for matching>",
    "importantObservations": ["<array of 2-3 key observations about the customer>"],
    "suggestedPriorities": ["<array of 2-3 actionable priorities for the matchmaker>"]
  },
  "recommendations": [
    {
      "candidateId": "<the candidate ID from the input>",
      "compatibilityScore": <number 0-100, use the deterministic score as baseline and adjust based on deeper analysis>,
      "confidenceLevel": "<High, Medium, or Low>",
      "strengths": ["<array of 2-3 specific match strengths>"],
      "concerns": ["<array of 1-2 potential concerns>"],
      "recommendedAction": "<specific next action e.g. 'Schedule introductory call', 'Send profile for review'>",
      "reasoning": "<1-2 sentence explanation of why this match works>"
    }
  ]
}

Order recommendations by your assessment of match quality (best first).`;

  const userPrompt = `
Primary Customer:
Name: ${customer.firstName} ${customer.lastName}
Age: ${customer.age}
Gender: ${customer.gender}
Location: ${customer.city}, ${customer.state}, ${customer.country}
Religion: ${customer.religion}
Profession: ${customer.designation || customer.profession}
Education: ${customer.undergraduateDegree}
Income: ${customer.annualIncome || customer.income}
Goal: ${customer.lookingFor}
Family Orientation: ${customer.familyOrientation}
Lifestyle: ${customer.lifestyleType}
Career Focus: ${customer.careerFocus}
Marriage Readiness: ${customer.marriageReadiness}
About: ${(customer.aboutMe || customer.bio || '').substring(0, 300)}
Expectations: ${(customer.expectationsFromPartner || '').substring(0, 300)}
Deal Breakers: ${(customer.dealBreakers || []).join(', ')}
Top Priorities: ${(customer.topPriorities || []).join(', ')}

--- CANDIDATES (Pre-ranked by compatibility engine) ---
${candidateSummaries}
`;

  // Build fallback data from deterministic scores
  const fallbackRecommendations: MatchRecommendation[] = rankedCandidates.map(({ candidate, score }) => ({
    candidateId: candidate.id,
    compatibilityScore: score,
    confidenceLevel: (score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
    strengths: ['Compatible demographic profile', 'Similar lifestyle preferences'],
    concerns: ['Detailed AI analysis unavailable — manual review recommended'],
    recommendedAction: score >= 70 ? 'Consider for introduction' : 'Review profile manually',
    reasoning: `Deterministic compatibility score of ${score}/100 based on profile alignment.`,
  }));

  const fallbackInsights: AIInsights = {
    overallProfileAssessment: 'Profile analysis requires AI service — displaying basic assessment.',
    matchReadinessAssessment: customer.status === 'Active Matching' ? 'Customer is in active matching phase.' : 'Review customer status before proceeding.',
    importantObservations: ['AI insights unavailable — review profile manually', 'Deterministic scores are being used for ranking'],
    suggestedPriorities: ['Review top candidates manually', 'Schedule a profile review call'],
  };

  const fallbackData = {
    aiInsights: fallbackInsights,
    recommendations: fallbackRecommendations,
  };

  try {
    const result = await callGroqWithJson<{
      aiInsights: AIInsights;
      recommendations: MatchRecommendation[];
    }>(systemPrompt, userPrompt, fallbackData);

    // Check if we actually got AI data or fallback
    const isAI = result.recommendations.some(r => 
      r.reasoning && !r.reasoning.includes('Deterministic compatibility score')
    );

    // Ensure candidateIds are preserved and valid
    const validCandidateIds = new Set(rankedCandidates.map(r => r.candidate.id));
    const validRecs = result.recommendations
      .filter(r => validCandidateIds.has(r.candidateId))
      .map(r => ({
        ...r,
        // Clamp scores
        compatibilityScore: Math.max(0, Math.min(100, r.compatibilityScore)),
        confidenceLevel: (['High', 'Medium', 'Low'].includes(r.confidenceLevel)
          ? r.confidenceLevel
          : 'Medium') as 'High' | 'Medium' | 'Low',
      }));

    return {
      recommendations: validRecs.length > 0 ? validRecs : fallbackRecommendations,
      aiInsights: result.aiInsights || fallbackInsights,
      isAIGenerated: isAI,
    };
  } catch (err) {
    console.error('AI enhancement failed:', err);
    return {
      recommendations: fallbackRecommendations,
      aiInsights: fallbackInsights,
      isAIGenerated: false,
    };
  }
}

/**
 * Main entry point: Review Matches for a customer.
 * 1. Build customer summary (deterministic)
 * 2. Rank candidates deterministically
 * 3. Enhance top candidates with AI
 * 4. Return combined result
 */
export async function reviewMatches(
  customer: Customer,
  allCustomers: Customer[]
): Promise<ReviewMatchesResult> {
  const customerUpdatedAt = customer.lastActive || customer.joinedDate || '';

  // Check cache first
  const cached = getCachedResult(customer.id, customerUpdatedAt, allCustomers.length);
  if (cached) {
    console.log('Review Matches: returning cached result for', customer.id);
    return cached;
  }

  // Step 1: Customer summary (no AI)
  const customerSummary = buildCustomerSummary(customer);

  // Step 2: Deterministic ranking
  const rankedCandidates = rankCandidatesDeterministically(customer, allCustomers, 8);

  if (rankedCandidates.length === 0) {
    const emptyResult: ReviewMatchesResult = {
      customerSummary,
      aiInsights: {
        overallProfileAssessment: 'No compatible candidates found in the current pool.',
        matchReadinessAssessment: 'Expand the candidate pool or adjust preferences.',
        importantObservations: ['No opposite-gender candidates available'],
        suggestedPriorities: ['Add more candidate profiles to the system'],
      },
      recommendations: [],
      isAIGenerated: false,
    };
    return emptyResult;
  }

  // Step 3: AI enhancement (top candidates only)
  const { recommendations, aiInsights, isAIGenerated } = await enhanceWithAI(customer, rankedCandidates);

  const result: ReviewMatchesResult = {
    customerSummary,
    aiInsights,
    recommendations,
    isAIGenerated,
  };

  // Cache result
  setCachedResult(customer.id, customerUpdatedAt, allCustomers.length, result);

  return result;
}
