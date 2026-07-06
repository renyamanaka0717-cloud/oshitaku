import { create } from 'zustand';
import { Item, Subject, TimetableEntry, TimetableSet } from '@/db/models';
import {
  childRepository,
  subjectRepository,
  itemRepository,
  timetableRepository,
} from '@/db/repositories';
import { subjectPalette } from '@/theme';

type TimetableState = {
  childId: string | null;
  sets: TimetableSet[];
  activeSetId: string | null;
  subjects: Subject[];
  items: Item[];
  entries: TimetableEntry[];
  subjectItemMap: Record<string, string[]>;
  isLoading: boolean;
  load: (childId: string) => Promise<void>;

  createSet: (name: string) => Promise<TimetableSet>;
  renameSet: (id: string, name: string) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  setActiveSet: (id: string) => Promise<void>;

  createSubject: (name: string) => Promise<Subject>;
  updateSubject: (id: string, input: Partial<Pick<Subject, 'name' | 'color'>>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  setSubjectItems: (subjectId: string, itemIds: string[]) => Promise<void>;

  createItem: (name: string, icon: string) => Promise<Item>;
  updateItem: (id: string, input: Partial<Pick<Item, 'name' | 'icon'>>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;

  setSlot: (dayOfWeek: number, period: number, subjectId: string | null) => Promise<void>;

  getEntriesForDay: (dayOfWeek: number) => Array<TimetableEntry & { subject: Subject | undefined }>;
  getItemsForDay: (dayOfWeek: number) => Item[];
};

export const useTimetableStore = create<TimetableState>((set, get) => ({
  childId: null,
  sets: [],
  activeSetId: null,
  subjects: [],
  items: [],
  entries: [],
  subjectItemMap: {},
  isLoading: false,

  load: async (childId: string) => {
    set({ isLoading: true });
    await timetableRepository.ensureDefaultTimetableSet(childId);
    const [sets, child, subjects, items] = await Promise.all([
      timetableRepository.listTimetableSets(childId),
      childRepository.getChild(childId),
      subjectRepository.listSubjects(childId),
      itemRepository.listItems(childId),
    ]);
    let activeSetId = child?.activeTimetableSetId ?? null;
    if (!activeSetId || !sets.find((s) => s.id === activeSetId)) {
      activeSetId = sets[0]?.id ?? null;
    }
    const entries = activeSetId ? await timetableRepository.listTimetable(activeSetId) : [];
    const map = await subjectRepository.getItemIdsForSubjects(subjects.map((s) => s.id));
    const subjectItemMap: Record<string, string[]> = {};
    map.forEach((v, k) => (subjectItemMap[k] = v));
    set({ childId, sets, activeSetId, subjects, items, entries, subjectItemMap, isLoading: false });
  },

  createSet: async (name: string) => {
    const childId = get().childId!;
    const newSet = await timetableRepository.createTimetableSet(childId, name);
    await childRepository.setActiveTimetableSet(childId, newSet.id);
    set({ sets: [...get().sets, newSet], activeSetId: newSet.id, entries: [] });
    return newSet;
  },

  renameSet: async (id: string, name: string) => {
    await timetableRepository.renameTimetableSet(id, name);
    set({ sets: get().sets.map((s) => (s.id === id ? { ...s, name } : s)) });
  },

  deleteSet: async (id: string) => {
    const { sets, activeSetId, childId } = get();
    if (sets.length <= 1 || !childId) return;
    await timetableRepository.deleteTimetableSet(id);
    const remaining = sets.filter((s) => s.id !== id);

    if (activeSetId !== id) {
      set({ sets: remaining });
      return;
    }

    const nextActiveId = remaining[0]?.id ?? null;
    if (nextActiveId) {
      await childRepository.setActiveTimetableSet(childId, nextActiveId);
    }
    const entries = nextActiveId ? await timetableRepository.listTimetable(nextActiveId) : [];
    set({ sets: remaining, activeSetId: nextActiveId, entries });
  },

  setActiveSet: async (id: string) => {
    const { childId, activeSetId } = get();
    if (!childId || activeSetId === id) return;
    await childRepository.setActiveTimetableSet(childId, id);
    const entries = await timetableRepository.listTimetable(id);
    set({ activeSetId: id, entries });
  },

  createSubject: async (name: string) => {
    const childId = get().childId!;
    const color = subjectPalette[get().subjects.length % subjectPalette.length];
    const subject = await subjectRepository.createSubject({ childId, name, color });
    set({ subjects: [...get().subjects, subject] });
    return subject;
  },

  updateSubject: async (id, input) => {
    await subjectRepository.updateSubject(id, input);
    set({
      subjects: get().subjects.map((s) => (s.id === id ? { ...s, ...input } : s)),
    });
  },

  deleteSubject: async (id: string) => {
    await subjectRepository.deleteSubject(id);
    const { [id]: _removed, ...rest } = get().subjectItemMap;
    set({
      subjects: get().subjects.filter((s) => s.id !== id),
      entries: get().entries.filter((e) => e.subjectId !== id),
      subjectItemMap: rest,
    });
  },

  setSubjectItems: async (subjectId: string, itemIds: string[]) => {
    await subjectRepository.setSubjectItems(subjectId, itemIds);
    set({ subjectItemMap: { ...get().subjectItemMap, [subjectId]: itemIds } });
  },

  createItem: async (name: string, icon: string) => {
    const childId = get().childId!;
    const item = await itemRepository.createItem({ childId, name, icon });
    set({ items: [...get().items, item] });
    return item;
  },

  updateItem: async (id, input) => {
    await itemRepository.updateItem(id, input);
    set({ items: get().items.map((i) => (i.id === id ? { ...i, ...input } : i)) });
  },

  deleteItem: async (id: string) => {
    await itemRepository.deleteItem(id);
    const map = { ...get().subjectItemMap };
    for (const key of Object.keys(map)) {
      map[key] = map[key].filter((itemId) => itemId !== id);
    }
    set({ items: get().items.filter((i) => i.id !== id), subjectItemMap: map });
  },

  setSlot: async (dayOfWeek: number, period: number, subjectId: string | null) => {
    const { childId, activeSetId } = get();
    if (!childId || !activeSetId) return;
    await timetableRepository.setTimetableSlot({
      childId,
      timetableSetId: activeSetId,
      dayOfWeek,
      period,
      subjectId,
    });
    const entries = get().entries.filter(
      (e) => !(e.dayOfWeek === dayOfWeek && e.period === period)
    );
    if (subjectId) {
      entries.push({
        id: `${activeSetId}-${dayOfWeek}-${period}`,
        childId,
        timetableSetId: activeSetId,
        dayOfWeek,
        period,
        subjectId,
      });
    }
    set({ entries });
  },

  getEntriesForDay: (dayOfWeek: number) => {
    const { entries, subjects } = get();
    return entries
      .filter((e) => e.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.period - b.period)
      .map((e) => ({ ...e, subject: subjects.find((s) => s.id === e.subjectId) }));
  },

  getItemsForDay: (dayOfWeek: number) => {
    const { entries, subjectItemMap, items } = get();
    const subjectIds = entries.filter((e) => e.dayOfWeek === dayOfWeek).map((e) => e.subjectId);
    const itemIdSet = new Set<string>();
    for (const subjectId of subjectIds) {
      for (const itemId of subjectItemMap[subjectId] ?? []) {
        itemIdSet.add(itemId);
      }
    }
    const seenNames = new Set<string>();
    const result: Item[] = [];
    for (const itemId of itemIdSet) {
      const item = items.find((i) => i.id === itemId);
      if (!item) continue;
      if (seenNames.has(item.name)) continue;
      seenNames.add(item.name);
      result.push(item);
    }
    return result;
  },
}));
