import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { Conversation, Message } from '@/types';

const CONVERSATIONS = 'conversations';
const MESSAGES = 'messages';

function convsRef() {
  return collection(db, CONVERSATIONS);
}

function convDoc(id: string) {
  return doc(db, CONVERSATIONS, id);
}

function msgsRef() {
  return collection(db, MESSAGES);
}

export async function getConversations(): Promise<Conversation[]> {
  const q = query(convsRef(), orderBy('lastMessageTime', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Conversation
  );
}

export async function createConversation(
  data: Omit<Conversation, 'id'>
): Promise<string> {
  const docRef = await addDoc(convsRef(), data);
  return docRef.id;
}

export async function sendMessage(
  conversationId: string,
  data: Omit<Message, 'id'>
): Promise<string> {
  // Add message
  const docRef = await addDoc(msgsRef(), {
    ...data,
    conversationId,
  });

  // Update conversation's last message
  await updateDoc(convDoc(conversationId), {
    lastMessage: data.content,
    lastMessageTime: data.timestamp,
  });

  return docRef.id;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const q = query(
    msgsRef(),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message);
}

export function subscribeToConversations(
  callback: (conversations: Conversation[]) => void
): Unsubscribe {
  const q = query(convsRef(), orderBy('lastMessageTime', 'desc'));
  return onSnapshot(q, (snap) => {
    const convs = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Conversation
    );
    callback(convs);
  });
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    msgsRef(),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Message
    );
    callback(msgs);
  });
}
