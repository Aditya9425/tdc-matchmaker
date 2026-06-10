import { create } from 'zustand';
import { getGlobalTimelineEvents, subscribeToGlobalTimeline } from '@/firebase/timeline';
import { generateDailyInsight, type DailyInsight } from '@/services/ai/insightService';
import { generateDailyAgenda, type AgendaResponse } from '@/services/ai/agendaService';
import { getFullAnalytics } from '@/firebase/analytics';
import { generateTaskQueue, type TaskQueueResponse } from '@/services/ai/taskQueueService';
import { generateFullAnalyticsReport, type FullAnalyticsReport } from '@/services/ai/analyticsInsightService';
import type { TimelineEvent, Customer, CalendarEvent } from '@/types';
import type { Unsubscribe } from 'firebase/firestore';

interface DashboardState {
  recentActivity: TimelineEvent[];
  todayAgenda: AgendaResponse | null;
  insight: DailyInsight | null;
  taskQueue: TaskQueueResponse | null;
  fullAnalytics: FullAnalyticsReport | null;
  
  isLoadingActivity: boolean;
  isLoadingAgenda: boolean;
  isLoadingInsight: boolean;
  isLoadingTaskQueue: boolean;
  isLoadingFullAnalytics: boolean;
  error: string | null;

  subscribeActivity: () => Unsubscribe;
  fetchAgenda: (customers: Customer[], todayEvents: CalendarEvent[], forceRefresh?: boolean) => Promise<void>;
  fetchInsight: (forceRefresh?: boolean) => Promise<void>;
  fetchTaskQueue: (customers: Customer[], calendarEvents: CalendarEvent[], forceRefresh?: boolean) => Promise<void>;
  fetchFullAnalytics: (insight: DailyInsight, metrics: any, forceRefresh?: boolean) => Promise<void>;
  dismissTask: (taskId: string) => void;
}

const isSameDay = (isoString1: string, isoString2: string) => {
  const d1 = new Date(isoString1);
  const d2 = new Date(isoString2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  recentActivity: [],
  todayAgenda: null,
  insight: null,
  taskQueue: null,
  fullAnalytics: null,
  
  isLoadingActivity: true,
  isLoadingAgenda: false,
  isLoadingInsight: false,
  isLoadingTaskQueue: false,
  isLoadingFullAnalytics: false,
  error: null,

  subscribeActivity: () => {
    set({ isLoadingActivity: true });
    return subscribeToGlobalTimeline(25, (events) => {
      set({ recentActivity: events, isLoadingActivity: false });
    });
  },

  fetchAgenda: async (customers: Customer[], todayEvents: CalendarEvent[], forceRefresh = false) => {
    if (get().isLoadingAgenda) return;

    const cacheKey = 'tdc_daily_agenda';
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as AgendaResponse;
          if (isSameDay(parsed.timestamp, new Date().toISOString())) {
            set({ todayAgenda: parsed, isLoadingAgenda: false });
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached agenda', e);
        }
      }
    }

    set({ isLoadingAgenda: true, error: null });
    try {
      const agenda = await generateDailyAgenda(customers, todayEvents);
      localStorage.setItem(cacheKey, JSON.stringify(agenda));
      set({ todayAgenda: agenda, isLoadingAgenda: false });
    } catch (error: any) {
      set({ error: error.message, isLoadingAgenda: false });
    }
  },

  fetchInsight: async (forceRefresh = false) => {
    if (get().isLoadingInsight) return;

    const cacheKey = 'tdc_daily_insight';
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as DailyInsight;
          if (isSameDay(parsed.timestamp, new Date().toISOString())) {
            set({ insight: parsed, isLoadingInsight: false });
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached insight', e);
        }
      }
    }

    set({ isLoadingInsight: true, error: null });
    try {
      const analytics = await getFullAnalytics();
      const insight = await generateDailyInsight(analytics);
      localStorage.setItem(cacheKey, JSON.stringify(insight));
      set({ insight, isLoadingInsight: false });
    } catch (error: any) {
      set({ error: error.message, isLoadingInsight: false });
    }
  },

  fetchTaskQueue: async (customers: Customer[], calendarEvents: CalendarEvent[], forceRefresh = false) => {
    if (get().isLoadingTaskQueue) return;

    const cacheKey = 'tdc_daily_task_queue';
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as TaskQueueResponse;
          if (parsed.timestamp && isSameDay(parsed.timestamp, new Date().toISOString())) {
            set({ taskQueue: parsed, isLoadingTaskQueue: false });
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached task queue', e);
        }
      }
    }

    set({ isLoadingTaskQueue: true, error: null });
    try {
      const response = await generateTaskQueue(customers, calendarEvents);
      localStorage.setItem(cacheKey, JSON.stringify(response));
      set({ taskQueue: response, isLoadingTaskQueue: false });
    } catch (error: any) {
      set({ error: error.message, isLoadingTaskQueue: false });
    }
  },

  dismissTask: (taskId: string) => {
    const currentQueue = get().taskQueue;
    if (!currentQueue) return;

    const updatedTasks = currentQueue.tasks.filter(t => t.id !== taskId);
    const newQueue = { ...currentQueue, tasks: updatedTasks };
    
    // Update local storage so it persists
    localStorage.setItem('tdc_daily_task_queue', JSON.stringify(newQueue));
    set({ taskQueue: newQueue });
  },

  fetchFullAnalytics: async (insight: DailyInsight, metrics: any, forceRefresh = false) => {
    if (get().isLoadingFullAnalytics) return;

    const cacheKey = 'tdc_full_analytics';
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as FullAnalyticsReport;
          // Verify it matches the current day and structure
          if (parsed.insightSummary && parsed.insightSummary.generatedTimestamp) {
            if (isSameDay(parsed.insightSummary.generatedTimestamp, new Date().toISOString())) {
              set({ fullAnalytics: parsed, isLoadingFullAnalytics: false });
              return;
            }
          }
        } catch (e) {
          console.error('Failed to parse cached full analytics', e);
        }
      }
    }

    set({ isLoadingFullAnalytics: true, error: null });
    try {
      const analyticsReport = await generateFullAnalyticsReport(insight, metrics);
      localStorage.setItem(cacheKey, JSON.stringify(analyticsReport));
      set({ fullAnalytics: analyticsReport, isLoadingFullAnalytics: false });
    } catch (error: any) {
      set({ error: error.message, isLoadingFullAnalytics: false });
    }
  }
}));
