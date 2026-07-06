import { getDb } from '../client';
import { DayCompletion } from '../models';
import { generateId } from '@/utils/id';

type Row = {
  id: string;
  childId: string;
  date: string;
  morningCompleted: number;
  morningCompletedAt: string | null;
  morningOnTime: number;
  eveningCompleted: number;
  eveningCompletedAt: string | null;
  eveningOnTime: number;
  noForgottenItems: number;
  awardedRules: string;
};

function toModel(row: Row): DayCompletion {
  return {
    ...row,
    morningCompleted: !!row.morningCompleted,
    morningOnTime: !!row.morningOnTime,
    eveningCompleted: !!row.eveningCompleted,
    eveningOnTime: !!row.eveningOnTime,
    noForgottenItems: !!row.noForgottenItems,
    awardedRules: JSON.parse(row.awardedRules || '[]'),
  };
}

export async function getDayCompletion(
  childId: string,
  date: string
): Promise<DayCompletion | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(
    'SELECT * FROM day_completion WHERE childId = ? AND date = ?',
    [childId, date]
  );
  return row ? toModel(row) : null;
}

async function ensureRow(childId: string, date: string): Promise<Row> {
  const db = await getDb();
  const existing = await db.getFirstAsync<Row>(
    'SELECT * FROM day_completion WHERE childId = ? AND date = ?',
    [childId, date]
  );
  if (existing) return existing;
  const id = generateId();
  await db.runAsync(
    'INSERT INTO day_completion (id, childId, date) VALUES (?, ?, ?)',
    [id, childId, date]
  );
  return (await db.getFirstAsync<Row>('SELECT * FROM day_completion WHERE id = ?', [id]))!;
}

export async function updateDayCompletion(
  childId: string,
  date: string,
  patch: Partial<{
    morningCompleted: boolean;
    morningCompletedAt: string | null;
    morningOnTime: boolean;
    eveningCompleted: boolean;
    eveningCompletedAt: string | null;
    eveningOnTime: boolean;
    noForgottenItems: boolean;
  }>
): Promise<DayCompletion> {
  const db = await getDb();
  const row = await ensureRow(childId, date);
  const fields = Object.keys(patch);
  if (fields.length > 0) {
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => {
      const v = (patch as Record<string, unknown>)[f];
      return typeof v === 'boolean' ? (v ? 1 : 0) : v;
    }) as (string | number | null)[];
    await db.runAsync(`UPDATE day_completion SET ${setClause} WHERE id = ?`, [
      ...values,
      row.id,
    ]);
  }
  return (await getDayCompletion(childId, date))!;
}

export async function addAwardedRule(
  childId: string,
  date: string,
  ruleKey: string
): Promise<void> {
  const db = await getDb();
  const row = await ensureRow(childId, date);
  const current: string[] = JSON.parse(row.awardedRules || '[]');
  if (current.includes(ruleKey)) return;
  current.push(ruleKey);
  await db.runAsync('UPDATE day_completion SET awardedRules = ? WHERE id = ?', [
    JSON.stringify(current),
    row.id,
  ]);
}

export async function listRecentCompletions(
  childId: string,
  limit = 60
): Promise<DayCompletion[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM day_completion WHERE childId = ? ORDER BY date DESC LIMIT ?',
    [childId, limit]
  );
  return rows.map(toModel);
}
