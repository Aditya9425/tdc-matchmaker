import { callGroqWithJson } from './groqClient';
import type { Customer, CalendarEvent } from '@/types';

export interface CalendarRecommendation {
  id: string;
  title: string;
  description: string;
  actionCustomerName?: string;
  actionCustomerId?: string;
  suggestedType: 'Meeting' | 'Follow Up' | 'Match Review' | 'Profile Review';
}

export interface CalendarIntelligenceResponse {
  recommendations: CalendarRecommendation[];
  summary: string;
}

export async function generateCalendarRecommendations(
  customers: Customer[],
  events: CalendarEvent[]
): Promise<CalendarIntelligenceResponse> {
  const currentDate = new Date().toISOString();
  
  const customerContext = customers
    .slice(0, 15) // Limit to 15 for prompt size
    .map(c => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      status: c.status,
      lastActive: c.lastActive,
      joined: c.joinedDate
    }));

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .slice(0, 20)
    .map(e => ({
      title: e.title,
      date: e.date,
      type: e.type,
      customer: e.customerName
    }));

  const prompt = `
You are an AI operations assistant for a professional matchmaker.
Based on the current upcoming schedule and the list of customers, suggest 2-4 important scheduling actions.

Current Date: ${currentDate}

Upcoming Events:
${JSON.stringify(upcomingEvents, null, 2)}

Active Customers (Needing Attention):
${JSON.stringify(customerContext, null, 2)}

Rules:
- Identify customers who haven't been contacted recently or need profile reviews.
- Suggest concrete actions (e.g., "Schedule a follow-up with Aarav").
- Keep recommendations brief and actionable.

Return EXACTLY the following JSON format:
{
  "summary": "A concise 1-sentence summary of the week's operational focus.",
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Follow up with Aarav Joshi",
      "description": "Aarav hasn't been contacted in 12 days. Schedule a check-in.",
      "actionCustomerName": "Aarav Joshi",
      "actionCustomerId": "customer-id",
      "suggestedType": "Follow Up"
    }
  ]
}
`;

  const systemPrompt = `You are a matchmaking operations AI. You analyze schedules and suggest the next best actions.`;

  try {
    const result = await callGroqWithJson<CalendarIntelligenceResponse>(
      systemPrompt, 
      prompt,
      { 
        summary: "Keep your calendar up to date to ensure no customers fall through the cracks.",
        recommendations: [] 
      }
    );
    
    return {
      summary: result.summary,
      recommendations: result.recommendations.map(r => ({
        ...r,
        id: r.id || Math.random().toString(36).substring(7)
      }))
    };
  } catch (error) {
    console.error("Failed to generate calendar recommendations:", error);
    return { summary: "Unable to generate recommendations at this time.", recommendations: [] };
  }
}
