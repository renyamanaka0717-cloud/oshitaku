import { getDb } from '../client';
import { Subject } from '../models';
import { generateId } from '@/utils/id';

export async function listSubjects(childId: string): Promise<Subject[]> {
  const db = await getDb();
  return db.getAllAsync<Subject>(
    'SELECT * FROM subject WHERE childId = ? ORDER BY createdAt ASC',
    [childId]
  );
}

export async function createSubject(input: {
  childId: string;
  name: string;
  color: string;
}): Promise<Subject> {
  const db = await getDb();
  const subject: Subject = {
    id: generateId(),
    childId: input.childId,
    name: input.name,
    color: input.color,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO subject (id, childId, name, color, createdAt) VALUES (?, ?, ?, ?, ?)',
    [subject.id, subject.childId, subject.name, subject.color, subject.createdAt]
  );
  return subject;
}

export async function updateSubject(
  id: string,
  input: Partial<Pick<Subject, 'name' | 'color'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (input as Record<string, unknown>)[f]) as (string | number | null)[];
  await db.runAsync(`UPDATE subject SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteSubject(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM subject_item WHERE subjectId = ?', [id]);
    await db.runAsync('DELETE FROM timetable_entry WHERE subjectId = ?', [id]);
    await db.runAsync('DELETE FROM subject WHERE id = ?', [id]);
  });
}

export async function getSubjectItemIds(subjectId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ itemId: string }>(
    'SELECT itemId FROM subject_item WHERE subjectId = ?',
    [subjectId]
  );
  return rows.map((r) => r.itemId);
}

export async function setSubjectItems(subjectId: string, itemIds: string[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM subject_item WHERE subjectId = ?', [subjectId]);
    for (const itemId of itemIds) {
      await db.runAsync(
        'INSERT INTO subject_item (id, subjectId, itemId) VALUES (?, ?, ?)',
        [generateId(), subjectId, itemId]
      );
    }
  });
}

export async function getItemIdsForSubjects(subjectIds: string[]): Promise<Map<string, string[]>> {
  const db = await getDb();
  if (subjectIds.length === 0) return new Map();
  const placeholders = subjectIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<{ subjectId: string; itemId: string }>(
    `SELECT subjectId, itemId FROM subject_item WHERE subjectId IN (${placeholders})`,
    subjectIds
  );
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.subjectId) ?? [];
    list.push(row.itemId);
    map.set(row.subjectId, list);
  }
  return map;
}
