import { callGroqWithJson } from './groqClient';
import type { AnalyticsData } from '@/types';

export interface DailyInsight {
  insight: string;
  evidence: string;
  recommendation: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
}

export async function generateDailyInsight(analytics: AnalyticsData): Promise<DailyInsight> {
  const prompt = `
You are an expert matchmaking business analyst and operational command center AI.
Analyze the following metrics from the matchmaking platform and generate ONE high-value, actionable business insight.

Platform Metrics:
- Total Customers: ${analytics.customersManaged}
- Total Matches Sent: ${analytics.matchesSent}
- Successful Matches: ${analytics.successfulMatches}
- Overall Success Rate: ${analytics.successRate}%
- Weekly Changes: +${analytics.weeklyChange.customers} customers, +${analytics.weeklyChange.matches} matches, +${analytics.weeklyChange.meetings} meetings
- Top Locations: ${analytics.topLocations.map(l => `${l.city} (${l.count} users, ${l.successRate}% success)`).join(', ')}

Rules for Insight:
1. MUST reference actual platform numbers and percentages.
2. MUST NOT generate broad, generic industry observations (e.g. "Cities with smaller user bases have higher success rates" is BAD).
3. MUST identify a specific bottleneck, opportunity, or anomaly.
4. MUST provide an actionable recommendation that a matchmaker can do TODAY.

Return the response in the following JSON format EXACTLY:
{
  "insight": "A concise actionable observation based ONLY on the provided data. E.g. '14 profiles waiting more than 10 days...'",
  "evidence": "A short sentence highlighting the specific supporting numbers.",
  "recommendation": "A specific action the matchmaker should take today to address this insight.",
  "confidence": 92, // An integer between 50 and 99 representing confidence in this insight
  "trend": "up" // "up", "down", or "stable"
}
`;

  const systemPrompt = `You are an expert matchmaking business analyst.`;

  try {
    const result = await callGroqWithJson<{
      insight: string;
      evidence: string;
      recommendation: string;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
    }>(
      systemPrompt, 
      prompt,
      {
        insight: "Unable to generate daily insight. Please check AI connection.",
        evidence: "-",
        recommendation: "-",
        confidence: 0,
        trend: 'stable'
      }
    );

    return {
      insight: result.insight,
      evidence: result.evidence,
      recommendation: result.recommendation,
      confidence: result.confidence,
      trend: result.trend,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to generate insight via AI:", error);
    throw new Error('Failed to generate daily insight.');
  }
}
