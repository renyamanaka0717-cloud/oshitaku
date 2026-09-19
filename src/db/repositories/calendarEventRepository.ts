import { getDb } from '../client';
import { CalendarEvent } from '../models';
import { generateId } from '@/utils/id';
import { recordTombstone } from '../tombstone';

export async function listCalendarEvents(childId: string): Promise<CalendarEvent[]> {
  const db = await getDb();
  return db.getAllAsync<CalendarEvent>(
    'SELECT * FROM calendar_event WHERE childId = ? ORDER BY date ASC',
    [childId]
  );
}

export async function listUpcomingCalendarEvents(
  childId: string,
  fromDate: string
): Promise<CalendarEvent[]> {
  const db = await getDb();
  return db.getAllAsync<CalendarEvent>(
    'SELECT * FROM calendar_event WHERE childId = ? AND date >= ? ORDER BY date ASC',
    [childId, fromDate]
  );
}

export async function createCalendarEvent(input: {
  childId: string;
  title: string;
  date: string;
  icon: string;
}): Promise<CalendarEvent> {
  const db = await getDb();
  const event: CalendarEvent = {
    id: generateId(),
    childId: input.childId,
    title: input.title,
    date: input.date,
    icon: input.icon,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO calendar_event (id, childId, title, date, icon, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [event.id, event.childId, event.title, event.date, event.icon, event.createdAt]
  );
  return event;
}

export async function updateCalendarEvent(
  id: string,
  input: Partial<Pick<CalendarEvent, 'title' | 'date' | 'icon'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (input as Record<string, unknown>)[f]) as (string | null)[];
  await db.runAsync(`UPDATE calendar_event SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM calendar_event WHERE id = ?', [id]);
  await recordTombstone('calendar_event', id);
}
