import { getDb } from '../client';
import { ChoreRequest } from '../models';
import { generateId } from '@/utils/id';

export async function listChoreRequests(childId: string): Promise<ChoreRequest[]> {
  const db = await getDb();
  return db.getAllAsync<ChoreRequest>(
    'SELECT * FROM chore_request WHERE childId = ? ORDER BY createdAt DESC',
    [childId]
  );
}

export async function createChoreRequestLocal(input: {
  childId: string;
  choreId: string;
  choreName: string;
  choreIcon: string;
  pointValue: number;
}): Promise<ChoreRequest> {
  const db = await getDb();
  const request: ChoreRequest = {
    id: generateId(),
    childId: input.childId,
    choreId: input.choreId,
    choreName: input.choreName,
    choreIcon: input.choreIcon,
    pointValue: input.pointValue,
    status: 'pending',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    pointHistoryId: null,
    notifiedAt: null,
  };
  await db.runAsync(
    `INSERT INTO chore_request
     (id, childId, choreId, choreName, choreIcon, pointValue, status, createdAt, resolvedAt, pointHistoryId, notifiedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      request.id,
      request.childId,
      request.choreId,
      request.choreName,
      request.choreIcon,
      request.pointValue,
      request.status,
      request.createdAt,
      request.resolvedAt,
      request.pointHistoryId,
      request.notifiedAt,
    ]
  );
  return request;
}

export async function upsertChoreRequestsLocal(rows: ChoreRequest[]): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const row of rows) {
      await db.runAsync(
        `INSERT OR REPLACE INTO chore_request
         (id, childId, choreId, choreName, choreIcon, pointValue, status, createdAt, resolvedAt, pointHistoryId, notifiedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.childId,
          row.choreId,
          row.choreName,
          row.choreIcon,
          row.pointValue,
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

export async function updateChoreRequestStatusLocal(
  id: string,
  patch: Partial<Pick<ChoreRequest, 'status' | 'resolvedAt' | 'pointHistoryId'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(patch);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (patch as Record<string, unknown>)[f]) as (string | null)[];
  await db.runAsync(`UPDATE chore_request SET ${setClause} WHERE id = ?`, [...values, id]);
}
