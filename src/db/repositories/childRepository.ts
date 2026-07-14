import { getDb } from '../client';
import { Child } from '../models';
import { generateId } from '@/utils/id';
import { recordTombstone } from '../tombstone';

type Row = Omit<Child, 'schoolArrivalTimes'> & { schoolArrivalTimes: string };

function toModel(row: Row): Child {
  return { ...row, schoolArrivalTimes: JSON.parse(row.schoolArrivalTimes || '{}') };
}

export async function listChildren(): Promise<Child[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM child ORDER BY sortOrder ASC');
  return rows.map(toModel);
}

export async function getChild(id: string): Promise<Child | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM child WHERE id = ?', [id]);
  return row ? toModel(row) : null;
}

export async function createChild(input: {
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  avatarImageUri?: string | null;
  schoolArrivalTimes: Record<number, string>;
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
    avatarImageUri: input.avatarImageUri ?? null,
    schoolArrivalTimes: input.schoolArrivalTimes,
    sortOrder: countRow?.count ?? 0,
    createdAt: new Date().toISOString(),
    activeTimetableSetId: null,
  };
  await db.runAsync(
    `INSERT INTO child (id, name, avatarEmoji, avatarColor, avatarImageUri, schoolArrivalTime, schoolArrivalTimes, sortOrder, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      child.id,
      child.name,
      child.avatarEmoji,
      child.avatarColor,
      child.avatarImageUri,
      child.schoolArrivalTimes[1] ?? '08:20',
      JSON.stringify(child.schoolArrivalTimes),
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

export async function setActiveTimetableSet(childId: string, timetableSetId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE child SET activeTimetableSetId = ? WHERE id = ?', [timetableSetId, childId]);
}

export async function updateChild(
  id: string,
  input: Partial<
    Pick<Child, 'name' | 'avatarEmoji' | 'avatarColor' | 'avatarImageUri' | 'schoolArrivalTimes' | 'sortOrder'>
  >
): Promise<void> {
  const db = await getDb();
  const patch: Record<string, unknown> = { ...input };
  if (input.schoolArrivalTimes) patch.schoolArrivalTimes = JSON.stringify(input.schoolArrivalTimes);
  const fields = Object.keys(patch);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => patch[f]) as (string | number | null)[];
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
    await db.runAsync('DELETE FROM timetable_set WHERE childId = ?', [id]);
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
  await recordTombstone('child', id);
}
