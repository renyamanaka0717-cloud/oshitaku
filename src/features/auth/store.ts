import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  loaded: boolean;
  error: string | null;
  load: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

function describeAuthError(error: unknown): string {
  if (error && typeof error === 'object') {
    const e = error as { message?: string; status?: number; code?: string; name?: string };
    const parts = [e.message, e.code, e.status ? `status ${e.status}` : null].filter(Boolean);
    if (parts.length > 0) return parts.join(' / ');
  }
  if (error instanceof Error) return error.message || error.name || 'unknown error';
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

let authListenerRegistered = false;

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loaded: false,
  error: null,

  load: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, loaded: true });
    if (!authListenerRegistered) {
      authListenerRegistered = true;
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session });
      });
    }
  },

  signUp: async (email: string, password: string) => {
    set({ error: null });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        set({ error: describeAuthError(error) });
        return false;
      }
      set({ session: data.session });
      return true;
    } catch (err) {
      set({ error: describeAuthError(err) });
      return false;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ error: describeAuthError(error) });
        return false;
      }
      set({ session: data.session });
      return true;
    } catch (err) {
      set({ error: describeAuthError(err) });
      return false;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
