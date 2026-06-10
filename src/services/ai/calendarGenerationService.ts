import type { Customer, Match, CalendarEvent, CalendarEventType } from '@/types';
import { groq, GROQ_MODEL } from './groqClient';
import { calculateCustomerPriority } from '@/services/priorityEngine';

export function generateOperationalEvents(customers: Customer[], matches: Match[]): Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[] {
  const events: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const today = new Date().toISOString().split('T')[0];
  
  // Available time slots (spread out through the day)
  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  let timeSlotIndex = 0;

  const getNextTime = () => {
    const time = timeSlots[timeSlotIndex % timeSlots.length];
    timeSlotIndex++;
    return time;
  };

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = minutes + 30;
    const endHours = hours + Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  // 1. Verification Reviews
  const unverifiedCustomers = customers.filter(c => !c.verified);
  unverifiedCustomers.forEach(c => {
    const start = getNextTime();
    events.push({
      title: `Verify ${c.firstName} ${c.lastName}'s Profile`,
      customerId: c.id,
      customerName: `${c.firstName} ${c.lastName}`,
      date: today,
      startTime: start,
      endTime: getEndTime(start),
      type: 'Verification' as CalendarEventType,
      priority: 'High',
      status: 'Pending',
      notes: 'Profile is pending verification. Please review uploaded documents and details.',
      generatedByAI: true,
      source: 'Verification Pipeline'
    });
  });

  // 2. High Priority Follow-ups (using Priority Engine)
  customers.forEach(c => {
    // In a real scenario we'd pass existing events, but for generation we check baseline priority
    const priorityResult = calculateCustomerPriority(c, matches.filter(m => m.customerId === c.id), []);
    if (priorityResult.score >= 3 && !events.find(e => e.customerId === c.id)) {
      const start = getNextTime();
      events.push({
        title: `Follow Up With ${c.firstName} ${c.lastName}`,
        customerId: c.id,
        customerName: `${c.firstName} ${c.lastName}`,
        date: today,
        startTime: start,
        endTime: getEndTime(start),
        type: 'Follow Up' as CalendarEventType,
        priority: 'High',
        status: 'Pending',
        notes: priorityResult.reasons.join('. '),
        generatedByAI: true,
        source: 'Priority Engine'
      });
    }
  });

  // 3. High Confidence Match Reviews
  const highConfidenceMatches = matches.filter(m => m.status === 'suggested' && m.compatibilityScore >= 85);
  highConfidenceMatches.forEach(m => {
    const c = customers.find(cust => cust.id === m.customerId);
    if (!c) return;
    
    const start = getNextTime();
    events.push({
      title: `Review High Confidence Match for ${c.firstName}`,
      customerId: c.id,
      customerName: `${c.firstName} ${c.lastName}`,
      date: today,
      startTime: start,
      endTime: getEndTime(start),
      type: 'Match Review' as CalendarEventType,
      priority: 'Medium',
      status: 'Pending',
      notes: `AI detected a match with ${m.compatibilityScore}% compatibility.`,
      generatedByAI: true,
      source: 'AI Match Engine'
    });
  });

  return events;
}

export async function generateCalendarInsights(customers: Customer[], matches: Match[], events: CalendarEvent[]): Promise<string> {
  const metrics = {
    unverified: customers.filter(c => !c.verified).length,
    highPriority: customers.filter(c => calculateCustomerPriority(c, matches.filter(m => m.customerId === c.id), events.filter(e => e.customerId === c.id)).score >= 3).length,
    pendingMatches: matches.filter(m => m.status === 'suggested').length,
    highConfidencePending: matches.filter(m => m.status === 'suggested' && m.compatibilityScore >= 85).length,
    todayEvents: events.filter(e => e.date === new Date().toISOString().split('T')[0]).length
  };

  const systemPrompt = `You are the Intelligence Center AI for a matchmaking CRM.
Analyze the following platform metrics and generate a short, actionable Markdown summary of "AI Scheduling Insights".
Do not use generic fluff. Use bullet points. Keep it under 100 words.
Focus on operational efficiency. If metrics are 0, say everything is up to date.

METRICS:
${JSON.stringify(metrics, null, 2)}`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }],
      model: GROQ_MODEL,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || 'No insights available.';
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return 'Could not generate insights at this time.';
  }
}
