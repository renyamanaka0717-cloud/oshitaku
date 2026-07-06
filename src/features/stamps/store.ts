import { create } from 'zustand';
import { Stamp } from '@/db/models';
import { stampRepository } from '@/db/repositories';

type StampsState = {
  childId: string | null;
  stamps: Stamp[];
  load: (childId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export const useStampsStore = create<StampsState>((set, get) => ({
  childId: null,
  stamps: [],

  load: async (childId: string) => {
    const stamps = await stampRepository.listStamps(childId);
    set({ childId, stamps });
  },

  refresh: async () => {
    const childId = get().childId;
    if (!childId) return;
    const stamps = await stampRepository.listStamps(childId);
    set({ stamps });
  },
}));

export const STAMP_EMOJI: Record<string, string> = {
  star: '⭐',
  heart: '💖',
  sun: '☀️',
  leaf: '🍀',
  flower: '🌸',
  rainbow: '🌈',
  crown: '👑',
  diamond: '💎',
  shooting_star: '🌠',
};
