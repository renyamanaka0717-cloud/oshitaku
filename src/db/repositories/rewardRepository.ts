import { getDb } from '../client';
import { Reward } from '../models';
import { generateId } from '@/utils/id';

type Row = Omit<Reward, 'isActive'> & { isActive: number };
function toModel(row: Row): Reward {
  return { ...row, isActive: !!row.isActive };
}

export async function listRewards(childId: string, activeOnly = false): Promise<Reward[]> {
  const db = await getDb();
  const rows = activeOnly
    ? await db.getAllAsync<Row>(
        'SELECT * FROM reward WHERE childId = ? AND isActive = 1 ORDER BY pointCost ASC',
        [childId]
      )
    : await db.getAllAsync<Row>(
        'SELECT * FROM reward WHERE childId = ? ORDER BY pointCost ASC',
        [childId]
      );
  return rows.map(toModel);
}

export async function createReward(input: {
  childId: string;
  name: string;
  icon: string;
  description?: string;
  imageUri?: string | null;
  pointCost: number;
}): Promise<Reward> {
  const db = await getDb();
  const reward: Reward = {
    id: generateId(),
    childId: input.childId,
    name: input.name,
    icon: input.icon,
    description: input.description ?? '',
    imageUri: input.imageUri ?? null,
    pointCost: input.pointCost,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO reward (id, childId, name, icon, description, imageUri, pointCost, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reward.id,
      reward.childId,
      reward.name,
      reward.icon,
      reward.description,
      reward.imageUri,
      reward.pointCost,
      1,
      reward.createdAt,
    ]
  );
  return reward;
}

export async function updateReward(
  id: string,
  input: Partial<Pick<Reward, 'name' | 'icon' | 'description' | 'imageUri' | 'pointCost' | 'isActive'>>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => {
    const v = (input as Record<string, unknown>)[f];
    return typeof v === 'boolean' ? (v ? 1 : 0) : v;
  }) as (string | number | null)[];
  await db.runAsync(`UPDATE reward SET ${setClause} WHERE id = ?`, [...values, id]);
}

export async function deleteReward(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM reward WHERE id = ?', [id]);
}
