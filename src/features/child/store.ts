import { create } from 'zustand';
import { Child } from '@/db/models';
import { childRepository, appMetaRepository } from '@/db/repositories';
import { ensureDefaultTasks } from '@/db/repositories/taskRepository';

const DEFAULT_AVATARS = ['🐣', '🐻', '🐰', '🐱', '🦊', '🐶', '🐼', '🦁'];
const DEFAULT_COLORS = ['#FFB6C9', '#9AD1FF', '#B7E8A8', '#FFE38A', '#C6B8FF', '#7FD8C6'];

type ChildState = {
  children: Child[];
  activeChildId: string | null;
  isLoading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setActiveChild: (id: string) => Promise<void>;
  addChild: (input: {
    name: string;
    avatarEmoji?: string;
    avatarColor?: string;
    avatarImageUri?: string | null;
    schoolArrivalTime?: string;
  }) => Promise<Child>;
  updateChild: (
    id: string,
    input: Partial<Pick<Child, 'name' | 'avatarEmoji' | 'avatarColor' | 'avatarImageUri' | 'schoolArrivalTime'>>
  ) => Promise<void>;
  removeChild: (id: string) => Promise<void>;
};

export const useChildStore = create<ChildState>((set, get) => ({
  children: [],
  activeChildId: null,
  isLoading: false,
  loaded: false,

  load: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    const children = await childRepository.listChildren();
    let activeChildId = await appMetaRepository.getMeta(appMetaRepository.META_KEYS.activeChildId);
    if (!activeChildId || !children.find((c) => c.id === activeChildId)) {
      activeChildId = children[0]?.id ?? null;
    }
    set({ children, activeChildId, isLoading: false, loaded: true });
  },

  setActiveChild: async (id: string) => {
    set({ activeChildId: id });
    await appMetaRepository.setMeta(appMetaRepository.META_KEYS.activeChildId, id);
  },

  addChild: async (input) => {
    const existingCount = get().children.length;
    const child = await childRepository.createChild({
      name: input.name,
      avatarEmoji: input.avatarEmoji ?? DEFAULT_AVATARS[existingCount % DEFAULT_AVATARS.length],
      avatarColor: input.avatarColor ?? DEFAULT_COLORS[existingCount % DEFAULT_COLORS.length],
      avatarImageUri: input.avatarImageUri ?? null,
      schoolArrivalTime: input.schoolArrivalTime ?? '08:20',
    });
    await ensureDefaultTasks(child.id);
    const children = [...get().children, child];
    set({ children, activeChildId: get().activeChildId ?? child.id });
    if (!get().activeChildId) {
      await appMetaRepository.setMeta(appMetaRepository.META_KEYS.activeChildId, child.id);
    }
    return child;
  },

  updateChild: async (id, input) => {
    await childRepository.updateChild(id, input);
    set({
      children: get().children.map((c) => (c.id === id ? { ...c, ...input } : c)),
    });
  },

  removeChild: async (id: string) => {
    await childRepository.deleteChild(id);
    const children = get().children.filter((c) => c.id !== id);
    let activeChildId = get().activeChildId;
    if (activeChildId === id) {
      activeChildId = children[0]?.id ?? null;
      if (activeChildId) {
        await appMetaRepository.setMeta(appMetaRepository.META_KEYS.activeChildId, activeChildId);
      }
    }
    set({ children, activeChildId });
  },
}));

export function useActiveChild(): Child | null {
  const { children, activeChildId } = useChildStore();
  return children.find((c) => c.id === activeChildId) ?? null;
}
