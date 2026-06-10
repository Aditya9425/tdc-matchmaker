import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';

export async function dismissSystemTask(taskId: string): Promise<void> {
  const todayStr = new Date().toISOString().split('T')[0];
  const ref = doc(collection(db, 'dismissed_tasks'));
  await setDoc(ref, {
    taskId,
    dismissedAt: new Date().toISOString(),
    date: todayStr
  });
}

export async function getDismissedTasksForToday(): Promise<string[]> {
  const todayStr = new Date().toISOString().split('T')[0];
  const q = query(collection(db, 'dismissed_tasks'), where('date', '==', todayStr));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data().taskId);
}
