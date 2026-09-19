import { create } from 'zustand';
import { Reward, RewardRequest, PointHistory } from '@/db/models';
import { rewardRequestRepository, pointHistoryRepository } from '@/db/repositories';
import { usePointsStore } from '@/features/points/store';
import { supabase } from '@/lib/supabase';
import { toLocalRow, toRemoteRow } from '@/features/sync/syncService';
import { generateId } from '@/utils/id';
import { todayKey } from '@/utils/date';

const REWARD_REQUEST_COLUMNS = [
  'id', 'childId', 'rewardId', 'rewardName', 'rewardIcon', 'pointCost', 'status',
  'createdAt', 'resolvedAt', 'pointHistoryId', 'notifiedAt',
];

const POINT_HISTORY_COLUMNS = ['id', 'childId', 'date', 'type', 'amount', 'note', 'createdAt'];

type RewardRequestsState = {
  requests: RewardRequest[];
  justApproved: RewardRequest | null;
  load: (childId: string) => Promise<void>;
  requestReward: (reward: Reward) => Promise<void>;
  pollRemote: (childIds: string[]) => Promise<void>;
  approve: (requestId: string) => Promise<void>;
  reject: (requestId: string) => Promise<void>;
  clearJustApproved: () => void;
};

export const useRewardRequestsStore = create<RewardRequestsState>((set, get) => ({
  requests: [],
  justApproved: null,

  load: async (childId: string) => {
    const requests = await rewardRequestRepository.listRewardRequests(childId);
    set({ requests });
  },

  requestReward: async (reward: Reward) => {
    const request = await rewardRequestRepository.createRewardRequestLocal({
      childId: reward.childId,
      rewardId: reward.id,
      rewardName: reward.name,
      rewardIcon: reward.icon,
      pointCost: reward.pointCost,
    });
    set({ requests: [request, ...get().requests] });

    try {
      await supabase
        .from('reward_request')
        .upsert(toRemoteRow(request), { onConflict: 'id' });
    } catch {
      // silent: the row still exists locally and is in CHILD_SCOPED_TABLES,
      // so it reaches Supabase on the next batch sync even if this fails.
    }
  },

  pollRemote: async (childIds: string[]) => {
    if (childIds.length === 0) return;
    const { data, error } = await supabase
      .from('reward_request')
      .select('*')
      .in('child_id', childIds)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data) return;

    const previousById = new Map(get().requests.map((r) => [r.id, r]));
    const activeChildId = usePointsStore.getState().childId;
    let newlyApproved: RewardRequest | null = null;

    const localRows = data.map((row) => toLocalRow(row, REWARD_REQUEST_COLUMNS) as unknown as RewardRequest);
    for (const row of localRows) {
      const prev = previousById.get(row.id);
      if (row.status === 'approved' && prev?.status !== 'approved' && row.childId === activeChildId) {
        newlyApproved = row;
      }
    }

    await rewardRequestRepository.upsertRewardRequestsLocal(localRows);

    for (const row of localRows) {
      if (row.status === 'approved' && row.pointHistoryId && row.childId === activeChildId) {
        await syncApprovedPointHistory(row.pointHistoryId);
      }
    }

    const merged = new Map(previousById);
    for (const row of localRows) merged.set(row.id, row);
    set({ requests: Array.from(merged.values()) });
    if (newlyApproved) set({ justApproved: newlyApproved });
  },

  approve: async (requestId: string) => {
    const request = get().requests.find((r) => r.id === requestId);
    if (!request) return;

    const pointHistoryId = generateId();
    const pointHistoryRow: PointHistory = {
      id: pointHistoryId,
      childId: request.childId,
      date: todayKey(),
      type: 'reward_exchange',
      amount: -request.pointCost,
      note: `${request.rewardName}とこうかん`,
      createdAt: new Date().toISOString(),
    };

    const { error: pointError } = await supabase
      .from('point_history')
      .upsert(toRemoteRow(pointHistoryRow), { onConflict: 'id' });
    if (pointError) throw pointError;

    const resolvedAt = new Date().toISOString();
    const { error: requestError } = await supabase
      .from('reward_request')
      .update({ status: 'approved', resolved_at: resolvedAt, point_history_id: pointHistoryId })
      .eq('id', requestId);
    if (requestError) throw requestError;

    set({
      requests: get().requests.map((r) =>
        r.id === requestId ? { ...r, status: 'approved', resolvedAt, pointHistoryId } : r
      ),
    });
  },

  reject: async (requestId: string) => {
    const resolvedAt = new Date().toISOString();
    const { error } = await supabase
      .from('reward_request')
      .update({ status: 'rejected', resolved_at: resolvedAt })
      .eq('id', requestId);
    if (error) throw error;

    set({
      requests: get().requests.map((r) =>
        r.id === requestId ? { ...r, status: 'rejected', resolvedAt } : r
      ),
    });
  },

  clearJustApproved: () => set({ justApproved: null }),
}));

async function syncApprovedPointHistory(pointHistoryId: string) {
  const db = usePointsStore.getState();
  const alreadyLocal = db.history.some((h) => h.id === pointHistoryId);
  if (alreadyLocal) return;

  const { data, error } = await supabase
    .from('point_history')
    .select('*')
    .eq('id', pointHistoryId)
    .maybeSingle();
  if (error || !data) return;

  const localRow = toLocalRow(data, POINT_HISTORY_COLUMNS) as unknown as PointHistory;
  await pointHistoryRepository.upsertPointHistoryLocal(localRow);
  await usePointsStore.getState().refresh();
}
