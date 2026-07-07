import { getDb } from '../client';
import { Chore } from '../models';
import { generateId } from '@/utils/id';

type Row = Omit<Chore, 'isActive'> & { isActive: number };
function toModel(row: Row): Chore {
  return { ...row, isActive: !!row.isActive };
}

export async function listChores(childId: string, activeOnly = false): Promise<Chore[]> {
  const db = await getDb();
  const rows = activeOnly
    ? await db.getAllAsync<Row>(
        'SELECT * FROM chore WHERE childId = ? AND isActive = 1 ORDER BY pointValue ASC',
        [childId]
      )
    : await db.getAllAsync<Row>(
        'SELECT * FROM chore WHERE childId = ? ORDER BY pointValue ASC',
        [childId]
      );
  return rows.map(toModel);
}

export async function createChore(input: {
  childId: string;
  name: string;
  icon: string;
  pointValue: number;
}): Promise<Chore> {
  const db = await getDb();
  const chore: Chore = {
    id: generateId(),
    childId: input.childId,
    name: input.name,
    icon: input.icon,
    pointValue: input.pointValue,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO chore (id, childId, name, icon, pointValue, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [chore.id, chore.childId, chore.name, chore.icon, chore.pointValue, 1, chore.createdAt]
  );
  return chore;
}

export async function updateChore(
  id: string,
  input: Partial<Pick<Chore, 'name' | 'icon' | 'pointValue' | 'isActive'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => {
    const v = (input as Record<string, unknown>)[f];
    return typeof v === 'boolean' ? (v ? 1 : 0) : v;
  }) as (string | number | null)[];
  await db.runAsync(`UPDATE chore SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteChore(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM chore WHERE id = ?', [id]);
}
