import { create } from 'zustand';
import { Chore } from '@/db/models';
import { choreRepository } from '@/db/repositories';

type ChoresState = {
  childId: string | null;
  chores: Chore[];
  load: (childId: string) => Promise<void>;
  createChore: (input: { name: string; icon: string; pointValue: number }) => Promise<void>;
  updateChore: (id: string, input: Partial<Pick<Chore, 'name' | 'icon' | 'pointValue' | 'isActive'>>) => Promise<void>;
  deleteChore: (id: string) => Promise<void>;
};

export const useChoresStore = create<ChoresState>((set, get) => ({
  childId: null,
  chores: [],

  load: async (childId: string) => {
    const chores = await choreRepository.listChores(childId);
    set({ childId, chores });
  },

  createChore: async (input) => {
    const childId = get().childId!;
    const chore = await choreRepository.createChore({ childId, ...input });
    set({ chores: [...get().chores, chore] });
  },

  updateChore: async (id, input) => {
    await choreRepository.updateChore(id, input);
    set({ chores: get().chores.map((c) => (c.id === id ? { ...c, ...input } : c)) });
  },

  deleteChore: async (id: string) => {
    await choreRepository.deleteChore(id);
    set({ chores: get().chores.filter((c) => c.id !== id) });
  },
}));
