import { callGroqWithJson } from './groqClient';
import type { DailyInsight } from './insightService';

export interface Opportunity {
  opportunity: string;
  estimatedImpact: string;
}

export interface Risk {
  risk: string;
  impact: string;
  recommendation: string;
}

export interface FullAnalyticsReport {
  insightSummary: {
    insight: string;
    evidence: string;
    recommendation: string;
    businessImpact: string;
    confidence: number;
    generatedTimestamp: string;
  };
  metrics: {
    customersRequiringAttention: number;
    highConfidencePending: number;
    overdueFollowUps: number;
    profilesAwaitingVerification: number;
    meetingsScheduledToday: number;
    newProfilesThisWeek: number;
  };
  trends: string[];
  opportunities: Opportunity[];
  risks: Risk[];
  recommendedActions: string[];
}

export async function generateFullAnalyticsReport(
  insight: DailyInsight,
  metrics: {
    customersRequiringAttention: number;
    highConfidencePending: number;
    overdueFollowUps: number;
    profilesAwaitingVerification: number;
    meetingsScheduledToday: number;
    newProfilesThisWeek: number;
  }
): Promise<FullAnalyticsReport> {
  const prompt = `
You are an expert AI Matchmaking Business Analyst.
Generate a comprehensive, actionable analytics report based on the provided daily insight and operational metrics.

Current Daily Insight:
- Insight: ${insight.insight}
- Evidence: ${insight.evidence}
- Recommendation: ${insight.recommendation}
- Confidence: ${insight.confidence}%

Platform Health Metrics:
- Customers Requiring Attention: ${metrics.customersRequiringAttention}
- High Confidence Matches Pending: ${metrics.highConfidencePending}
- Overdue Follow-Ups: ${metrics.overdueFollowUps}
- Awaiting Verification: ${metrics.profilesAwaitingVerification}
- Meetings Scheduled Today: ${metrics.meetingsScheduledToday}
- New Profiles This Week: ${metrics.newProfilesThisWeek}

Your task is to generate a structured JSON report containing:
1. "insightSummary": Enhance the daily insight with a "businessImpact" statement.
2. "trends": 3 data-driven trends inferred from the metrics.
3. "opportunities": 2 key opportunities based on the positive metrics or general operations.
4. "risks": 2 key risks based on the negative metrics (e.g., overdue follow-ups, awaiting verification).
5. "recommendedActions": Top 3 prioritized, actionable steps for the matchmaker to take immediately.

Return EXACTLY this JSON structure:
{
  "insightSummary": {
    "insight": "<original insight or enhanced>",
    "evidence": "<original evidence or enhanced>",
    "recommendation": "<original recommendation or enhanced>",
    "businessImpact": "<1 sentence on how this impacts the business>",
    "confidence": <number>
  },
  "trends": [
    "<Trend 1>",
    "<Trend 2>",
    "<Trend 3>"
  ],
  "opportunities": [
    {
      "opportunity": "<Description of opportunity>",
      "estimatedImpact": "<Estimated impact>"
    }
  ],
  "risks": [
    {
      "risk": "<Description of risk>",
      "impact": "<Potential negative impact>",
      "recommendation": "<How to mitigate>"
    }
  ],
  "recommendedActions": [
    "<Action 1>",
    "<Action 2>",
    "<Action 3>"
  ]
}
`;

  const fallbackReport: FullAnalyticsReport = {
    insightSummary: {
      insight: insight.insight,
      evidence: insight.evidence,
      recommendation: insight.recommendation,
      businessImpact: "Addresses immediate operational bottlenecks to improve overall success rate.",
      confidence: insight.confidence,
      generatedTimestamp: new Date().toISOString(),
    },
    metrics,
    trends: [
      metrics.overdueFollowUps > 0 ? "Follow-up response rates need attention." : "Follow-ups are up to date.",
      metrics.profilesAwaitingVerification > 5 ? "Verification backlog is increasing." : "Verification queue is manageable.",
      metrics.newProfilesThisWeek > 0 ? "Platform growth remains steady." : "New user acquisition is slow.",
    ],
    opportunities: [
      {
        opportunity: `${metrics.highConfidencePending} high-confidence matches pending review.`,
        estimatedImpact: "Potential 20% increase in successful introductions.",
      },
    ],
    risks: [
      {
        risk: `${metrics.profilesAwaitingVerification} profiles awaiting verification.`,
        impact: "Potential customer dissatisfaction and delayed matchmaking.",
        recommendation: "Prioritize the verification queue today.",
      },
      {
        risk: `${metrics.overdueFollowUps} overdue follow-ups.`,
        impact: "Loss of customer engagement and trust.",
        recommendation: "Clear all overdue follow-ups immediately.",
      }
    ],
    recommendedActions: [
      metrics.highConfidencePending > 0 ? "Approve pending matches" : "Review new profiles",
      metrics.overdueFollowUps > 0 ? "Complete overdue follow-ups" : "Schedule customer check-ins",
      metrics.profilesAwaitingVerification > 0 ? "Complete verification backlog" : "Review AI suggestions",
    ],
  };

  try {
    const result = await callGroqWithJson<Omit<FullAnalyticsReport, 'metrics' | 'insightSummary' & { insightSummary: { generatedTimestamp?: string } }>>(
      "You are an expert matchmaking business analyst.",
      prompt,
      fallbackReport
    );

    return {
      ...result,
      insightSummary: {
        ...result.insightSummary,
        generatedTimestamp: new Date().toISOString()
      },
      metrics // Pass metrics through to the UI
    } as FullAnalyticsReport;
  } catch (error) {
    console.error("Failed to generate full analytics report via AI:", error);
    return fallbackReport;
  }
}
