/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import type { AppUser } from '@/types';
import {
  loginWithEmail,
  loginWithGoogle as firebaseLoginWithGoogle,
  logout as firebaseLogout,
  onAuthStateChange,
} from '@/firebase/auth';
import toast from 'react-hot-toast';

interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await loginWithEmail(email, password);
      const user: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email,
        displayName: firebaseUser.displayName,
      };
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Welcome back!');
    } catch (err: any) {
      const message =
        err?.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : err?.code === 'auth/too-many-requests'
            ? 'Too many attempts. Try again later'
            : err?.message || 'Login failed';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await firebaseLoginWithGoogle();
      const user: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName,
      };
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Welcome back!');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        const message = err?.message || 'Google login failed';
        set({ error: message, isLoading: false });
        toast.error(message);
      } else {
        set({ isLoading: false });
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      await firebaseLogout();
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out');
    } catch (err: any) {
      toast.error('Logout failed');
    }
  },

  initAuth: () => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        const user: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName,
        };
        set({ user, isAuthenticated: true, isInitialized: true });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    });
    return unsubscribe;
  },
}));
