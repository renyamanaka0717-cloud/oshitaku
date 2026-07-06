import { getDb } from '../client';
import { Child } from '../models';
import { generateId } from '@/utils/id';

export async function listChildren(): Promise<Child[]> {
  const db = await getDb();
  return db.getAllAsync<Child>('SELECT * FROM child ORDER BY sortOrder ASC');
}

export async function getChild(id: string): Promise<Child | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Child>('SELECT * FROM child WHERE id = ?', [id]);
  return row ?? null;
}

export async function createChild(input: {
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  schoolArrivalTime: string;
}): Promise<Child> {
  const db = await getDb();
  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM child'
  );
  const child: Child = {
    id: generateId(),
    name: input.name,
    avatarEmoji: input.avatarEmoji,
    avatarColor: input.avatarColor,
    schoolArrivalTime: input.schoolArrivalTime,
    sortOrder: countRow?.count ?? 0,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO child (id, name, avatarEmoji, avatarColor, schoolArrivalTime, sortOrder, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      child.id,
      child.name,
      child.avatarEmoji,
      child.avatarColor,
      child.schoolArrivalTime,
      child.sortOrder,
      child.createdAt,
    ]
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO point_rule (childId) VALUES (?)`,
    [child.id]
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO notification_setting (childId) VALUES (?)`,
    [child.id]
  );
  return child;
}

export async function updateChild(
  id: string,
  input: Partial<Pick<Child, 'name' | 'avatarEmoji' | 'avatarColor' | 'schoolArrivalTime' | 'sortOrder'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (input as Record<string, unknown>)[f]) as (string | number | null)[];
  await db.runAsync(`UPDATE child SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteChild(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'DELETE FROM subject_item WHERE subjectId IN (SELECT id FROM subject WHERE childId = ?)',
      [id]
    );
    await db.runAsync('DELETE FROM child WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM subject WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM item WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM timetable_entry WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM morning_task WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM evening_task WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM daily_task_log WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM day_completion WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM reward WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM point_history WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM stamp WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM notification_setting WHERE childId = ?', [id]);
    await db.runAsync('DELETE FROM point_rule WHERE childId = ?', [id]);
  });
}
