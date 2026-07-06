import { getDb } from '../client';
import { PointHistory, PointHistoryType } from '../models';
import { generateId } from '@/utils/id';

export async function addPointHistory(input: {
  childId: string;
  date: string;
  type: PointHistoryType;
  amount: number;
  note?: string;
}): Promise<PointHistory> {
  const db = await getDb();
  const entry: PointHistory = {
    id: generateId(),
    childId: input.childId,
    date: input.date,
    type: input.type,
    amount: input.amount,
    note: input.note ?? '',
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO point_history (id, childId, date, type, amount, note, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [entry.id, entry.childId, entry.date, entry.type, entry.amount, entry.note, entry.createdAt]
  );
  return entry;
}

export async function getTotalPoints(childId: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM point_history WHERE childId = ?',
    [childId]
  );
  return row?.total ?? 0;
}

export async function listPointHistory(childId: string, limit = 50): Promise<PointHistory[]> {
  const db = await getDb();
  return db.getAllAsync<PointHistory>(
    'SELECT * FROM point_history WHERE childId = ? ORDER BY createdAt DESC LIMIT ?',
    [childId, limit]
  );
}
