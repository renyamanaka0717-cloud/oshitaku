import { create } from 'zustand';
import { Child, Item } from '@/db/models';
import { dailyTaskLogRepository } from '@/db/repositories';
import { useTimetableStore } from '@/features/timetable/store';
import { evaluateNoForgottenItems, AwardResult } from '@/features/points/rules';
import { todayKey } from '@/utils/date';

type ItemsState = {
  childId: string | null;
  date: string;
  items: Item[];
  checked: Record<string, boolean>;
  isLoading: boolean;
  load: (childId: string) => Promise<void>;
  toggle: (child: Child, itemId: string) => Promise<AwardResult | null>;
  isComplete: () => boolean;
};

export const useItemsStore = create<ItemsState>((set, get) => ({
  childId: null,
  date: todayKey(),
  items: [],
  checked: {},
  isLoading: false,

  load: async (childId: string) => {
    set({ isLoading: true });
    const date = todayKey();
    const dayOfWeek = new Date().getDay();
    const items = useTimetableStore.getState().getItemsForDay(dayOfWeek);
    const logs = await dailyTaskLogRepository.listLogsForDate(childId, date, 'item');
    const checked: Record<string, boolean> = {};
    for (const log of logs) checked[log.refId] = log.checked;
    set({ childId, date, items, checked, isLoading: false });
  },

  toggle: async (child: Child, itemId: string) => {
    const { childId, date, checked } = get();
    if (!childId) return null;
    const nextChecked = !checked[itemId];
    await dailyTaskLogRepository.setChecked({
      childId,
      date,
      kind: 'item',
      refId: itemId,
      checked: nextChecked,
    });
    set({ checked: { ...checked, [itemId]: nextChecked } });

    if (nextChecked) {
      const itemIds = get().items.map((i) => i.id);
      return evaluateNoForgottenItems(child, date, itemIds);
    }
    return null;
  },

  isComplete: () => {
    const { items, checked } = get();
    return items.length > 0 && items.every((i) => checked[i.id]);
  },
}));

// Keep today's item list in sync whenever the parent edits the timetable,
// subjects, or item master list for the currently loaded child.
useTimetableStore.subscribe((state, prevState) => {
  const { childId } = useItemsStore.getState();
  if (!childId || state.childId !== childId) return;
  if (
    state.entries === prevState.entries &&
    state.subjectItemMap === prevState.subjectItemMap &&
    state.items === prevState.items
  ) {
    return;
  }
  const dayOfWeek = new Date().getDay();
  useItemsStore.setState({ items: state.getItemsForDay(dayOfWeek) });
});
