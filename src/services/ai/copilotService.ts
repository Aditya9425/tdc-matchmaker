import { groq, GROQ_MODEL } from './groqClient';
import type { CopilotMessage } from '@/store/copilotStore';

interface CopilotResponse {
  reply: string;
  actions?: {
    type: string;
    payload?: any;
    label: string;
  }[];
  sources?: string[];
}

export async function generateCopilotResponse(
  chatHistory: CopilotMessage[],
  platformContext: any
): Promise<CopilotResponse> {
  const systemPrompt = `You are the Intelligence Center Copilot for the TDC Matchmaking platform.
You act as a real operational assistant for matchmakers.
Your job is to answer questions using ONLY the provided platform data context.

PLATFORM CONTEXT:
${JSON.stringify(platformContext, null, 2)}

GROUNDING RULES:
1. You must base all your answers strictly on the PLATFORM CONTEXT above.
2. If you don't have enough data to answer a question, politely say: "I don't have enough platform data to answer that."
3. You should act as a highly intelligent, premium BI assistant. Be concise.

ACTIONABLE RESPONSES:
You can suggest actions for the user to take. Valid action types are:
- "OPEN_PROFILE": requires 'payload' to be the customerId. Label: e.g., "Review Aarav's Profile"
- "REVIEW_MATCHES": requires 'payload' to be the customerId. Label: e.g., "Review Matches for Aarav"
- "NAVIGATE_CALENDAR": no payload needed. Label: e.g., "Open Calendar"

RESPONSE FORMAT:
You MUST respond with valid JSON matching this schema:
{
  "reply": "Your conversational response here. Use markdown for bolding/lists if needed.",
  "actions": [
    { "type": "OPEN_PROFILE", "payload": "TDC-10100", "label": "Review Aarav's Profile" }
  ],
  "sources": ["Customers", "Calendar"]
}
`;

  try {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
    ] as any;

    const response = await groq.chat.completions.create({
      messages: formattedMessages,
      model: GROQ_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    return JSON.parse(content) as CopilotResponse;
  } catch (error) {
    console.error('Copilot generation failed:', error);
    return {
      reply: "I'm having trouble connecting to the intelligence center right now. Please try again later.",
      actions: [],
      sources: []
    };
  }
}
