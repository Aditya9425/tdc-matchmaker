import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth';
import { auth } from './config';

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  return firebaseOnAuthStateChanged(auth, callback);
}
