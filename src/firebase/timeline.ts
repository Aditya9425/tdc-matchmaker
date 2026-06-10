import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { TimelineEvent } from '@/types';

const COLLECTION = 'timelines';

function timelinesRef() {
  return collection(db, COLLECTION);
}

export async function createTimelineEvent(
  data: Omit<TimelineEvent, 'id'>
): Promise<string> {
  const docRef = await addDoc(timelinesRef(), data);
  return docRef.id;
}

export async function getTimelineEvents(
  customerId: string
): Promise<TimelineEvent[]> {
  const q = query(
    timelinesRef(),
    where('customerId', '==', customerId),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as TimelineEvent
  );
}

export function subscribeToTimeline(
  customerId: string,
  callback: (events: TimelineEvent[]) => void
): Unsubscribe {
  const q = query(
    timelinesRef(),
    where('customerId', '==', customerId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const events = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as TimelineEvent
    );
    callback(events);
  });
}

export async function getGlobalTimelineEvents(
  limitCount: number = 25
): Promise<TimelineEvent[]> {
  const q = query(
    timelinesRef(),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as TimelineEvent
  );
}

export function subscribeToGlobalTimeline(
  limitCount: number = 25,
  callback: (events: TimelineEvent[]) => void
): Unsubscribe {
  const q = query(
    timelinesRef(),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    const events = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as TimelineEvent
    );
    callback(events);
  });
}
