import type { AIFilters } from '@/types';
import { callGroqWithJson } from './groqClient';

const SYSTEM_PROMPT = `You are an AI filter interpreter for a matchmaking CRM.
Given a natural language query about customers, extract structured filter parameters.

Available filter fields:
- gender: "Male" or "Female". Detect from words like "women", "men", "female", "male", "girls", "boys", "ladies", "gentlemen".
- minAge / maxAge: integers. Detect from "older than 30", "below 25", "aged 25-30", "above 28".
- city: string. Detect city names like "Ahmedabad", "Pune", "Bangalore", "Delhi", "Mumbai", "Hyderabad", "Chennai".
- state: string. Detect state names like "Gujarat", "Maharashtra", "Karnataka".
- status: one of "New Lead", "Profile Review", "Active Matching", "Meeting Scheduled", "Engaged", "On Hold", "Closed". Detect from "active matching", "engaged", "profile review", "meeting scheduled", "new leads".
- verified: boolean. Detect from "verified", "unverified", "awaiting verification", "pending verification".
- minCompatibility: integer 0-100. Detect from "high compatibility", "score above 90", "compatibility above 85".
- profession: string. Detect profession keywords like "doctor", "engineer", "business owner", "chartered accountant", "software engineer", "lawyer", "teacher".
- religion: string. Detect from "Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist".

Return ONLY a valid JSON object with these fields. Only include fields that the user's query mentions. Do not guess or infer fields not mentioned.
Also include a "confidence" field (integer 0-100) indicating how confident you are in the interpretation.

Example input: "Women from Ahmedabad aged 25 to 30"
Example output: {"gender":"Female","city":"Ahmedabad","minAge":25,"maxAge":30,"confidence":95}

Example input: "Active matching customers in Pune"
Example output: {"status":"Active Matching","city":"Pune","confidence":92}

Example input: "profiles awaiting verification"
Example output: {"verified":false,"confidence":90}

Example input: "high compatibility profiles"
Example output: {"minCompatibility":85,"confidence":88}`;

export interface AIFilterResult {
  filters: AIFilters;
  confidence: number;
}

export async function parseFilterQuery(query: string): Promise<AIFilterResult> {
  // First, try Groq
  try {
    const result = await callGroqWithJson<AIFilters & { confidence?: number }>(
      SYSTEM_PROMPT,
      query,
      { confidence: 0 } // fallback triggers regex path
    );

    const { confidence, ...filters } = result;

    // If confidence is 0 or empty filters, fallback
    if (!confidence || Object.keys(filters).length === 0) {
      return fallbackParseQuery(query);
    }

    return { filters, confidence };
  } catch {
    return fallbackParseQuery(query);
  }
}

/**
 * Regex/keyword fallback when Groq is unavailable or rate-limited.
 * Never fails — always returns something useful.
 */
export function fallbackParseQuery(query: string): AIFilterResult {
  const q = query.toLowerCase();
  const filters: AIFilters = {};
  let matchCount = 0;

  // Gender
  if (/\b(women|woman|female|girls|ladies)\b/.test(q)) { filters.gender = 'Female'; matchCount++; }
  else if (/\b(men|male|boys|gentlemen)\b/.test(q)) { filters.gender = 'Male'; matchCount++; }

  // Age
  const ageRange = q.match(/age[d]?\s+(\d+)\s*(?:to|-)\s*(\d+)/);
  if (ageRange) { filters.minAge = parseInt(ageRange[1]); filters.maxAge = parseInt(ageRange[2]); matchCount++; }
  else {
    const olderThan = q.match(/(?:older|above|over|greater)\s+(?:than\s+)?(\d+)/);
    if (olderThan) { filters.minAge = parseInt(olderThan[1]); matchCount++; }
    const youngerThan = q.match(/(?:younger|below|under|less)\s+(?:than\s+)?(\d+)/);
    if (youngerThan) { filters.maxAge = parseInt(youngerThan[1]); matchCount++; }
  }

  // City
  const cities = ['ahmedabad', 'pune', 'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'kolkata', 'jaipur', 'lucknow', 'chandigarh', 'indore', 'surat', 'noida', 'gurugram', 'gurgaon'];
  for (const city of cities) {
    if (q.includes(city)) {
      filters.city = city.charAt(0).toUpperCase() + city.slice(1);
      if (city === 'bengaluru') filters.city = 'Bangalore';
      if (city === 'gurgaon') filters.city = 'Gurugram';
      matchCount++;
      break;
    }
  }

  // Status
  if (/active\s*matching/.test(q)) { filters.status = 'Active Matching'; matchCount++; }
  else if (/profile\s*review/.test(q)) { filters.status = 'Profile Review'; matchCount++; }
  else if (/meeting\s*scheduled/.test(q)) { filters.status = 'Meeting Scheduled'; matchCount++; }
  else if (/\bengaged\b/.test(q)) { filters.status = 'Engaged'; matchCount++; }
  else if (/\bnew\s*lead/.test(q)) { filters.status = 'New Lead'; matchCount++; }

  // Verification
  if (/\b(unverified|awaiting\s*verification|pending\s*verification|not\s*verified)\b/.test(q)) { filters.verified = false; matchCount++; }
  else if (/\bverified\b/.test(q)) { filters.verified = true; matchCount++; }

  // Compatibility
  const compMatch = q.match(/(?:compatibility|score)\s*(?:above|over|>|>=)\s*(\d+)/);
  if (compMatch) { filters.minCompatibility = parseInt(compMatch[1]); matchCount++; }
  else if (/high\s*compatibility/.test(q)) { filters.minCompatibility = 85; matchCount++; }

  // Profession
  const professions: Record<string, string> = {
    'doctor': 'Doctor', 'engineer': 'Engineer', 'software': 'Software Engineer',
    'business': 'Business Owner', 'chartered accountant': 'Chartered Accountant',
    'lawyer': 'Lawyer', 'teacher': 'Teacher', 'consultant': 'Consultant',
    'manager': 'Manager', 'architect': 'Architect', 'designer': 'Designer',
  };
  for (const [keyword, label] of Object.entries(professions)) {
    if (q.includes(keyword)) { filters.profession = label; matchCount++; break; }
  }

  // Religion
  const religions = ['hindu', 'muslim', 'christian', 'sikh', 'jain', 'buddhist', 'parsi'];
  for (const r of religions) {
    if (q.includes(r)) { filters.religion = r.charAt(0).toUpperCase() + r.slice(1); matchCount++; break; }
  }

  const confidence = matchCount > 0 ? Math.min(95, 60 + matchCount * 10) : 0;
  return { filters, confidence };
}
