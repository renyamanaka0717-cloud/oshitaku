import { getDb } from '../client';
import { TimetableEntry } from '../models';
import { generateId } from '@/utils/id';

export async function listTimetable(childId: string): Promise<TimetableEntry[]> {
  const db = await getDb();
  return db.getAllAsync<TimetableEntry>(
    'SELECT * FROM timetable_entry WHERE childId = ? ORDER BY dayOfWeek ASC, period ASC',
    [childId]
  );
}

export async function listTimetableForDay(
  childId: string,
  dayOfWeek: number
): Promise<TimetableEntry[]> {
  const db = await getDb();
  return db.getAllAsync<TimetableEntry>(
    'SELECT * FROM timetable_entry WHERE childId = ? AND dayOfWeek = ? ORDER BY period ASC',
    [childId, dayOfWeek]
  );
}

export async function setTimetableSlot(input: {
  childId: string;
  dayOfWeek: number;
  period: number;
  subjectId: string | null;
}): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<TimetableEntry>(
    'SELECT * FROM timetable_entry WHERE childId = ? AND dayOfWeek = ? AND period = ?',
    [input.childId, input.dayOfWeek, input.period]
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
      'INSERT INTO timetable_entry (id, childId, dayOfWeek, period, subjectId) VALUES (?, ?, ?, ?, ?)',
      [generateId(), input.childId, input.dayOfWeek, input.period, input.subjectId]
    );
  }
}
