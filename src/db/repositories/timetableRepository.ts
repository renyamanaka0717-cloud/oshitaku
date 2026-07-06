import { getDb } from '../client';
import { TimetableEntry, TimetableSet } from '../models';
import { generateId } from '@/utils/id';

export async function listTimetableSets(childId: string): Promise<TimetableSet[]> {
  const db = await getDb();
  return db.getAllAsync<TimetableSet>(
    'SELECT * FROM timetable_set WHERE childId = ? ORDER BY sortOrder ASC',
    [childId]
  );
}

export async function createTimetableSet(childId: string, name: string): Promise<TimetableSet> {
  const db = await getDb();
  const countRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM timetable_set WHERE childId = ?',
    [childId]
  );
  const set: TimetableSet = {
    id: generateId(),
    childId,
    name,
    sortOrder: countRow?.count ?? 0,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO timetable_set (id, childId, name, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?)',
    [set.id, set.childId, set.name, set.sortOrder, set.createdAt]
  );
  return set;
}

export async function ensureDefaultTimetableSet(childId: string): Promise<TimetableSet> {
  const db = await getDb();
  const existing = await db.getFirstAsync<TimetableSet>(
    'SELECT * FROM timetable_set WHERE childId = ? ORDER BY sortOrder ASC LIMIT 1',
    [childId]
  );
  const set = existing ?? (await createTimetableSet(childId, '通常の時間割'));
  const child = await db.getFirstAsync<{ activeTimetableSetId: string | null }>(
    'SELECT activeTimetableSetId FROM child WHERE id = ?',
    [childId]
  );
  if (!child?.activeTimetableSetId) {
    await db.runAsync('UPDATE child SET activeTimetableSetId = ? WHERE id = ?', [set.id, childId]);
  }
  return set;
}

export async function renameTimetableSet(id: string, name: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE timetable_set SET name = ? WHERE id = ?', [name, id]);
}

export async function deleteTimetableSet(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM timetable_entry WHERE timetableSetId = ?', [id]);
    await db.runAsync('DELETE FROM timetable_set WHERE id = ?', [id]);
  });
}

export async function listTimetable(timetableSetId: string): Promise<TimetableEntry[]> {
  const db = await getDb();
  return db.getAllAsync<TimetableEntry>(
    'SELECT * FROM timetable_entry WHERE timetableSetId = ? ORDER BY dayOfWeek ASC, period ASC',
    [timetableSetId]
  );
}

export async function listTimetableForDay(
  timetableSetId: string,
  dayOfWeek: number
): Promise<TimetableEntry[]> {
  const db = await getDb();
  return db.getAllAsync<TimetableEntry>(
    'SELECT * FROM timetable_entry WHERE timetableSetId = ? AND dayOfWeek = ? ORDER BY period ASC',
    [timetableSetId, dayOfWeek]
  );
}

export async function setTimetableSlot(input: {
  childId: string;
  timetableSetId: string;
  dayOfWeek: number;
  period: number;
  subjectId: string | null;
}): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<TimetableEntry>(
    'SELECT * FROM timetable_entry WHERE timetableSetId = ? AND dayOfWeek = ? AND period = ?',
    [input.timetableSetId, input.dayOfWeek, input.period]
  );

  if (!input.subjectId) {
    if (existing) {
      await db.runAsync('DELETE FROM timetable_entry WHERE id = ?', [existing.id]);
    }
    return;
  }

  if (existing) {
    await db.runAsync('UPDATE timetable_entry SET subjectId = ? WHERE id = ?', [
      input.subjectId,
      existing.id,
    ]);
  } else {
    await db.runAsync(
      'INSERT INTO timetable_entry (id, childId, timetableSetId, dayOfWeek, period, subjectId) VALUES (?, ?, ?, ?, ?, ?)',
      [generateId(), input.childId, input.timetableSetId, input.dayOfWeek, input.period, input.subjectId]
    );
  }
}
