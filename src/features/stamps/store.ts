import { create } from 'zustand';
import { Stamp } from '@/db/models';
import { stampRepository } from '@/db/repositories';
import { STAMP_CATALOG_BY_ID } from '@/db/stampCatalog';

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
  ...Object.fromEntries(Object.entries(STAMP_CATALOG_BY_ID).map(([id, def]) => [id, def.emoji])),
  // legacy stamp types kept so previously earned stamps still render correctly
  heart: '💖',
  shooting_star: '🌠',
};
