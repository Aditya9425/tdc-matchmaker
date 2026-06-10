/**
 * Firebase Seed Script
 * 
 * Seeds the Firestore database with 100 realistic Indian customer profiles,
 * ensuring no undefined/null values, perfect cultural consistency,
 * and realistic match distributions based on compatibility scores.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import * as dotenv from 'dotenv';
import { generateCustomers } from '../src/data/seedProfiles';
import type { Customer } from '../src/types';
import { matchEngine } from '../src/services/ai/matchEngine';

// Load .env from project root
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate config
const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
if (missing.length > 0) {
  console.error(`❌ Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function clearCollection(collectionName: string) {
  const collRef = collection(db, collectionName);
  const snap = await getDocs(collRef);
  
  if (snap.size === 0) return;

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
  console.log(`   Cleared ${snap.size} documents from ${collectionName}`);
}

function validateProfile(profile: any) {
  const requiredFields = [
    'firstName', 'lastName', 'gender', 'age', 'dateOfBirth', 'city', 'state',
    'religion', 'caste', 'languagesKnown', 'undergraduateDegree', 'undergraduateCollege',
    'designation', 'currentCompany', 'annualIncome', 'familyType', 'siblings',
    'diet', 'smoking', 'drinking', 'hobbies', 'aboutMe', 'wantKids', 'openToRelocate',
    'relationshipGoal', 'careerFocus', 'familyOrientation', 'lifestyleType', 'flexibility',
    'marriageReadiness'
  ];

  for (const field of requiredFields) {
    const val = profile[field];
    if (val === undefined || val === null || val === '' || val === 'Unknown' || val === 'N/A' || val === 'undefined') {
      throw new Error(`Profile ${profile.id} (${profile.name}) failed validation: ${field} is invalid (${val})`);
    }
    if (Array.isArray(val) && val.length === 0) {
      throw new Error(`Profile ${profile.id} (${profile.name}) failed validation: ${field} array is empty`);
    }
  }
}

async function seed() {
  console.log('🌱 Starting strict Firebase seed...\n');

  // Step 1: Create auth user
  console.log('👤 Checking auth user...');
  try {
    await createUserWithEmailAndPassword(auth, 'demo@gmail.com', 'Demo123');
    const user = auth.currentUser;
    if (user) await updateProfile(user, { displayName: 'Matchmaker' });
    console.log('   ✅ Created demo@gmail.com');
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('   ⚠️  User already exists, signing in...');
      await signInWithEmailAndPassword(auth, 'demo@gmail.com', 'Demo123');
    } else {
      throw err;
    }
  }

  // Step 2: Clear old collections (EXCEPT users)
  console.log('\n🧹 Clearing old data (excluding users)...');
  const collections = ['customers', 'matches', 'notes', 'timelines', 'conversations', 'messages'];
  for (const coll of collections) {
    await clearCollection(coll);
  }

  // Step 3: Generate & validate customers
  console.log('\n👥 Generating and Validating 100 customers...');
  const customers = generateCustomers(100);
  
  for (const c of customers) {
    validateProfile(c);
  }
  console.log('   ✅ All 100 profiles passed strict validation (0 undefined, 0 null, 0 Unknown)');

  // Insert customers
  for (let i = 0; i < customers.length; i += 20) {
    const batch = writeBatch(db);
    const chunk = customers.slice(i, i + 20);
    chunk.forEach(c => {
      const ref = doc(db, 'customers', c.id);
      batch.set(ref, {
        ...c,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    await batch.commit();
  }
  console.log('   ✅ Inserted 100 profiles into Firestore');

  // Step 4: Generate matches based on realistic compatibility
  console.log('\n💕 Generating realistic matches...');
  
  let matchCount = 0;
  const matchesData = [];
  
  let sameGenderMatches = 0;
  let invalidMatches = 0;
  const scoreDistribution = {
    '60-70': 0,
    '70-80': 0,
    '80-90': 0,
    '90-95': 0,
    '95+': 0
  };

  for (const customer of customers) {
    const isMale = customer.gender === 'Male';
    
    // Only fetch strictly opposite gender candidates
    const candidates = customers.filter(c => 
      c.id !== customer.id && c.gender === (isMale ? 'Female' : 'Male')
    );

    const scoredCandidates = candidates
      .map(c => {
        // Validation check for same gender
        if (c.gender.toLowerCase() === customer.gender.toLowerCase()) {
          sameGenderMatches++;
          return null; // Should never happen with the filter above, but tracked per instructions
        }

        const score = matchEngine.calculateDeterministicScore(customer, c);
        
        if (score === 0) {
          invalidMatches++;
          return null;
        }

        return { candidate: c, score };
      })
      .filter((m): m is { candidate: Customer; score: number } => m !== null)
      .sort((a, b) => b.score - a.score);
    
    // Distribute matches realistically: 1 to 5 matches per person above 65%
    const numMatches = 1 + Math.floor(Math.random() * 5);
    const validMatches = scoredCandidates.filter(m => m.score >= 65).slice(0, numMatches);
    
    for (const match of validMatches) {
      matchesData.push({
        customerId: customer.id,
        matchedCustomerId: match.candidate.id,
        compatibilityScore: match.score,
        matchConfidence: Math.min(match.score + Math.floor(Math.random() * 10 - 5), 99),
        reasons: ['Strong algorithmic alignment', 'Compatible lifestyle and values', 'Geographic proximity'],
        concerns: ['AI snapshots generated algorithmically', 'Check detailed preferences'],
        conversationStarters: ['Discuss expectations around family', 'Talk about preferred living arrangements'],
        status: ['suggested', 'sent', 'accepted', 'meeting', 'declined'][Math.floor(Math.random() * 5)],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString(),
      });

      // Track score distribution
      if (match.score >= 95) scoreDistribution['95+']++;
      else if (match.score >= 90) scoreDistribution['90-95']++;
      else if (match.score >= 80) scoreDistribution['80-90']++;
      else if (match.score >= 70) scoreDistribution['70-80']++;
      else if (match.score >= 60) scoreDistribution['60-70']++;
    }
  }

  console.log('   📊 Debug Validation Metrics:');
  console.log(`      Same Gender Matches: ${sameGenderMatches}`);
  console.log(`      Invalid Matches: ${invalidMatches}`);
  console.log('      Score Distribution:');
  console.log(`        60-70: ${scoreDistribution['60-70']}`);
  console.log(`        70-80: ${scoreDistribution['70-80']}`);
  console.log(`        80-90: ${scoreDistribution['80-90']}`);
  console.log(`        90-95: ${scoreDistribution['90-95']}`);
  console.log(`        95+: ${scoreDistribution['95+']}`);

  const matchesBatch = writeBatch(db);
  for (const m of matchesData) {
    matchesBatch.set(doc(collection(db, 'matches')), m);
    matchCount++;
  }
  await matchesBatch.commit();
  console.log(`   ✅ Generated ${matchCount} realistic matches (scores 65-98%)`);

  // Step 5: Conversations & Messages linked to valid matches
  console.log('\n💬 Seeding conversations for top matches...');
  const activeMatches = matchesData.filter(m => m.status === 'meeting' || m.status === 'accepted');
  let convCount = 0;
  
  for (const m of activeMatches.slice(0, 20)) { // Limit to 20 active convos
    const cust = customers.find(c => c.id === m.customerId);
    const matchCust = customers.find(c => c.id === m.matchedCustomerId);
    if (!cust || !matchCust) continue;

    const convRef = doc(collection(db, 'conversations'));
    const batch = writeBatch(db);

    batch.set(convRef, {
      customerId: cust.id,
      customerName: cust.name,
      customerAvatar: cust.photo,
      lastMessage: `When can we schedule a call with ${matchCust.firstName}?`,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 1,
      pinned: convCount < 2,
      status: 'active',
    });

    const msgs = [
      { sender: 'Matchmaker', content: `Hi ${cust.firstName}! I found a highly compatible profile for you: ${matchCust.name}. They are a ${matchCust.designation} from ${matchCust.city}.` },
      { sender: cust.name, content: `That sounds interesting! We have a ${m.compatibilityScore}% match. What makes us compatible?` },
      { sender: 'Matchmaker', content: `You both value a ${cust.familyOrientation.toLowerCase()} family orientation and have similar career goals.` },
      { sender: cust.name, content: `When can we schedule a call with ${matchCust.firstName}?` }
    ];

    msgs.forEach((msg, idx) => {
      batch.set(doc(collection(db, 'messages')), {
        conversationId: convRef.id,
        senderId: msg.sender === 'Matchmaker' ? 'matchmaker' : cust.id,
        senderName: msg.sender,
        senderAvatar: msg.sender === 'Matchmaker' ? '' : cust.photo,
        content: msg.content,
        timestamp: new Date(Date.now() - (4 - idx) * 3600000).toISOString(),
        read: true,
        type: 'text',
      });
    });

    await batch.commit();
    convCount++;
  }
  console.log(`   ✅ Created ${convCount} active conversations`);

  // Step 6: Notes & Timelines
  console.log('\n📝 Seeding notes & timelines...');
  const metaBatch = writeBatch(db);
  let noteCount = 0;
  let timeCount = 0;

  for (const c of customers) {
    // Add a note
    if (Math.random() > 0.5) {
      metaBatch.set(doc(collection(db, 'notes')), {
        customerId: c.id,
        content: `Customer prefers ${c.diet} diet and wants to settle in ${c.preferredCities[0]}. Highly values ${c.familyOrientation.toLowerCase()} family setup.`,
        author: 'Matchmaker',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 15 * 86400000)).toISOString(),
        updatedAt: new Date().toISOString(),
      });
      noteCount++;
    }

    // Add timelines
    const events = [
      { type: 'profile_verified', title: 'Profile Verified', desc: 'Identity and education docs verified.' },
      { type: 'preferences_updated', title: 'AI Snapshot Completed', desc: 'Relationship goals and lifestyle defined.' }
    ];

    events.forEach(e => {
      metaBatch.set(doc(collection(db, 'timelines')), {
        customerId: c.id,
        type: e.type,
        title: e.title,
        description: e.desc,
        date: new Date(Date.now() - Math.floor(Math.random() * 30 * 86400000)).toISOString(),
      });
      timeCount++;
    });
  }

  await metaBatch.commit();
  console.log(`   ✅ Added ${noteCount} notes and ${timeCount} timeline events`);

  console.log('\n🎉 Complete Reseeding Successful! Database is pristine.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
