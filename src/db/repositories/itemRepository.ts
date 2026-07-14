import { getDb } from '../client';
import { Item } from '../models';
import { generateId } from '@/utils/id';
import { recordTombstone } from '../tombstone';

export async function listItems(childId: string): Promise<Item[]> {
  const db = await getDb();
  return db.getAllAsync<Item>(
    'SELECT * FROM item WHERE childId = ? ORDER BY createdAt ASC',
    [childId]
  );
}

export async function getItemsByIds(ids: string[]): Promise<Item[]> {
  if (ids.length === 0) return [];
  const db = await getDb();
  const placeholders = ids.map(() => '?').join(', ');
  return db.getAllAsync<Item>(`SELECT * FROM item WHERE id IN (${placeholders})`, ids);
}

export async function createItem(input: {
  childId: string;
  name: string;
  icon: string;
}): Promise<Item> {
  const db = await getDb();
  const item: Item = {
    id: generateId(),
    childId: input.childId,
    name: input.name,
    icon: input.icon,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    'INSERT INTO item (id, childId, name, icon, createdAt) VALUES (?, ?, ?, ?, ?)',
    [item.id, item.childId, item.name, item.icon, item.createdAt]
  );
  return item;
}

export async function updateItem(
  id: string,
  input: Partial<Pick<Item, 'name' | 'icon'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (input as Record<string, unknown>)[f]) as (string | number | null)[];
  await db.runAsync(`UPDATE item SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDb();
  const subjectItemRows = await db.getAllAsync<{ id: string }>(
    'SELECT id FROM subject_item WHERE itemId = ?',
    [id]
  );
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM subject_item WHERE itemId = ?', [id]);
    await db.runAsync('DELETE FROM item WHERE id = ?', [id]);
  });
  await recordTombstone('item', id);
  for (const row of subjectItemRows) await recordTombstone('subject_item', row.id);
}
