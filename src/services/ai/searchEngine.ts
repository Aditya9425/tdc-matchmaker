import { callGroqWithJson } from './groqClient';

export interface StructuredSearchFilters {
  city?: string;
  state?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  openToRelocate?: boolean;
  wantKids?: boolean;
  profession?: string;
  religion?: string;
}

export const searchEngine = {
  /**
   * Feature 7: Natural Language Search
   * Converts a user query into structured filters.
   */
  async parseSearchQuery(query: string): Promise<StructuredSearchFilters> {
    const systemPrompt = `You are an NLP engine for a matchmaking CRM. Parse the user's natural language search query and map it to structured filter properties.
Only include properties that are explicitly mentioned or strongly implied.
Return a strictly formatted JSON object matching this exact schema (omit keys if not found):
{
  "city": "String",
  "state": "String",
  "gender": "Male | Female",
  "ageMin": Number,
  "ageMax": Number,
  "openToRelocate": Boolean,
  "wantKids": Boolean,
  "profession": "String",
  "religion": "String"
}`;

    // Simple fallback heuristic if Groq fails
    const fallback: StructuredSearchFilters = {};
    const q = query.toLowerCase();
    if (q.includes('women') || q.includes('female')) fallback.gender = 'Female';
    if (q.includes('men') || q.includes('male')) fallback.gender = 'Male';
    if (q.includes('relocate')) fallback.openToRelocate = true;
    if (q.includes('kids') || q.includes('children')) fallback.wantKids = true;

    return callGroqWithJson<StructuredSearchFilters>(systemPrompt, query, fallback);
  }
};
