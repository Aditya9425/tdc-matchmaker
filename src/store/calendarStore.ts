import { create } from 'zustand';
import type { CalendarEvent, Customer, Match } from '@/types';
import { 
  createCalendarEvent, 
  updateCalendarEvent, 
  deleteCalendarEvent, 
  subscribeToCalendarEvents,
  batchDeleteEvents,
  batchCreateEvents
} from '@/firebase/calendar';
import { createTimelineEvent } from '@/firebase/timeline';
import { generateOperationalEvents, generateCalendarInsights } from '@/services/ai/calendarGenerationService';
import type { Unsubscribe } from 'firebase/firestore';

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  insights: string | null;

  subscribe: (customerId?: string) => Unsubscribe;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  syncAICalendar: (customers: Customer[], matches: Match[]) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  isLoading: true,
  isSyncing: false,
  error: null,
  insights: null,

  subscribe: (customerId?: string) => {
    set({ isLoading: true, error: null });
    return subscribeToCalendarEvents((events) => {
      set({ events, isLoading: false });
    }, customerId);
  },

  addEvent: async (event) => {
    try {
      const newEvent = await createCalendarEvent(event);
      
      // Auto-generate timeline event
      await createTimelineEvent({
        customerId: event.customerId || 'system',
        type: event.type === 'Meeting' ? 'meeting_scheduled' : 'follow_up',
        title: `${event.type} Scheduled`,
        description: `Scheduled "${event.title}" for ${event.date} at ${event.startTime}`,
        date: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('Failed to add event:', error);
      throw error;
    }
  },

  updateEvent: async (id, updates) => {
    try {
      await updateCalendarEvent(id, updates);
      
      const existing = get().events.find(e => e.id === id);
      
      // Auto-generate timeline event if completed
      if (updates.status === 'Completed' && existing?.status !== 'Completed') {
        await createTimelineEvent({
          customerId: existing?.customerId || 'system',
          type: existing?.type === 'Meeting' ? 'call_completed' : 'follow_up',
          title: `${existing?.type} Completed`,
          description: `Completed "${existing?.title}"`,
          date: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('Failed to update event:', error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      await deleteCalendarEvent(id);
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  },

  syncAICalendar: async (customers, matches) => {
    set({ isSyncing: true });
    try {
      const state = get();
      // 1. Delete all existing Pending AI generated events
      const pendingAIEvents = state.events.filter(e => e.generatedByAI && e.status === 'Pending');
      const pendingIds = pendingAIEvents.map(e => e.id);
      
      if (pendingIds.length > 0) {
        await batchDeleteEvents(pendingIds);
      }

      // 2. Generate new events deterministically
      const newEvents = generateOperationalEvents(customers, matches);
      if (newEvents.length > 0) {
        await batchCreateEvents(newEvents);
      }

      // 3. Generate Insights (doesn't wait for Firestore)
      const insightsText = await generateCalendarInsights(customers, matches, state.events);
      set({ insights: insightsText });
      
    } catch (error) {
      console.error('Failed to sync AI calendar:', error);
    } finally {
      set({ isSyncing: false });
    }
  }
}));
