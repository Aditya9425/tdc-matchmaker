import type { Customer } from '@/types';
import { callGroqWithJson } from './groqClient';

export interface RelationshipSnapshot {
  relationshipGoal: string;
  familyOrientation: string;
  lifestyleAlignment: string;
  careerFocus: string;
  flexibility: string;
  marriageReadiness: string;
}

export interface ProfileCompleteness {
  completionPercentage: number;
  missingFields: string[];
}

export interface NotesSummary {
  summary: string;
  actionItems: string[];
}

export const profileAnalysis = {
  /**
   * Feature 5: AI Relationship Snapshot
   */
  async generateSnapshot(customer: Customer): Promise<RelationshipSnapshot> {
    const systemPrompt = `Analyze the provided customer profile and extract a high-level psychological and lifestyle snapshot.
Return a strictly formatted JSON object with short 1-3 word categorical values for each field.
Schema:
{
  "relationshipGoal": "<e.g., 'Long-term', 'Casual', 'Immediate Marriage'>",
  "familyOrientation": "<e.g., 'Traditional', 'Modern', 'Nuclear preferred'>",
  "lifestyleAlignment": "<e.g., 'Active/Outdoors', 'Homebody', 'Socialite'>",
  "careerFocus": "<e.g., 'Highly Ambitious', 'Work-life balance'>",
  "flexibility": "<e.g., 'High', 'Moderate', 'Rigid'>",
  "marriageReadiness": "<e.g., 'Ready now', 'Exploring', '1-2 Years'>"
}`;

    const userPrompt = `
Name: ${customer.firstName}
Age: ${customer.age}
Goal: ${customer.lookingFor}
Family: ${customer.familyType}, ${customer.familyStatus}
Career: ${customer.careerGoals}, ${customer.designation}
About: ${customer.aboutMe}
Expectations: ${customer.expectationsFromPartner}
`;

    const fallback: RelationshipSnapshot = {
      relationshipGoal: 'Long-term',
      familyOrientation: 'Balanced',
      lifestyleAlignment: 'Moderate',
      careerFocus: 'Professional',
      flexibility: 'Moderate',
      marriageReadiness: 'Exploring'
    };

    return callGroqWithJson<RelationshipSnapshot>(systemPrompt, userPrompt, fallback);
  },

  /**
   * Feature 9: AI-Powered Notes Summary
   */
  async summarizeNotes(rawNotes: string): Promise<NotesSummary> {
    const systemPrompt = `You are a matchmaker assistant. Summarize raw notes taken during a client call into a concise summary and extract action items.
Schema:
{
  "summary": "<String: 2-3 sentences summarizing the notes>",
  "actionItems": ["<Array of strings: specific actions to take>"]
}`;

    const fallback: NotesSummary = {
      summary: rawNotes.substring(0, 100) + '...',
      actionItems: ['Review notes manually']
    };

    return callGroqWithJson<NotesSummary>(systemPrompt, rawNotes, fallback);
  },

  /**
   * Feature 10: Profile Completeness Analysis
   */
  async analyzeCompleteness(customer: Partial<Customer>): Promise<ProfileCompleteness> {
    // This could just be deterministic, but requested via AI for nuance
    const systemPrompt = `Analyze the provided JSON object of a customer profile. Determine the completion percentage based on the presence of critical matchmaking fields (education, income, preferences, bio). Identify missing key fields.
Schema:
{
  "completionPercentage": <Number 0-100>,
  "missingFields": ["<Array of missing field names formatted nicely, e.g. 'Annual Income'>"]
}`;

    const fallback: ProfileCompleteness = {
      completionPercentage: 80,
      missingFields: ['AI Analysis Unavailable']
    };

    return callGroqWithJson<ProfileCompleteness>(systemPrompt, JSON.stringify(customer), fallback);
  }
};
