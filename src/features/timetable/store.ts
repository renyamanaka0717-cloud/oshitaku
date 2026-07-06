import { create } from 'zustand';
import { Item, Subject, TimetableEntry } from '@/db/models';
import {
  subjectRepository,
  itemRepository,
  timetableRepository,
} from '@/db/repositories';
import { subjectPalette } from '@/theme';

type TimetableState = {
  childId: string | null;
  subjects: Subject[];
  items: Item[];
  entries: TimetableEntry[];
  subjectItemMap: Record<string, string[]>;
  isLoading: boolean;
  load: (childId: string) => Promise<void>;

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
  subjects: [],
  items: [],
  entries: [],
  subjectItemMap: {},
  isLoading: false,

  load: async (childId: string) => {
    set({ isLoading: true });
    const [subjects, items, entries] = await Promise.all([
      subjectRepository.listSubjects(childId),
      itemRepository.listItems(childId),
      timetableRepository.listTimetable(childId),
    ]);
    const map = await subjectRepository.getItemIdsForSubjects(subjects.map((s) => s.id));
    const subjectItemMap: Record<string, string[]> = {};
    map.forEach((v, k) => (subjectItemMap[k] = v));
    set({ childId, subjects, items, entries, subjectItemMap, isLoading: false });
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
    const childId = get().childId!;
    await timetableRepository.setTimetableSlot({ childId, dayOfWeek, period, subjectId });
    const entries = get().entries.filter(
      (e) => !(e.dayOfWeek === dayOfWeek && e.period === period)
    );
    if (subjectId) {
      entries.push({ id: `${childId}-${dayOfWeek}-${period}`, childId, dayOfWeek, period, subjectId });
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
