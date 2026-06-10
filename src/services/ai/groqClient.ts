import Groq from 'groq-sdk';

const apiKey = typeof import.meta !== 'undefined' && import.meta.env 
  ? import.meta.env.VITE_GROQ_API_KEY 
  : import.meta.env.VITE_GROQ_API_KEY;

export const groq = new Groq({
  apiKey: apiKey || 'dummy-key',
  dangerouslyAllowBrowser: true, // Required since we are running in the frontend for this demo
});

export const GROQ_MODEL = 'llama-3.1-8b-instant';

/**
 * Robust wrapper to call Groq, enforce JSON output, and handle parsing.
 */
export async function callGroqWithJson<T>(
  systemPrompt: string,
  userPrompt: string,
  fallbackData: T
): Promise<T> {
  if (!apiKey) {
    console.warn('Groq API Key is missing. Returning fallback data.');
    return fallbackData;
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for deterministic matching
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Groq');
    }

    const parsed = JSON.parse(content) as T;
    return parsed;
  } catch (error) {
    console.error('Groq AI Call Failed:', error);
    console.warn('Falling back to deterministic rule-based data.');
    return fallbackData;
  }
}
