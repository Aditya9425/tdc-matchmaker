import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { Note } from '@/types';

const COLLECTION = 'notes';

function notesRef() {
  return collection(db, COLLECTION);
}

function noteDoc(id: string) {
  return doc(db, COLLECTION, id);
}

export async function addNote(
  data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(notesRef(), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateNote(
  id: string,
  data: Partial<Pick<Note, 'content'>>
): Promise<void> {
  await updateDoc(noteDoc(id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await deleteDoc(noteDoc(id));
}

export async function getCustomerNotes(customerId: string): Promise<Note[]> {
  const q = query(
    notesRef(),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Note);
}

export function subscribeToNotes(
  customerId: string,
  callback: (notes: Note[]) => void
): Unsubscribe {
  const q = query(
    notesRef(),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const notes = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Note);
    callback(notes);
  });
}
