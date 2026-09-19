import { getDb } from '../client';
import { RewardRequest } from '../models';
import { generateId } from '@/utils/id';

export async function listRewardRequests(childId: string): Promise<RewardRequest[]> {
  const db = await getDb();
  return db.getAllAsync<RewardRequest>(
    'SELECT * FROM reward_request WHERE childId = ? ORDER BY createdAt DESC',
    [childId]
  );
}

export async function createRewardRequestLocal(input: {
  childId: string;
  rewardId: string;
  rewardName: string;
  rewardIcon: string;
  pointCost: number;
}): Promise<RewardRequest> {
  const db = await getDb();
  const request: RewardRequest = {
    id: generateId(),
    childId: input.childId,
    rewardId: input.rewardId,
    rewardName: input.rewardName,
    rewardIcon: input.rewardIcon,
    pointCost: input.pointCost,
    status: 'pending',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    pointHistoryId: null,
    notifiedAt: null,
  };
  await db.runAsync(
    `INSERT INTO reward_request
     (id, childId, rewardId, rewardName, rewardIcon, pointCost, status, createdAt, resolvedAt, pointHistoryId, notifiedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      request.id,
      request.childId,
      request.rewardId,
      request.rewardName,
      request.rewardIcon,
      request.pointCost,
      request.status,
      request.createdAt,
      request.resolvedAt,
      request.pointHistoryId,
      request.notifiedAt,
    ]
  );
  return request;
}

export async function upsertRewardRequestsLocal(rows: RewardRequest[]): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const row of rows) {
      await db.runAsync(
        `INSERT OR REPLACE INTO reward_request
         (id, childId, rewardId, rewardName, rewardIcon, pointCost, status, createdAt, resolvedAt, pointHistoryId, notifiedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.childId,
          row.rewardId,
          row.rewardName,
          row.rewardIcon,
          row.pointCost,
          row.status,
          row.createdAt,
          row.resolvedAt,
          row.pointHistoryId,
          row.notifiedAt,
        ]
      );
    }
  });
}

export async function updateRewardRequestStatusLocal(
  id: string,
  patch: Partial<Pick<RewardRequest, 'status' | 'resolvedAt' | 'pointHistoryId'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(patch);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (patch as Record<string, unknown>)[f]) as (string | null)[];
  await db.runAsync(`UPDATE reward_request SET ${setClause} WHERE id = ?`, [...values, id]);
}
