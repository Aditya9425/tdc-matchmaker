import { callGroqWithJson } from './groqClient';
import type { Customer, CalendarEvent } from '@/types';
import { calculateCustomerPriority } from '../priorityEngine';
import { getDismissedTasksForToday } from '@/firebase/tasks';

export interface AITask {
  id: string;
  customerId: string;
  customerName: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  reasoning: string;
  actionLabel: string;
  actionType: 'open_profile' | 'review_match' | 'generate_brief' | 'review_verification' | 'schedule_meeting';
}

export interface TaskQueueResponse {
  tasks: AITask[];
  timestamp: string;
}

export async function generateTaskQueue(
  customers: Customer[],
  calendarEvents: CalendarEvent[]
): Promise<TaskQueueResponse> {
  const currentDate = new Date();
  const todayStr = currentDate.toISOString().split('T')[0];

  // 1. Gather raw context items
  const rawItems: any[] = [];

  // Overdue and Today's Calendar Events
  calendarEvents.forEach(event => {
    if (event.status === 'Completed') return;
    const isOverdue = event.date < todayStr;
    const isToday = event.date === todayStr;
    
    if (isOverdue || isToday) {
      rawItems.push({
        type: 'event',
        id: event.id,
        customerId: event.customerId,
        customerName: event.customerName,
        title: event.title,
        eventType: event.type,
        isOverdue
      });
    }
  });

  // Customer Priorities
  customers.forEach(customer => {
    const customerEvents = calendarEvents.filter(e => e.customerId === customer.id);
    const evaluation = calculateCustomerPriority(customer, [], customerEvents);

    if (evaluation.score >= 3) {
      rawItems.push({
        type: 'priority',
        id: `pri-${customer.id}`,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        title: 'Attention Required',
        score: evaluation.score,
        reasons: evaluation.reasons
      });
    }

    if (!customer.verified) {
      rawItems.push({
        type: 'verification',
        id: `ver-${customer.id}`,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        title: 'Pending Verification',
      });
    }
  });

  // Limit to top 20 items to avoid token limits, excluding recently dismissed tasks
  const dismissedTasks = await getDismissedTasksForToday();
  const promptItems = rawItems
    .filter(item => !dismissedTasks.includes(item.id))
    .slice(0, 20);

  const prompt = `
You are an expert matchmaking operations manager AI.
Your job is to review the following pending items for the matchmaker and generate a prioritized Task Queue.

Raw Items:
${JSON.stringify(promptItems, null, 2)}

Rules:
1. Generate exactly one task for each raw item.
2. Assign a priority ('High', 'Medium', 'Low'). Overdue items, high score priorities (>=4), and verifications are usually High.
3. Write a clear 'title' for the task.
4. Write a 1-sentence 'reasoning' explaining why this needs attention (e.g., "No match sent in 12 days.").
5. Choose an appropriate 'actionType' from the following exact strings: 'open_profile', 'review_match', 'generate_brief', 'review_verification', 'schedule_meeting'.
6. Write a short 2-3 word 'actionLabel' for the button (e.g., "Review Match", "Open Profile", "Verify").

Return EXACTLY the following JSON format:
{
  "tasks": [
    {
      "id": "raw-item-id",
      "customerId": "cust-id",
      "customerName": "John Doe",
      "priority": "High",
      "title": "Needs New Recommendations",
      "reasoning": "Customer has rejected the last 3 matches and has high priority score.",
      "actionLabel": "Review Matches",
      "actionType": "review_match"
    }
  ]
}
`;

  const fallbackTasks: AITask[] = promptItems.map((item, index) => {
    let actionType: AITask['actionType'] = 'open_profile';
    let actionLabel = 'Open Profile';
    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    let reasoning = 'General review required.';

    if (item.type === 'verification') {
      actionType = 'review_verification';
      actionLabel = 'Verify Profile';
      priority = 'High';
      reasoning = 'Identity verification pending.';
    } else if (item.type === 'event') {
      if (item.eventType === 'Meeting') {
        actionType = 'generate_brief';
        actionLabel = 'Generate Brief';
      } else {
        actionType = 'open_profile';
        actionLabel = 'Take Action';
      }
      priority = item.isOverdue ? 'High' : 'Medium';
      reasoning = item.isOverdue ? 'This calendar event is overdue.' : 'Scheduled for today.';
    } else if (item.type === 'priority') {
      priority = item.score >= 4 ? 'High' : 'Medium';
      reasoning = item.reasons[0] || 'High priority score detected.';
    }

    return {
      id: item.id,
      customerId: item.customerId,
      customerName: item.customerName,
      title: item.title,
      priority,
      reasoning,
      actionLabel,
      actionType
    };
  });

  try {
    if (promptItems.length === 0) {
      return { tasks: [], timestamp: new Date().toISOString() };
    }

    const result = await callGroqWithJson<{ tasks: AITask[] }>(
      "You are an expert matchmaking operations manager.",
      prompt,
      { tasks: fallbackTasks }
    );

    // Sort High -> Medium -> Low
    const sortedTasks = (result.tasks || []).sort((a, b) => {
      const pMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    });

    return {
      tasks: sortedTasks,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Failed to generate task queue via AI:", error);
    
    fallbackTasks.sort((a, b) => {
      const pMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    });

    return {
      tasks: fallbackTasks,
      timestamp: new Date().toISOString()
    };
  }
}
