import { create } from 'zustand';
import { Chore, ChoreRequest, PointHistory } from '@/db/models';
import { choreRequestRepository, pointHistoryRepository } from '@/db/repositories';
import { usePointsStore } from '@/features/points/store';
import { supabase } from '@/lib/supabase';
import { toLocalRow, toRemoteRow } from '@/features/sync/syncService';
import { generateId } from '@/utils/id';
import { todayKey } from '@/utils/date';

const CHORE_REQUEST_COLUMNS = [
  'id', 'childId', 'choreId', 'choreName', 'choreIcon', 'pointValue', 'status',
  'createdAt', 'resolvedAt', 'pointHistoryId', 'notifiedAt',
];

const POINT_HISTORY_COLUMNS = ['id', 'childId', 'date', 'type', 'amount', 'note', 'createdAt'];

type ChoreRequestsState = {
  requests: ChoreRequest[];
  justApproved: ChoreRequest | null;
  load: (childId: string) => Promise<void>;
  requestChore: (chore: Chore) => Promise<void>;
  pollRemote: (childIds: string[]) => Promise<void>;
  approve: (requestId: string) => Promise<void>;
  reject: (requestId: string) => Promise<void>;
  clearJustApproved: () => void;
};

export const useChoreRequestsStore = create<ChoreRequestsState>((set, get) => ({
  requests: [],
  justApproved: null,

  load: async (childId: string) => {
    const requests = await choreRequestRepository.listChoreRequests(childId);
    set({ requests });
  },

  requestChore: async (chore: Chore) => {
    const request = await choreRequestRepository.createChoreRequestLocal({
      childId: chore.childId,
      choreId: chore.id,
      choreName: chore.name,
      choreIcon: chore.icon,
      pointValue: chore.pointValue,
    });
    set({ requests: [request, ...get().requests] });

    try {
      await supabase
        .from('chore_request')
        .upsert(toRemoteRow(request), { onConflict: 'id' });
    } catch {
      // silent: the row still exists locally and is in CHILD_SCOPED_TABLES,
      // so it reaches Supabase on the next batch sync even if this fails.
    }
  },

  pollRemote: async (childIds: string[]) => {
    if (childIds.length === 0) return;
    const { data, error } = await supabase
      .from('chore_request')
      .select('*')
      .in('child_id', childIds)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data) return;

    const previousById = new Map(get().requests.map((r) => [r.id, r]));
    const activeChildId = usePointsStore.getState().childId;
    let newlyApproved: ChoreRequest | null = null;

    const localRows = data.map((row) => toLocalRow(row, CHORE_REQUEST_COLUMNS) as unknown as ChoreRequest);
    for (const row of localRows) {
      const prev = previousById.get(row.id);
      if (row.status === 'approved' && prev?.status !== 'approved' && row.childId === activeChildId) {
        newlyApproved = row;
      }
    }

    await choreRequestRepository.upsertChoreRequestsLocal(localRows);

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
      type: 'chore_complete',
      amount: request.pointValue,
      note: `${request.choreName}をおてつだいした`,
      createdAt: new Date().toISOString(),
    };

    const { error: pointError } = await supabase
      .from('point_history')
      .upsert(toRemoteRow(pointHistoryRow), { onConflict: 'id' });
    if (pointError) throw pointError;

    const resolvedAt = new Date().toISOString();
    const { error: requestError } = await supabase
      .from('chore_request')
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
      .from('chore_request')
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
