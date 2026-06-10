import type { Customer } from '@/types';
import { callGroqWithJson } from './groqClient';

export interface CompatibilitySummary {
  strengths: string[];
  risks: string[];
  overallRecommendation: string;
}

export const compatibilityEngine = {
  /**
   * Feature 2: AI Compatibility Analysis
   * Generates deep compatibility summary for a suggested match.
   */
  async analyzeCompatibility(customer: Customer, candidate: Customer): Promise<CompatibilitySummary> {
    const systemPrompt = `You are a professional matchmaking analyst. Compare the two profiles provided and return a strictly formatted JSON object analyzing their compatibility.
Schema:
{
  "strengths": ["<Array of 3-4 core strengths: e.g. 'Shared family values', 'Similar education'>"],
  "risks": ["<Array of 1-3 potential risks: e.g. 'Different relocation plans'>"],
  "overallRecommendation": "<Short 3-5 word summary label: e.g. 'High Potential Match'>"
}`;

    const userPrompt = `
Profile 1:
${customer.firstName}, ${customer.age}, ${customer.city}
Education: ${customer.undergraduateDegree}
Profession: ${customer.designation}
Religion: ${customer.religion}
Lifestyle: ${customer.diet}, ${customer.smoking}, ${customer.drinking}
About: ${customer.aboutMe}

Profile 2:
${candidate.firstName}, ${candidate.age}, ${candidate.city}
Education: ${candidate.undergraduateDegree}
Profession: ${candidate.designation}
Religion: ${candidate.religion}
Lifestyle: ${candidate.diet}, ${candidate.smoking}, ${candidate.drinking}
About: ${candidate.aboutMe}
`;

    const fallbackData: CompatibilitySummary = {
      strengths: ['Compatible demographic profiles'],
      risks: ['Pending manual review'],
      overallRecommendation: 'Pending Analysis'
    };

    return callGroqWithJson<CompatibilitySummary>(systemPrompt, userPrompt, fallbackData);
  }
};
