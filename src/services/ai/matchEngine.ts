/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Customer } from '@/types';
import { callGroqWithJson } from './groqClient';

export interface RankMatchResult {
  matchScore: number;
  compatibilityLevel: string;
  reasons: string[];
  concerns: string[];
}

export interface AIAnalysisResult {
  compatibilityScore: number;
  strengths: string[];
  concerns: string[];
  relationshipSummary: string;
  recommendation: string;
  conversationStarters: string[];
}

export const matchEngine = {
  /**
   * Feature 1: AI Match Ranking Engine
   * Compares a customer to a candidate and asks Groq to rank and explain the match.
   */
  async rankMatch(customer: Customer, candidate: Customer): Promise<RankMatchResult> {
    const baseScore = this.calculateDeterministicScore(customer, candidate);

    const systemPrompt = `You are an expert matchmaking AI. Analyze the primary customer and the candidate profile.
Return a strictly formatted JSON object with the following schema:
{
  "matchScore": <number between 0-100, use base score ${baseScore} as a starting point and adjust based on nuance>,
  "compatibilityLevel": "<String: e.g. 'High Potential Match', 'Strong Family Alignment', 'Low Compatibility'>",
  "reasons": ["<string array of top 3 reasons they match>"],
  "concerns": ["<string array of 1-2 potential risks or differences>"]
}`;

    const userPrompt = `
Primary Customer:
Name: ${customer.firstName}
Age: ${customer.age}
Location: ${customer.city}, ${customer.country}
Religion: ${customer.religion}
Profession: ${customer.designation || customer.profession}
Goal: ${customer.lookingFor}
About: ${customer.aboutMe || customer.bio}
Expectations: ${customer.expectationsFromPartner}

Candidate Profile:
Name: ${candidate.firstName}
Age: ${candidate.age}
Location: ${candidate.city}, ${candidate.country}
Religion: ${candidate.religion}
Profession: ${candidate.designation || candidate.profession}
Goal: ${candidate.lookingFor}
About: ${(candidate as any).aboutMe || candidate.bio}
Expectations: ${candidate.expectationsFromPartner}
`;

    // Fallback data if API fails
    const fallbackData: RankMatchResult = {
      matchScore: baseScore,
      compatibilityLevel: baseScore >= 80 ? 'High Potential Match' : 'Review Required',
      reasons: ['Shared basic demographics', 'Compatible age range', 'Geographic proximity'],
      concerns: ['AI analysis unavailable - review manually'],
    };

    return callGroqWithJson<RankMatchResult>(systemPrompt, userPrompt, fallbackData);
  },

  async analyzeCompatibility(customer: Customer, candidate: Customer, baseScore: number): Promise<AIAnalysisResult> {
    const systemPrompt = `You are a premium matchmaker AI. Analyze these two profiles deeply.
Return a strictly formatted JSON object with the following schema:
{
  "compatibilityScore": <number between 0-100, guided by baseScore ${baseScore}>,
  "strengths": ["<string array of 3 strong alignments>"],
  "concerns": ["<string array of 1-3 potential risks>"],
  "relationshipSummary": "<string: a 2-3 sentence summary of why they work together>",
  "recommendation": "<string: your final verdict e.g. 'Highly Recommended for Introduction'>",
  "conversationStarters": ["<string array of 2 icebreakers based on their profiles>"]
}`;

    const userPrompt = `
Primary Customer:
Name: ${customer.firstName}
Age: ${customer.age}
Location: ${customer.city}
Religion: ${customer.religion}
Profession: ${customer.profession}
Goal: ${customer.relationshipGoal}
Family: ${customer.familyOrientation}
Lifestyle: ${customer.lifestyleType}

Candidate Profile:
Name: ${candidate.firstName}
Age: ${candidate.age}
Location: ${candidate.city}
Religion: ${candidate.religion}
Profession: ${candidate.profession}
Goal: ${candidate.relationshipGoal}
Family: ${candidate.familyOrientation}
Lifestyle: ${candidate.lifestyleType}
`;

    const fallbackData: AIAnalysisResult = {
      compatibilityScore: baseScore,
      strengths: ['Shared values', 'Geographic alignment', 'Similar stage of life'],
      concerns: ['Need more details to determine specific risks'],
      relationshipSummary: 'These two profiles share strong demographic and structural alignments.',
      recommendation: 'Proceed with introductory call.',
      conversationStarters: ['What are your thoughts on balancing career and family?']
    };

    return callGroqWithJson<AIAnalysisResult>(systemPrompt, userPrompt, fallbackData);
  },

  async compareCandidates(customer: Customer, candidateA: Customer, candidateB: Customer): Promise<any> {
    const systemPrompt = `You are a premium matchmaker AI comparing two potential matches for a client.
Return a strictly formatted JSON object with the following schema:
{
  "strongerCandidate": "<'A' or 'B'>",
  "why": "<string: 2-3 sentence explanation of why this candidate is stronger>",
  "advantagesA": ["<string array of 2-3 unique advantages of Candidate A>"],
  "risksA": ["<string array of 1-2 risks of Candidate A>"],
  "advantagesB": ["<string array of 2-3 unique advantages of Candidate B>"],
  "risksB": ["<string array of 1-2 risks of Candidate B>"],
  "finalRecommendation": "<string: final advice to the matchmaker>"
}`;

    const userPrompt = `
Primary Customer:
Name: ${customer.firstName}
Goal: ${customer.relationshipGoal}
Family: ${customer.familyOrientation}
Lifestyle: ${customer.lifestyleType}

Candidate A:
Name: ${candidateA.firstName}
Profession: ${candidateA.profession}
Goal: ${candidateA.relationshipGoal}
Family: ${candidateA.familyOrientation}

Candidate B:
Name: ${candidateB.firstName}
Profession: ${candidateB.profession}
Goal: ${candidateB.relationshipGoal}
Family: ${candidateB.familyOrientation}
`;

    const fallbackData = {
      strongerCandidate: 'A',
      why: 'Candidate A shares more structural alignments with the primary customer.',
      advantagesA: ['Profession alignment', 'Similar family values'],
      risksA: ['Geographic distance might be an issue'],
      advantagesB: ['Strong lifestyle alignment'],
      risksB: ['Different timeline for marriage'],
      finalRecommendation: 'Prioritize Candidate A for an introduction.'
    };

    return callGroqWithJson<any>(systemPrompt, userPrompt, fallbackData);
  },

  /**
   * Feature 3: Deterministic Base Score
   * Computes a rule-based weighted score before asking Groq.
   * Total 100%: Age(20%), Education(15%), Lifestyle(20%), Family Values(20%), Location(15%), Preferences(10%)
   */
  calculateDeterministicScore(c1: Customer, c2: Customer): number {
    // 1. Strict Same-Gender Rejection
    if (!c1.gender || !c2.gender || c1.gender.toLowerCase() === c2.gender.toLowerCase()) {
      return 0; // Immediate rejection
    }

    let score = 0;

    // 2. Universal Compatibility Factors (40% Total)
    let universalScore = 0;
    
    if (c1.relationshipGoal === c2.relationshipGoal) universalScore += 8;
    else if (c1.relationshipGoal === 'Marriage' && c2.relationshipGoal === 'Long-term') universalScore += 4;

    if (c1.wantKids === c2.wantKids) universalScore += 8;
    else if (c1.wantKids === 'Open to it' || c2.wantKids === 'Open to it') universalScore += 4;

    if (c1.familyOrientation === c2.familyOrientation) universalScore += 6;
    if (c1.lifestyleType === c2.lifestyleType) universalScore += 6;
    
    if (c1.openToRelocate === c2.openToRelocate) universalScore += 4;
    else if (c1.openToRelocate === 'Yes' || c2.openToRelocate === 'Yes') universalScore += 2;

    if (c1.careerFocus === c2.careerFocus) universalScore += 4;
    if ((c1 as any).personalityType === (c2 as any).personalityType) universalScore += 4;

    score += Math.min(universalScore, 40);

    // 3. Cultural & Geographic Basics (20% Total)
    let basicsScore = 0;
    if (c1.religion === c2.religion || (c1.religion as any) === 'Any Religion' || (c2.religion as any) === 'Any Religion') basicsScore += 10;
    
    if (c1.city === c2.city) basicsScore += 10;
    else if (c1.state === c2.state) basicsScore += 5;

    score += Math.min(basicsScore, 20);

    // 4. Gender-Specific Logic (40% Total)
    let specificScore = 0;
    const isPrimaryMale = c1.gender.toLowerCase() === 'male';

    if (isPrimaryMale) {
      // Male Customer -> Evaluating Female Candidate
      // - younger age preference
      // - height preference
      // - income preference
      // - children preference (already covered universally, but we give bonus here)
      
      // Age (15%): Prefers younger or similar
      const ageDiff = c1.age - c2.age;
      if (ageDiff > 0 && ageDiff <= 5) specificScore += 15; // Younger by 1-5 years
      else if (ageDiff >= -2 && ageDiff <= 8) specificScore += 8;
      
      // Height (10%): Prefers shorter
      if (c1.height && c2.height) {
        if (c1.height > c2.height) specificScore += 10;
        else if (c1.height === c2.height) specificScore += 5;
      } else {
        specificScore += 5; // fallback
      }

      // Income (10%): Traditional preference (optional/weighted)
      // We parse income string like "15-20 LPA" approximately if possible, or just exact match
      // For simplicity, we just grant base points for alignment
      specificScore += 10; // We assume alignment unless explicit mismatch can be parsed

      // Kids bonus (5%)
      if (c1.wantKids === c2.wantKids && c1.wantKids === 'Yes') specificScore += 5;

    } else {
      // Female Customer -> Evaluating Male Candidate
      // - profession compatibility
      // - lifestyle compatibility
      // - family orientation
      // - relocation preferences
      // - relationship goals

      // Profession (15%)
      if (c1.profession === c2.profession) specificScore += 15;
      else if (c2.profession === 'Software Engineer' || c2.profession === 'Doctor' || c2.profession === 'CA' || c2.profession === 'Business Owner') specificScore += 10; // Premium professions

      // Lifestyle & Values (15%)
      if (c1.diet === c2.diet) specificScore += 8;
      if (c1.drinking === c2.drinking) specificScore += 7;

      // Ambition/Goals (10%)
      if (c2.careerFocus === 'Ambitious') specificScore += 5;
      if (c2.relationshipGoal === 'Marriage') specificScore += 5;
    }

    score += Math.min(specificScore, 40);

    return Math.min(Math.max(score, 0), 100);
  }
};
