import { create } from 'zustand';
import { appMetaRepository } from '@/db/repositories';

type ParentAuthState = {
  hasPin: boolean;
  isUnlocked: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  lock: () => void;
};

export const useParentAuthStore = create<ParentAuthState>((set) => ({
  hasPin: false,
  isUnlocked: false,
  loaded: false,

  load: async () => {
    const pin = await appMetaRepository.getMeta(appMetaRepository.META_KEYS.parentPin);
    set({ hasPin: !!pin, loaded: true });
  },

  setPin: async (pin: string) => {
    await appMetaRepository.setMeta(appMetaRepository.META_KEYS.parentPin, pin);
    set({ hasPin: true, isUnlocked: true });
  },

  verifyPin: async (pin: string) => {
    const stored = await appMetaRepository.getMeta(appMetaRepository.META_KEYS.parentPin);
    const ok = stored === pin;
    if (ok) set({ isUnlocked: true });
    return ok;
  },

  lock: () => set({ isUnlocked: false }),
}));
