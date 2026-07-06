import { create } from 'zustand';
import { dayCompletionRepository } from '@/db/repositories';
import { computeStreak } from '@/utils/streak';

type StreakState = {
  childId: string | null;
  streak: number;
  load: (childId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export const useStreakStore = create<StreakState>((set, get) => ({
  childId: null,
  streak: 0,

  load: async (childId: string) => {
    const list = await dayCompletionRepository.listRecentCompletions(childId);
    set({ childId, streak: computeStreak(list) });
  },

  refresh: async () => {
    const childId = get().childId;
    if (!childId) return;
    const list = await dayCompletionRepository.listRecentCompletions(childId);
    set({ streak: computeStreak(list) });
  },
}));
