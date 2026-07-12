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

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loaded: false,
  error: null,

  load: async () => {
    const { data } = await supabase.auth.getSession();
    set({ session: data.session, loaded: true });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });
  },

  signUp: async (email: string, password: string) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    set({ session: data.session });
    return true;
  },

  signIn: async (email: string, password: string) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    set({ session: data.session });
    return true;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
