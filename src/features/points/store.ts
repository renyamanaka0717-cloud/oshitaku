import { create } from 'zustand';
import { PointHistory, PointRule } from '@/db/models';
import { pointHistoryRepository, pointRuleRepository } from '@/db/repositories';

type PointsState = {
  childId: string | null;
  total: number;
  history: PointHistory[];
  rule: PointRule | null;
  load: (childId: string) => Promise<void>;
  refresh: () => Promise<void>;
  updateRule: (patch: Partial<Pick<PointRule, 'morningComplete' | 'eveningComplete' | 'onTime' | 'noForgottenItems'>>) => Promise<void>;
  spend: (childId: string, date: string, amount: number, note: string) => Promise<void>;
};

export const usePointsStore = create<PointsState>((set, get) => ({
  childId: null,
  total: 0,
  history: [],
  rule: null,

  load: async (childId: string) => {
    const [total, history, rule] = await Promise.all([
      pointHistoryRepository.getTotalPoints(childId),
      pointHistoryRepository.listPointHistory(childId),
      pointRuleRepository.getPointRule(childId),
    ]);
    set({ childId, total, history, rule });
  },

  refresh: async () => {
    const childId = get().childId;
    if (!childId) return;
    const [total, history] = await Promise.all([
      pointHistoryRepository.getTotalPoints(childId),
      pointHistoryRepository.listPointHistory(childId),
    ]);
    set({ total, history });
  },

  updateRule: async (patch) => {
    const childId = get().childId;
    if (!childId) return;
    const rule = await pointRuleRepository.updatePointRule(childId, patch);
    set({ rule });
  },

  spend: async (childId: string, date: string, amount: number, note: string) => {
    await pointHistoryRepository.addPointHistory({
      childId,
      date,
      type: 'reward_exchange',
      amount: -amount,
      note,
    });
    await get().refresh();
  },
}));
