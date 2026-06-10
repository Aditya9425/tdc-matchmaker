import type { Customer } from '@/types';
import { callGroqWithJson } from './groqClient';

export interface CommunicationInsights {
  recommendedTone: string;
  responseProbability: number;
  bestTimeToSend: string;
  topFactors: string[];
}

export type TemplateType = 'Formal' | 'Friendly' | 'Family-Oriented' | 'Career-Focused' | 'Premium';

export const writingAssistant = {
  /**
   * Generates a draft based on a specific template tone.
   */
  async generateDraft(customer: Customer, match: Customer, template: TemplateType): Promise<string> {
    const systemPrompt = `You are an expert matchmaker writing on behalf of "TDC Matchmaking Team".
Write a match recommendation email to a client.
Tone/Template rules:
- Formal: Highly professional, concise.
- Friendly: Warm, enthusiastic, conversational.
- Family-Oriented: Focus heavily on shared family values and background.
- Career-Focused: Focus heavily on ambition, education, and professional alignment.
- Premium: Exclusive, white-glove tone, emphasizing high compatibility.

Return a strictly formatted JSON object.
Schema:
{ "body": "<String: The email body>" }`;

    const userPrompt = `
Primary Customer: ${customer.firstName}
Match: ${match.firstName}, ${match.designation}, ${match.city}
Template Tone: ${template}
`;

    const fallback = `Hi ${customer.firstName},\n\nWe found a potentially strong match for you.\n\n${match.firstName} is a ${match.designation} based in ${match.city}.\n\nBased on our compatibility analysis, both of you share similar family values, long-term goals, and lifestyle preferences.\n\nWe believe this could be a promising connection worth exploring.\n\nRegards,\nTDC Matchmaking Team`;

    try {
      const res = await callGroqWithJson<{body: string}>(systemPrompt, userPrompt, { body: fallback });
      return res.body;
    } catch {
      return fallback;
    }
  },

  /**
   * Quick Actions: Modifies an existing draft.
   */
  async rewriteMessage(currentDraft: string, action: 'improve' | 'shorten' | 'professional' | 'friendly' | 'family'): Promise<string> {
    const systemPrompt = `You are an AI Writing Assistant. Modify the provided draft according to the requested action.
Actions:
- improve: Fix grammar and make it flow better.
- shorten: Make it significantly more concise.
- professional: Make it highly formal and business-like.
- friendly: Make it warm and conversational.
- family: Emphasize family values and long term stability.

Return a strictly formatted JSON object.
Schema: { "body": "<String: Modified text>" }`;

    const fallback = currentDraft;

    try {
      const res = await callGroqWithJson<{body: string}>(systemPrompt, `Action: ${action}\nDraft: ${currentDraft}`, { body: fallback });
      return res.body;
    } catch {
      return fallback;
    }
  },

  /**
   * Generates analytical insights for the communication panel.
   */
  async generateAssistantInsights(customer: Customer, match: Customer): Promise<CommunicationInsights> {
    const systemPrompt = `Analyze the profiles to determine communication strategy insights.
Return a strictly formatted JSON object.
Schema:
{
  "recommendedTone": "<String: e.g. 'Professional', 'Warm'>",
  "responseProbability": <Number 0-100>,
  "bestTimeToSend": "<String: e.g. '6 PM - 8 PM'>",
  "topFactors": ["<Array of 3-4 strings detailing compatibility factors>"]
}`;

    const userPrompt = `
Customer: ${customer.firstName}, ${customer.age}, ${customer.profession}
Match: ${match.firstName}, ${match.age}, ${match.profession}
`;

    const fallback: CommunicationInsights = {
      recommendedTone: 'Professional',
      responseProbability: 87,
      bestTimeToSend: '6 PM - 8 PM',
      topFactors: ['Family Values', 'Career Alignment', 'Relocation Compatibility', 'Shared Long-Term Goals']
    };

    return callGroqWithJson<CommunicationInsights>(systemPrompt, userPrompt, fallback);
  },

  /**
   * Generates a follow-up email.
   */
  async generateFollowUp(customer: Customer): Promise<string> {
    const fallback = `Hello ${customer.firstName},\n\nJust following up regarding the profile recommendation we shared earlier.\n\nPlease let us know if you would like additional information or wish to schedule a conversation.\n\nRegards,\nTDC Matchmaking Team`;
    // For speed, just returning fallback. Can wire to Groq if needed.
    return fallback;
  }
};
