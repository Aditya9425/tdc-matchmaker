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
import type { Match, Customer } from '@/types';

const COLLECTION = 'matches';

function matchesRef() {
  return collection(db, COLLECTION);
}

function matchDoc(id: string) {
  return doc(db, COLLECTION, id);
}

export async function createMatch(data: Omit<Match, 'id'>): Promise<string> {
  const docRef = await addDoc(matchesRef(), data);
  return docRef.id;
}

export async function getMatchesByCustomer(
  customerId: string
): Promise<Match[]> {
  // Firestore doesn't support OR queries across different fields easily,
  // so we run two queries and merge
  const q1 = query(
    matchesRef(),
    where('customerId', '==', customerId),
    orderBy('compatibilityScore', 'desc')
  );
  const q2 = query(
    matchesRef(),
    where('matchedCustomerId', '==', customerId),
    orderBy('compatibilityScore', 'desc')
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  const matchMap = new Map<string, Match>();
  [...snap1.docs, ...snap2.docs].forEach((d) => {
    if (!matchMap.has(d.id)) {
      matchMap.set(d.id, { id: d.id, ...d.data() } as Match);
    }
  });

  return Array.from(matchMap.values()).sort(
    (a, b) => b.compatibilityScore - a.compatibilityScore
  );
}

export async function getAllMatches(): Promise<Match[]> {
  const snap = await getDocs(matchesRef());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Match);
}

export async function updateMatchStatus(
  id: string,
  status: Match['status']
): Promise<void> {
  await updateDoc(matchDoc(id), { status });
}

export async function updateMatchAnalysis(
  id: string,
  aiAnalysis: NonNullable<Match['aiAnalysis']>
): Promise<void> {
  await updateDoc(matchDoc(id), { aiAnalysis });
}

export async function deleteMatch(id: string): Promise<void> {
  await deleteDoc(matchDoc(id));
}

/**
 * Calculate compatibility score between two customers based on shared attributes.
 * Returns a score from 0-100.
 */
export function calculateCompatibility(
  c1: Customer,
  c2: Customer
): number {
  let score = 50; // base

  // Same religion
  if (c1.religion === c2.religion) score += 10;
  // Same city
  if (c1.city === c2.city) score += 8;
  // Same state
  else if (c1.state === c2.state) score += 4;
  // Relocation compatibility
  if (
    c1.relocation === 'Open to Relocate' ||
    c2.relocation === 'Open to Relocate'
  )
    score += 5;
  // Similar career focus
  if (c1.careerFocus === c2.careerFocus) score += 6;
  // Family orientation match
  if (c1.familyOrientation === c2.familyOrientation) score += 8;
  // Lifestyle match
  if (c1.lifestyleType === c2.lifestyleType) score += 5;
  // Age gap (smaller is better)
  const ageDiff = Math.abs(c1.age - c2.age);
  if (ageDiff <= 2) score += 8;
  else if (ageDiff <= 5) score += 4;
  // Shared hobbies
  const sharedHobbies = c1.hobbies.filter((h) => c2.hobbies.includes(h));
  score += Math.min(sharedHobbies.length * 2, 6);

  return Math.min(score, 100);
}

export function subscribeToMatches(
  customerId: string,
  callback: (matches: Match[]) => void
): Unsubscribe {
  // Subscribe to matches where customerId field matches
  const q = query(matchesRef(), where('customerId', '==', customerId));
  return onSnapshot(q, async () => {
    // Re-fetch full merged set on any change
    const matches = await getMatchesByCustomer(customerId);
    callback(matches);
  });
}
