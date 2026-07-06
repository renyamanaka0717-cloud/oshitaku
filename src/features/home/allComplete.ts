import { useMorningStore } from '@/features/morning/store';
import { useEveningStore } from '@/features/evening/store';
import { useItemsStore } from '@/features/items/store';

export function isAllCompleteToday(): boolean {
  const morningDone = useMorningStore.getState().isComplete();
  const eveningDone = useEveningStore.getState().isComplete();
  const itemsState = useItemsStore.getState();
  const itemsDone = itemsState.items.length === 0 || itemsState.isComplete();
  return morningDone && eveningDone && itemsDone;
}
