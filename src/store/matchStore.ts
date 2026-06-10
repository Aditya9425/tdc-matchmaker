/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import type { Match } from '@/types';
import {
  createMatch as fbCreateMatch,
  getMatchesByCustomer as fbGetMatchesByCustomer,
  getAllMatches as fbGetAllMatches,
  updateMatchStatus as fbUpdateMatchStatus,
  deleteMatch as fbDeleteMatch,
  subscribeToMatches,
} from '@/firebase/matches';
import { createTimelineEvent } from '@/firebase/timeline';
import toast from 'react-hot-toast';

interface MatchState {
  matches: Match[];
  allMatches: Match[];
  isLoading: boolean;
  error: string | null;

  fetchMatchesByCustomer: (customerId: string) => Promise<void>;
  fetchAllMatches: () => Promise<void>;
  createMatch: (data: Omit<Match, 'id'>) => Promise<string | null>;
  updateStatus: (id: string, status: Match['status']) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  subscribe: (customerId: string) => () => void;
  enrichMatchWithAI: (primaryCustomer: any, candidateCustomer: any, existingMatch: Match) => Promise<void>;
  generateMatchesForCustomer: (primaryCustomer: any, allCustomers: any[]) => Promise<void>;
  analyzeMatch: (match: Match, customer: any, candidate: any) => Promise<Match>;
  shortlistMatch: (matchId: string) => Promise<void>;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  allMatches: [],
  isLoading: false,
  error: null,

  fetchMatchesByCustomer: async (customerId) => {
    set({ isLoading: true, error: null });
    try {
      const matches = await fbGetMatchesByCustomer(customerId);
      set({ matches, isLoading: false });
    } catch (err: any) {
      set({ error: err instanceof Error ? err.message : 'Unknown error', isLoading: false });
      toast.error('Failed to load matches');
    }
  },

  fetchAllMatches: async () => {
    try {
      const allMatches = await fbGetAllMatches();
      set({ allMatches });
    } catch {
      toast.error('Failed to load matches');
    }
  },

  createMatch: async (data) => {
    try {
      const id = await fbCreateMatch(data);
      toast.success('Match created');
      
      // Emit timeline event
      await createTimelineEvent({
        customerId: data.customerId,
        type: 'match_suggested',
        title: 'New Match Suggested',
        description: `A new match was suggested.`,
        date: new Date().toISOString(),
        metadata: { matchId: id, matchedCustomerId: data.matchedCustomerId },
      });
      
      return id;
    } catch {
      toast.error('Failed to create match');
      return null;
    }
  },

  updateStatus: async (id, status) => {
    try {
      await fbUpdateMatchStatus(id, status);
      toast.success('Match status updated');
      set((s) => ({
        matches: s.matches.map((m) => (m.id === id ? { ...m, status } : m)),
      }));

      // Find match to emit event
      const match = get().matches.find((m: Match) => m.id === id);
      if (match) {
        await createTimelineEvent({
          customerId: match.customerId,
          type: 'match_status_updated',
          title: `Match ${status}`,
          description: `Match status was updated to ${status}.`,
          date: new Date().toISOString(),
          metadata: { matchId: id, status },
        });
      }
    } catch {
      toast.error('Failed to update match');
    }
  },

  deleteMatch: async (id) => {
    try {
      await fbDeleteMatch(id);
      toast.success('Match deleted');
      set((s) => ({
        matches: s.matches.filter((m) => m.id !== id),
      }));
    } catch {
      toast.error('Failed to delete match');
    }
  },

  subscribe: (customerId) => {
    return subscribeToMatches(customerId, (matches) => {
      set({ matches });
    });
  },

  analyzeMatch: async (match, customer, candidate) => {
    try {
      if (match.aiAnalysis) return match; // Return cached analysis
      const { matchEngine } = await import('@/services/ai/matchEngine');
      const analysis = await matchEngine.analyzeCompatibility(customer, candidate, match.compatibilityScore);
      
      const { updateMatchAnalysis } = await import('@/firebase/matches');
      await updateMatchAnalysis(match.id, analysis);
      
      const updatedMatch = { ...match, aiAnalysis: analysis };
      set((s) => ({
        matches: s.matches.map(m => m.id === match.id ? updatedMatch : m)
      }));
      return updatedMatch;
    } catch (err) {
      console.error('Failed to analyze match', err);
      toast.error('AI analysis failed');
      return match;
    }
  },

  shortlistMatch: async (matchId) => {
    try {
      const { updateMatchStatus } = await import('@/firebase/matches');
      await updateMatchStatus(matchId, 'shortlisted');
      set((s) => ({
        matches: s.matches.map(m => m.id === matchId ? { ...m, status: 'shortlisted' } : m)
      }));
      toast.success('Match shortlisted');
    } catch {
      toast.error('Failed to shortlist match');
    }
  },

  enrichMatchWithAI: async (primaryCustomer: any, candidateCustomer: any, existingMatch: Match) => {
    try {
      const { matchEngine } = await import('@/services/ai/matchEngine');
      const aiRank = await matchEngine.rankMatch(primaryCustomer, candidateCustomer);
      
      // Update local state with the enriched match
      set((s) => ({
        matches: s.matches.map(m => {
          if (m.id === existingMatch.id) {
            return {
              ...m,
              compatibilityScore: aiRank.matchScore,
              matchConfidence: aiRank.matchScore,
              reasons: aiRank.reasons,
              concerns: aiRank.concerns,
            };
          }
          return m;
        })
      }));
    } catch (err) {
      console.error('Failed to enrich match with AI', err);
    }
  },

  generateMatchesForCustomer: async (primaryCustomer, allCustomers) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Loaded profiles:', allCustomers.length);
      
      const { matchEngine } = await import('@/services/ai/matchEngine');
      
      // Filter out self and find potential candidates (strictly opposite gender)
      const primaryGenderStr = (primaryCustomer.gender || '').toLowerCase();
      
      const candidates = allCustomers.filter(c => {
        if (c.id === primaryCustomer.id) return false;
        const candidateGenderStr = (c.gender || '').toLowerCase();
        
        // Ensure genders exist and are strictly opposite
        if (!primaryGenderStr || !candidateGenderStr) return false;
        if (primaryGenderStr === candidateGenderStr) return false;
        
        return true;
      });
      
      console.log('Generated candidates:', candidates.length);

      // 1. Calculate deterministic scores for all candidates
      const scoredCandidates = candidates.map(candidate => {
        const score = matchEngine.calculateDeterministicScore(primaryCustomer, candidate);
        return { candidate, score };
      });

      // 2. Sort by score descending
      scoredCandidates.sort((a, b) => b.score - a.score);

      // 3. Take Top 20 Candidates
      const topCandidates = scoredCandidates.slice(0, 20);
      console.log('Top matches (Deterministic):', topCandidates.length);

      // 4. Enhance Top 6 with Groq
      const top6 = topCandidates.slice(0, 6);
      const remaining = topCandidates.slice(6);
      
      const enhancedTop6: Match[] = [];
      for (const { candidate, score } of top6) {
        try {
          const aiResult = await matchEngine.rankMatch(primaryCustomer, candidate);
          enhancedTop6.push({
            id: `generated_${candidate.id}`,
            customerId: primaryCustomer.id,
            matchedCustomerId: candidate.id,
            status: 'suggested' as any,
            compatibilityScore: aiResult.matchScore,
            matchConfidence: aiResult.matchScore,
            notes: '',
            reasons: aiResult.reasons,
            concerns: aiResult.concerns,
            conversationStarters: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Match);
          // Optional: Add a small delay between requests if rate limits are still hit
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch {
          console.warn('Groq API unavailable. Using rule-based matching for', candidate.id);
          enhancedTop6.push({
            id: `generated_${candidate.id}`,
            customerId: primaryCustomer.id,
            matchedCustomerId: candidate.id,
            status: 'suggested' as any,
            compatibilityScore: score,
            matchConfidence: score,
            notes: '',
            reasons: ['Strong demographic alignment', 'Compatible lifestyle'],
            concerns: [],
            conversationStarters: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as Match);
        }
      }
      console.log('Groq response received for Top 6');

      const fallbackMatches = remaining.map(({ candidate, score }) => ({
        id: `generated_${candidate.id}`,
        customerId: primaryCustomer.id,
        matchedCustomerId: candidate.id,
        status: 'suggested' as any,
        compatibilityScore: score,
        matchConfidence: score,
        notes: '',
        reasons: ['Strong demographic alignment', 'Compatible lifestyle'],
        concerns: [],
        conversationStarters: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Match));

      const finalMatches = [...enhancedTop6, ...fallbackMatches];
      console.log('Final matches rendered:', finalMatches.length);

      set({ matches: finalMatches, isLoading: false });
    } catch (err: any) {
      console.error('Failed to load candidate profiles:', err);
      set({ error: err instanceof Error ? err.message : 'Unknown error', isLoading: false });
      toast.error('Failed to load candidate profiles');
    }
  }
}));
