import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type { CalendarEvent } from '@/types';

const COLLECTION = 'calendar_events';

export const calendarRef = () => collection(db, COLLECTION);
export const eventRef = (id: string) => doc(db, COLLECTION, id);

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
  const newRef = doc(calendarRef());
  const now = new Date().toISOString();
  
  const newEvent: CalendarEvent = {
    ...event,
    id: newRef.id,
    createdAt: now,
    updatedAt: now,
  };
  
  await setDoc(newRef, newEvent);
  return newEvent;
}

export async function batchCreateEvents(events: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
  if (events.length === 0) return;
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  events.forEach(event => {
    const newRef = doc(calendarRef());
    const newEvent: CalendarEvent = {
      ...event,
      id: newRef.id,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(newRef, newEvent);
  });

  await batch.commit();
}

export async function batchDeleteEvents(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach(id => {
    batch.delete(eventRef(id));
  });
  await batch.commit();
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
  const ref = eventRef(id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await deleteDoc(eventRef(id));
}

export function subscribeToCalendarEvents(
  callback: (events: CalendarEvent[]) => void,
  customerId?: string
): Unsubscribe {
  let q = query(calendarRef(), orderBy('date', 'asc'));
  
  if (customerId) {
    q = query(calendarRef(), where('customerId', '==', customerId), orderBy('date', 'asc'));
  }

  return onSnapshot(q, (snap) => {
    const events = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as CalendarEvent
    );
    callback(events);
  });
}
