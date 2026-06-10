import { callGroqWithJson } from './groqClient';
import type { Customer, CalendarEvent } from '@/types';
import { calculateCustomerPriority } from '../priorityEngine';

export interface AIPrioritizedEvent extends CalendarEvent {
  aiPriority: 'High' | 'Medium' | 'Low';
  aiReasoning: string;
  order: number;
}

export interface AgendaResponse {
  items: AIPrioritizedEvent[];
  timestamp: string;
}

export async function generateDailyAgenda(
  customers: Customer[],
  todayEvents: CalendarEvent[]
): Promise<AgendaResponse> {
  const currentDate = new Date().toISOString();
  
  // 1. Generate System Tasks for high priority customers
  const systemTasks: CalendarEvent[] = [];
  customers.forEach(customer => {
    // Basic estimation of customer events
    const customerEvents = todayEvents.filter(e => e.customerId === customer.id);
    const evaluation = calculateCustomerPriority(customer, [], customerEvents);
    
    if (evaluation.score >= 3) {
      // Create a virtual task
      systemTasks.push({
        id: `sys-task-${customer.id}`,
        title: 'System Task: Action Required',
        date: new Date().toISOString().split('T')[0],
        startTime: 'Anytime',
        endTime: 'Anytime',
        type: 'AI Recommendation', // This helps UI identify it
        priority: evaluation.score >= 4 ? 'High' : 'Medium',
        status: 'Pending',
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        notes: evaluation.reasons.join(', '),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });

  const combinedQueue = [...todayEvents, ...systemTasks];

  const eventsContext = combinedQueue.map(e => ({
    id: e.id,
    title: e.title,
    time: e.startTime,
    type: e.type,
    customerName: e.customerName,
    currentPriority: e.priority,
    notes: e.notes
  }));

  const prompt = `
You are an AI operations assistant for a professional matchmaker.
Your task is to analyze today's unified work queue (which includes both Calendar Events and System Tasks) and assign an AI-driven priority (High, Medium, Low) and an optimal execution order (1 being first).
DO NOT generate new tasks. ONLY use the provided events in the queue.

Current Date/Time: ${currentDate}

Unified Queue:
${JSON.stringify(eventsContext, null, 2)}

Rules:
1. Output exactly one evaluation for EVERY event in the "Unified Queue".
2. Assign 'recommendedPriority' ('High', 'Medium', 'Low') based on urgency (e.g., scheduled meetings are usually High, but critical System Tasks like pending matches can also be High).
3. Assign 'recommendedOrder' integer (1 to N) for how the matchmaker should tackle these. Scheduled meetings should be placed around their scheduled time if possible, but you can just order them sequentially 1 to N.
4. Provide a very short 'reasoning' (max 1 sentence) explaining the priority.

Return EXACTLY the following JSON format:
{
  "evaluations": [
    {
      "id": "event-id-from-list",
      "recommendedPriority": "High",
      "recommendedOrder": 1,
      "reasoning": "Meetings take precedence and must be attended."
    }
  ]
}
`;

  const systemPrompt = `You are an AI assistant for a professional matchmaker. Your task is to prioritize the given daily agenda.`;

  try {
    if (combinedQueue.length === 0) {
      return { items: [], timestamp: new Date().toISOString() };
    }

    const result = await callGroqWithJson<{
      evaluations: { id: string, recommendedPriority: 'High'|'Medium'|'Low', recommendedOrder: number, reasoning: string }[]
    }>(
      systemPrompt, 
      prompt,
      { evaluations: [] }
    );
    
    // Merge AI evaluations with original events
    let items: AIPrioritizedEvent[] = combinedQueue.map(event => {
      const evalData = result.evaluations.find(e => e.id === event.id);
      return {
        ...event,
        aiPriority: evalData?.recommendedPriority || event.priority,
        aiReasoning: evalData?.reasoning || 'Standard priority.',
        order: evalData?.recommendedOrder || 99
      };
    });

    // Sort by recommended order
    items.sort((a, b) => a.order - b.order);

    return {
      items,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to prioritize agenda via AI:", error);
    // Fallback: return original events
    const fallbackItems = combinedQueue.map((e, index) => ({
      ...e,
      aiPriority: e.priority,
      aiReasoning: 'Fallback sorting.',
      order: index
    }));

    return {
      items: fallbackItems,
      timestamp: new Date().toISOString()
    };
  }
}
