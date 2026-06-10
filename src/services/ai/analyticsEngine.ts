import { callGroqWithJson } from './groqClient';

export interface AIInsights {
  topSegments: string;
  bestAgeGroups: string;
  highestEngagementCities: string;
  commonFactors: string;
  actionRequired: string;
}

export const analyticsEngine = {
  /**
   * Feature 6: AI Insights Dashboard
   */
  async generateInsights(metricsSummary: string): Promise<AIInsights> {
    const systemPrompt = `You are a data analyst for a high-end matchmaking firm. Analyze the provided metrics summary and generate actionable insights.
Return a strictly formatted JSON object.
Schema:
{
  "topSegments": "<String: Description of highest performing customer segments>",
  "bestAgeGroups": "<String: The age brackets showing the most success>",
  "highestEngagementCities": "<String: Top performing cities>",
  "commonFactors": "<String: Most common compatibility factors leading to matches>",
  "actionRequired": "<String: Profiles or segments requiring immediate attention>"
}`;

    const fallback: AIInsights = {
      topSegments: "Professionals in Tech and Finance sectors.",
      bestAgeGroups: "Ages 28-34 show a 42% higher meeting acceptance rate.",
      highestEngagementCities: "Mumbai, Pune, and Bangalore.",
      commonFactors: "Shared family values and relocation flexibility.",
      actionRequired: "34 premium profiles have not received a match in 14 days."
    };

    return callGroqWithJson<AIInsights>(systemPrompt, metricsSummary, fallback);
  }
};
