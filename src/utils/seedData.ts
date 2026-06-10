/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { db } from '@/firebase/config';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { generateCustomers } from '@/data/seedProfiles';

async function clearCollection(collectionName: string) {
  const collRef = collection(db, collectionName);
  const snap = await getDocs(collRef);
  
  if (snap.size === 0) {
    console.log(`Collection ${collectionName} is already empty.`);
    return;
  }

  // Firestore batches have a limit of 500 writes
  const batches = [];
  let currentBatch = writeBatch(db);
  let operationCount = 0;

  snap.docs.forEach((document) => {
    currentBatch.delete(document.ref);
    operationCount++;

    if (operationCount === 500) {
      batches.push(currentBatch.commit());
      currentBatch = writeBatch(db);
      operationCount = 0;
    }
  });

  if (operationCount > 0) {
    batches.push(currentBatch.commit());
  }

  await Promise.all(batches);
  console.log(`Cleared ${snap.size} documents from ${collectionName}.`);
}

export async function clearAllCollections() {
  const collectionsToClear = [
    'customers',
    'matches',
    'timelines',
    'notes',
    'conversations',
    'messages',
    'shortlists'
  ];

  console.log('Starting database wipe...');
  for (const coll of collectionsToClear) {
    await clearCollection(coll);
  }
  console.log('Database wiped successfully.');
}

export async function seedDummyProfiles(count: number = 100) {
  await clearAllCollections();

  console.log(`Generating ${count} realistic seed profiles...`);
  const profiles = generateCustomers(count);

  const customersRef = collection(db, 'customers');
  const batches = [];
  let currentBatch = writeBatch(db);
  let operationCount = 0;

  profiles.forEach((profile) => {
    // Generate a proper ID instead of using the custom one directly as doc ID
    // or use doc(customersRef, (profile as any).id) if we want to enforce the ID
    const docRef = doc(customersRef, (profile as any).id);
    currentBatch.set(docRef, {
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    operationCount++;

    if (operationCount === 500) {
      batches.push(currentBatch.commit());
      currentBatch = writeBatch(db);
      operationCount = 0;
    }
  });

  if (operationCount > 0) {
    batches.push(currentBatch.commit());
  }

  await Promise.all(batches);
  console.log(`Successfully seeded ${profiles.length} profiles.`);

  // Create timeline events for the seeded profiles
  await seedTimelines(profiles);
}

async function seedTimelines(profiles: unknown[]) {
  const timelinesRef = collection(db, 'timelines');
  const batches = [];
  let currentBatch = writeBatch(db);
  let operationCount = 0;

  profiles.forEach(profile => {
    const events = [
      { type: 'profile_verified', title: 'Profile Verified', date: new Date(Date.now() - 30 * 86400000).toISOString() },
      { type: 'call_completed', title: 'Onboarding Call Completed', date: new Date(Date.now() - 25 * 86400000).toISOString() },
      { type: 'preferences_updated', title: 'Preferences Updated', date: new Date(Date.now() - 15 * 86400000).toISOString() }
    ];

    events.forEach(event => {
      const docRef = doc(timelinesRef);
      currentBatch.set(docRef, {
        ...event,
        customerId: (profile as any).id,
        createdAt: new Date().toISOString()
      });
      operationCount++;

      if (operationCount === 500) {
        batches.push(currentBatch.commit());
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    });
  });

  if (operationCount > 0) {
    batches.push(currentBatch.commit());
  }

  await Promise.all(batches);
  console.log(`Successfully seeded timelines for ${profiles.length} profiles.`);
}
