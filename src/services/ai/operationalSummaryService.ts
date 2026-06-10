import { callGroqWithJson } from './groqClient';

export interface OperationalSummary {
  biggestRisk: string;
  biggestOpportunity: string;
  recommendedFirstAction: string;
  reason: string;
}

export async function generateOperationalSummary(
  healthMetrics: {
    customersRequiringAttention: number;
    highConfidencePending: number;
    overdueFollowUps: number;
    profilesAwaitingVerification: number;
    meetingsScheduledToday: number;
    newProfilesThisWeek: number;
  },
  topPriorityCustomerName?: string
): Promise<OperationalSummary> {
  const prompt = `
You are the AI Command Center for a matchmaker.
Based on the current health metrics, generate a short, punchy "Today's Focus" summary.

Metrics:
- Customers Requiring Attention: ${healthMetrics.customersRequiringAttention}
- High Confidence Matches Pending: ${healthMetrics.highConfidencePending}
- Overdue Follow-Ups: ${healthMetrics.overdueFollowUps}
- Awaiting Verification: ${healthMetrics.profilesAwaitingVerification}
- Meetings Today: ${healthMetrics.meetingsScheduledToday}
${topPriorityCustomerName ? `- Top Priority Customer: ${topPriorityCustomerName}` : ''}

Rules:
1. 'biggestRisk' should highlight the most critical pending issue (e.g., overdue follow-ups or unattended profiles).
2. 'biggestOpportunity' should highlight positive pending actions (e.g., high-confidence matches).
3. 'recommendedFirstAction' should tell them exactly what to do first. E.g., "Review [Customer Name]".
4. 'reason' should be a 1-sentence explanation of why this is the best first action.

Return EXACTLY the following JSON format:
{
  "biggestRisk": "3 profiles have been waiting over 7 days.",
  "biggestOpportunity": "2 high-confidence matches ready to send.",
  "recommendedFirstAction": "Review Aarav Joshi's profile.",
  "reason": "Aarav has been waiting the longest and has a high priority score."
}
`;

  const fallbackSummary: OperationalSummary = {
    biggestRisk: healthMetrics.overdueFollowUps > 0 
      ? `${healthMetrics.overdueFollowUps} overdue follow-ups require immediate attention.`
      : `${healthMetrics.customersRequiringAttention} customers require attention.`,
    biggestOpportunity: healthMetrics.highConfidencePending > 0
      ? `${healthMetrics.highConfidencePending} high-confidence matches are pending review.`
      : `${healthMetrics.newProfilesThisWeek} new profiles added this week.`,
    recommendedFirstAction: topPriorityCustomerName 
      ? `Review highest priority customer: ${topPriorityCustomerName}`
      : "Review your calendar events.",
    reason: "Addressing top priority customers prevents service level drops."
  };

  try {
    const result = await callGroqWithJson<OperationalSummary>(
      "You are an expert matchmaking operations AI.",
      prompt,
      fallbackSummary
    );
    return result;
  } catch (e) {
    console.error("Failed to generate operational summary via AI:", e);
    return fallbackSummary;
  }
}
