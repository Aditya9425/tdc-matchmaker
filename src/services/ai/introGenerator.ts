import type { Customer } from '@/types';
import { callGroqWithJson } from './groqClient';

export interface IntroDraft {
  subject: string;
  body: string;
}

export const introGenerator = {
  /**
   * Feature 4: Personalized Match Intro Generator
   * Drafts an email/message to the customer introducing a suggested match.
   */
  async generateIntro(customer: Customer, match: Customer, tone: 'Formal' | 'Friendly' | 'Premium' = 'Formal'): Promise<IntroDraft> {
    const toneInstructions = {
      Formal: 'Use a highly professional, respectful, and structured tone. Keep it concise and strictly business-like.',
      Friendly: 'Use a warm, conversational, and enthusiastic tone. Make it feel personal and inviting.',
      Premium: 'Use an exclusive, sophisticated, and bespoke tone. Emphasize high value and hand-picked curation.'
    };

    const systemPrompt = `You are a professional matchmaker writing an introductory email to a client on behalf of "TDC Matchmaking Team".
Tone Instruction: ${toneInstructions[tone]}

Write a personalized introduction. Use the primary customer's first name.
Mention the match's name, profession, and location.
Highlight 1-2 specific shared values or goals.
Return a strictly formatted JSON object.
Schema:
{
  "subject": "<String: Email subject line>",
  "body": "<String: The full email body, using standard newline characters for formatting>"
}`;

    const userPrompt = `
Primary Customer (Recipient):
Name: ${customer.firstName}
Values/Goals: ${customer.expectationsFromPartner}

Proposed Match:
Name: ${match.firstName}
Profession: ${match.designation}
Location: ${match.city}
Values/Goals: ${match.expectationsFromPartner}
`;

    const fallbackData: IntroDraft = {
      subject: `New Match Suggestion: Meet ${match.firstName}`,
      body: `Hi ${customer.firstName},\n\nWe found a potentially strong match for you.\n\n${match.firstName} is a ${match.designation} based in ${match.city}.\n\nWe believe this could be a promising connection based on your mutual preferences.\n\nRegards,\nTDC Matchmaking Team`
    };

    return callGroqWithJson<IntroDraft>(systemPrompt, userPrompt, fallbackData);
  }
};
