import { callGroqWithJson } from './groqClient';
import type { Customer } from '@/types';

export interface AIMatchReport {
  executiveSummary: string;
  compatibilityScore: number;
  keyStrengths: string[];
  potentialConcerns: string[];
  familyCompatibility: string;
  lifestyleCompatibility: string;
  careerAlignment: string;
  locationAnalysis: string;
  suggestedDiscussionTopics: string[];
  recommendedNextAction: string;
}

export async function generateMatchReport(
  primaryCustomer: Customer,
  candidateCustomer: Customer
): Promise<AIMatchReport> {
  const prompt = `
You are an elite matchmaker's AI assistant.
Your task is to generate a comprehensive, deep-dive Match Report between two customers.

Primary Customer:
${JSON.stringify({
  name: primaryCustomer.firstName + ' ' + primaryCustomer.lastName,
  age: primaryCustomer.age,
  location: primaryCustomer.city + ', ' + primaryCustomer.country,
  profession: primaryCustomer.profession,
  familyType: primaryCustomer.familyType,
  lifestyle: primaryCustomer.diet + ', ' + primaryCustomer.drinking,
  preferences: primaryCustomer.expectationsFromPartner
}, null, 2)}

Candidate:
${JSON.stringify({
  name: candidateCustomer.firstName + ' ' + candidateCustomer.lastName,
  age: candidateCustomer.age,
  location: candidateCustomer.city + ', ' + candidateCustomer.country,
  profession: candidateCustomer.profession,
  familyType: candidateCustomer.familyType,
  lifestyle: candidateCustomer.diet + ', ' + candidateCustomer.drinking,
  preferences: candidateCustomer.expectationsFromPartner
}, null, 2)}

Analyze their compatibility across all dimensions and provide a highly detailed report.

Return EXACTLY the following JSON format:
{
  "executiveSummary": "A 2-3 sentence summary of why this match works (or doesn't).",
  "compatibilityScore": 85, // 0 to 100
  "keyStrengths": ["Strength 1", "Strength 2"],
  "potentialConcerns": ["Concern 1", "Concern 2"],
  "familyCompatibility": "Analysis of their family backgrounds and goals.",
  "lifestyleCompatibility": "Analysis of diet, habits, and daily life.",
  "careerAlignment": "Analysis of their professional trajectories and ambition.",
  "locationAnalysis": "Analysis of where they live and relocation preferences.",
  "suggestedDiscussionTopics": ["Topic 1 to break the ice", "Topic 2 to address a concern"],
  "recommendedNextAction": "E.g., Schedule an introductory call."
}
`;

  const systemPrompt = `You are an elite matchmaker's AI producing detailed match reports.`;

  try {
    const result = await callGroqWithJson<AIMatchReport>(
      systemPrompt, 
      prompt,
      {
        executiveSummary: "Unable to generate report.",
        compatibilityScore: 0,
        keyStrengths: [],
        potentialConcerns: [],
        familyCompatibility: "",
        lifestyleCompatibility: "",
        careerAlignment: "",
        locationAnalysis: "",
        suggestedDiscussionTopics: [],
        recommendedNextAction: ""
      }
    );
    return result;
  } catch (error) {
    console.error("Failed to generate match report via AI:", error);
    throw new Error('Failed to generate match report.');
  }
}
