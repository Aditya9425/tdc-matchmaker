import type { Customer, Match, CalendarEvent } from '@/types';

export interface PriorityEvaluation {
  score: number; // 0 to 5
  reasons: string[];
}

/**
 * Unified Priority Engine
 * A customer requires attention when priorityScore >= 3.
 */
export function calculateCustomerPriority(
  customer: Customer,
  customerMatches: Match[],
  customerEvents: CalendarEvent[]
): PriorityEvaluation {
  let score = 0;
  const reasons: string[] = [];

  // 1. Inactivity (No matches or activity recently)
  const daysSinceActive = Math.floor((new Date().getTime() - new Date(customer.lastActive).getTime()) / (1000 * 3600 * 24));
  
  if (daysSinceActive > 14) {
    score += 2;
    reasons.push(`Inactive for ${daysSinceActive} days`);
  } else if (daysSinceActive > 7) {
    score += 1;
    reasons.push(`Inactive for ${daysSinceActive} days`);
  }

  // 2. Pending High-Confidence Matches
  const pendingHighConfidenceMatches = customerMatches.filter(
    m => m.status === 'suggested' && m.compatibilityScore >= 90
  );
  if (pendingHighConfidenceMatches.length > 0) {
    score += 2;
    reasons.push(`${pendingHighConfidenceMatches.length} high-confidence match(es) pending review`);
  }

  // 3. Status-based Priority
  if (customer.status === 'Profile Review') {
    score += 2;
    reasons.push('Profile pending review');
  }

  // 4. Verification
  if (!customer.verified) {
    score += 1;
    reasons.push('Profile awaiting verification');
  }

  // 5. Overdue Meetings/Follow-ups
  const overdueEvents = customerEvents.filter(
    e => e.status === 'Pending' && new Date(e.date + 'T' + e.startTime).getTime() < new Date().getTime()
  );
  if (overdueEvents.length > 0) {
    score += 2;
    reasons.push(`${overdueEvents.length} overdue follow-up(s)`);
  }

  return {
    score: Math.min(score, 5), // Cap at 5
    reasons
  };
}
