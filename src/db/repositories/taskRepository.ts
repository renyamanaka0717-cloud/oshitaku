import { getDb } from '../client';
import { EveningTask, MorningTask } from '../models';
import { generateId } from '@/utils/id';
import { recordTombstone } from '../tombstone';

type Table = 'morning_task' | 'evening_task';

type Row = {
  id: string;
  childId: string;
  label: string;
  icon: string;
  sortOrder: number;
  daysOfWeek: string;
};

function toModel<T>(row: Row): T {
  return {
    ...row,
    daysOfWeek: JSON.parse(row.daysOfWeek || '[0,1,2,3,4,5,6]'),
  } as unknown as T;
}

async function listTasks<T>(table: Table, childId: string): Promise<T[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    `SELECT * FROM ${table} WHERE childId = ? ORDER BY sortOrder ASC`,
    [childId]
  );
  return rows.map((row) => toModel<T>(row));
}

async function createTask<T>(
  table: Table,
  input: { childId: string; label: string; icon: string; daysOfWeek?: number[] }
): Promise<T> {
  const db = await getDb();
  const countRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${table} WHERE childId = ?`,
    [input.childId]
  );
  const row: Row = {
    id: generateId(),
    childId: input.childId,
    label: input.label,
    icon: input.icon,
    sortOrder: countRow?.count ?? 0,
    daysOfWeek: JSON.stringify(input.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]),
  };
  await db.runAsync(
    `INSERT INTO ${table} (id, childId, label, icon, sortOrder, daysOfWeek) VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, row.childId, row.label, row.icon, row.sortOrder, row.daysOfWeek]
  );
  return toModel<T>(row);
}

async function updateTask(
  table: Table,
  id: string,
  input: Partial<{ label: string; icon: string; sortOrder: number; daysOfWeek: number[] }>
): Promise<void> {
  const db = await getDb();
  const patch: Record<string, unknown> = { ...input };
  if (input.daysOfWeek) patch.daysOfWeek = JSON.stringify(input.daysOfWeek);
  const fields = Object.keys(patch);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = ?`).join(', ');
  const values = fields.map((f) => patch[f]) as (string | number | null)[];
  await db.runAsync(`UPDATE ${table} SET ${setClause} WHERE id = ?`, [...values, id]);
}

async function deleteTask(table: Table, id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
  await recordTombstone(table, id);
}

async function moveTask(table: Table, childId: string, id: string, direction: 'up' | 'down'): Promise<void> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    `SELECT * FROM ${table} WHERE childId = ? ORDER BY sortOrder ASC`,
    [childId]
  );
  const index = rows.findIndex((r) => r.id === id);
  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= rows.length) return;

  const a = rows[index];
  const b = rows[swapWith];
  await db.withTransactionAsync(async () => {
    await db.runAsync(`UPDATE ${table} SET sortOrder = ? WHERE id = ?`, [b.sortOrder, a.id]);
    await db.runAsync(`UPDATE ${table} SET sortOrder = ? WHERE id = ?`, [a.sortOrder, b.id]);
  });
}

export const listMorningTasks = (childId: string) => listTasks<MorningTask>('morning_task', childId);
export const createMorningTask = (input: { childId: string; label: string; icon: string; daysOfWeek?: number[] }) =>
  createTask<MorningTask>('morning_task', input);
export const updateMorningTask = (
  id: string,
  input: Partial<Pick<MorningTask, 'label' | 'icon' | 'sortOrder' | 'daysOfWeek'>>
) => updateTask('morning_task', id, input);
export const deleteMorningTask = (id: string) => deleteTask('morning_task', id);
export const moveMorningTask = (childId: string, id: string, direction: 'up' | 'down') =>
  moveTask('morning_task', childId, id, direction);

export const listEveningTasks = (childId: string) => listTasks<EveningTask>('evening_task', childId);
export const createEveningTask = (input: { childId: string; label: string; icon: string; daysOfWeek?: number[] }) =>
  createTask<EveningTask>('evening_task', input);
export const updateEveningTask = (
  id: string,
  input: Partial<Pick<EveningTask, 'label' | 'icon' | 'sortOrder' | 'daysOfWeek'>>
) => updateTask('evening_task', id, input);
export const deleteEveningTask = (id: string) => deleteTask('evening_task', id);
export const moveEveningTask = (childId: string, id: string, direction: 'up' | 'down') =>
  moveTask('evening_task', childId, id, direction);

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
