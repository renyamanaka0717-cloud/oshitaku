import { getDb } from '../client';
import { EveningTask, MorningTask } from '../models';
import { generateId } from '@/utils/id';

type Table = 'morning_task' | 'evening_task';

async function listTasks<T>(table: Table, childId: string): Promise<T[]> {
  const db = await getDb();
  return db.getAllAsync<T>(
    `SELECT * FROM ${table} WHERE childId = ? ORDER BY sortOrder ASC`,
    [childId]
  );
}

async function createTask<T extends { id: string }>(
  table: Table,
  input: { childId: string; label: string; icon: string }
): Promise<T> {
  const db = await getDb();
  const countRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table} WHERE childId = ?`,
    [input.childId]
  );
  const task = {
    id: generateId(),
    childId: input.childId,
    label: input.label,
    icon: input.icon,
    sortOrder: countRow?.count ?? 0,
  } as unknown as T;
  const t = task as unknown as { id: string; childId: string; label: string; icon: string; sortOrder: number };
  await db.runAsync(
    `INSERT INTO ${table} (id, childId, label, icon, sortOrder) VALUES (?, ?, ?, ?, ?)`,
    [t.id, t.childId, t.label, t.icon, t.sortOrder]
  );
  return task;
}

async function updateTask(
  table: Table,
  id: string,
  input: Partial<{ label: string; icon: string; sortOrder: number }>
): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(input);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => (input as Record<string, unknown>)[f]) as (string | number | null)[];
  await db.runAsync(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...values, id]);
}

async function deleteTask(table: Table, id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

export const listMorningTasks = (childId: string) => listTasks<MorningTask>('morning_task', childId);
export const createMorningTask = (input: { childId: string; label: string; icon: string }) =>
  createTask<MorningTask>('morning_task', input);
export const updateMorningTask = (
  id: string,
  input: Partial<Pick<MorningTask, 'label' | 'icon' | 'sortOrder'>>
) => updateTask('morning_task', id, input);
export const deleteMorningTask = (id: string) => deleteTask('morning_task', id);

export const listEveningTasks = (childId: string) => listTasks<EveningTask>('evening_task', childId);
export const createEveningTask = (input: { childId: string; label: string; icon: string }) =>
  createTask<EveningTask>('evening_task', input);
export const updateEveningTask = (
  id: string,
  input: Partial<Pick<EveningTask, 'label' | 'icon' | 'sortOrder'>>
) => updateTask('evening_task', id, input);
export const deleteEveningTask = (id: string) => deleteTask('evening_task', id);

export const DEFAULT_MORNING_TASKS: Array<{ label: string; icon: string }> = [
  { label: '顔を洗う', icon: '🧼' },
  { label: '歯磨き', icon: '🪥' },
  { label: '朝ごはん', icon: '🍞' },
  { label: '着替える', icon: '👕' },
  { label: 'ランドセル確認', icon: '🎒' },
];

export const DEFAULT_EVENING_TASKS: Array<{ label: string; icon: string }> = [
  { label: '宿題', icon: '✏️' },
  { label: '水筒', icon: '🧴' },
  { label: 'ハンカチ', icon: '🧻' },
  { label: '明日の服', icon: '👚' },
];

export async function ensureDefaultTasks(childId: string): Promise<void> {
  const [morning, evening] = await Promise.all([
    listMorningTasks(childId),
    listEveningTasks(childId),
  ]);
  if (morning.length === 0) {
    for (const t of DEFAULT_MORNING_TASKS) {
      await createMorningTask({ childId, ...t });
    }
  }
  if (evening.length === 0) {
    for (const t of DEFAULT_EVENING_TASKS) {
      await createEveningTask({ childId, ...t });
    }
  }
}
