/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { create } from 'zustand';
import type { AnalyticsData } from '@/types';
import { getFullAnalytics } from '@/firebase/analytics';
import toast from 'react-hot-toast';

// Static AI insights (don't come from Firestore)
export const aiInsights = [
  {
    id: '1',
    title: 'Mumbai Success Rate',
    insight:
      'Mumbai customers have the highest success rate at 88%. Consider prioritizing Mumbai-based matches.',
    type: 'success' as const,
    icon: '📈',
  },
  {
    id: '2',
    title: 'Quick Match Impact',
    insight:
      'Customers matched within 7 days of profile verification have a 78% higher success rate.',
    type: 'tip' as const,
    icon: '⚡',
  },
  {
    id: '3',
    title: 'Follow-up Pattern',
    insight:
      '3+ follow-up calls within the first month increase meeting conversion by 45%.',
    type: 'info' as const,
    icon: '📞',
  },
  {
    id: '4',
    title: 'Age Compatibility',
    insight:
      'Matches with 2-4 years age difference show the highest engagement rate at 72%.',
    type: 'info' as const,
    icon: '🎯',
  },
  {
    id: '5',
    title: 'Weekend Meetings',
    insight:
      'Meetings scheduled on weekends have a 35% higher attendance rate than weekday meetings.',
    type: 'tip' as const,
    icon: '📅',
  },
];

interface AnalyticsState {
  analytics: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;

  fetchAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analytics: null,
  isLoading: false,
  error: null,

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await getFullAnalytics();
      set({ analytics, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error('Failed to load analytics');
    }
  },
}));
