import { create } from 'zustand';
import { Reward } from '@/db/models';
import { rewardRepository } from '@/db/repositories';
import { usePointsStore } from '@/features/points/store';
import { todayKey } from '@/utils/date';

type RewardsState = {
  childId: string | null;
  rewards: Reward[];
  load: (childId: string) => Promise<void>;
  createReward: (input: { name: string; icon: string; description?: string; imageUri?: string | null; pointCost: number }) => Promise<void>;
  updateReward: (id: string, input: Partial<Pick<Reward, 'name' | 'icon' | 'description' | 'imageUri' | 'pointCost' | 'isActive'>>) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  exchange: (reward: Reward) => Promise<boolean>;
};

export const useRewardsStore = create<RewardsState>((set, get) => ({
  childId: null,
  rewards: [],

  load: async (childId: string) => {
    const rewards = await rewardRepository.listRewards(childId);
    set({ childId, rewards });
  },

  createReward: async (input) => {
    const childId = get().childId!;
    const reward = await rewardRepository.createReward({ childId, ...input });
    set({ rewards: [...get().rewards, reward] });
  },

  updateReward: async (id, input) => {
    await rewardRepository.updateReward(id, input);
    set({ rewards: get().rewards.map((r) => (r.id === id ? { ...r, ...input } : r)) });
  },

  deleteReward: async (id: string) => {
    await rewardRepository.deleteReward(id);
    set({ rewards: get().rewards.filter((r) => r.id !== id) });
  },

  exchange: async (reward: Reward) => {
    const points = usePointsStore.getState();
    if (points.total < reward.pointCost) return false;
    await points.spend(reward.childId, todayKey(), reward.pointCost, `${reward.name}と交換`);
    return true;
  },
}));
