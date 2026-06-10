/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  doc,
  getDocs,
  getDoc,
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
import type { Customer, CustomerStatus } from '@/types';

const COLLECTION = 'customers';

function customersRef() {
  return collection(db, COLLECTION);
}

function customerDoc(id: string) {
  return doc(db, COLLECTION, id);
}

export async function getCustomers(): Promise<Customer[]> {
  const snap = await getDocs(query(customersRef(), orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Customer);
}

export async function getCustomerById(
  id: string
): Promise<Customer | undefined> {
  const snap = await getDoc(customerDoc(id));
  if (!snap.exists()) return undefined;
  return { id: snap.id, ...snap.data() } as Customer;
}

export async function createCustomer(
  data: Omit<Customer, 'id'>
): Promise<string> {
  const docRef = await addDoc(customersRef(), data);
  return docRef.id;
}

export async function updateCustomer(
  id: string,
  data: Partial<Customer>
): Promise<void> {
  await updateDoc(customerDoc(id), data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await deleteDoc(customerDoc(id));
}

export async function searchCustomers(q: string): Promise<Customer[]> {
  // Firestore doesn't support full-text search — fetch all and filter client-side
  const all = await getCustomers();
  const lower = q.toLowerCase();
  return all.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.city.toLowerCase().includes(lower) ||
      c.profession.toLowerCase().includes(lower) ||
      c.status.toLowerCase().includes(lower) ||
      c.religion.toLowerCase().includes(lower)
  );
}

export interface CustomerFilters {
  status?: CustomerStatus;
  city?: string;
  religion?: string;
  gender?: string;
}

export async function filterCustomers(
  filters: CustomerFilters
): Promise<Customer[]> {
  let q = query(customersRef());

  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters.city) {
    q = query(q, where('city', '==', filters.city));
  }
  if (filters.religion) {
    q = query(q, where('religion', '==', filters.religion));
  }
  if (filters.gender) {
    q = query(q, where('gender', '==', filters.gender));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Customer);
}

export function subscribeToCustomers(
  callback: (customers: Customer[]) => void
): Unsubscribe {
  return onSnapshot(query(customersRef(), orderBy('name')), (snap) => {
    const customers = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Customer
    );
    callback(customers);
  });
}

export async function addToShortlist(customerId: string): Promise<void> {
  await addDoc(collection(db, 'shortlists'), { customerId, createdAt: new Date().toISOString() });
}

export async function getMatchSuggestions(customerId: string): Promise<any[]> {
  const snap = await getDocs(query(collection(db, 'matches'), where('customerId', '==', customerId), where('status', '==', 'suggested')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
