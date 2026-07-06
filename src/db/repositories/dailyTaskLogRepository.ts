import { getDb } from '../client';
import { ChecklistKind, DailyTaskLog } from '../models';
import { generateId } from '@/utils/id';

type Row = {
  id: string;
  childId: string;
  date: string;
  kind: ChecklistKind;
  refId: string;
  checked: number;
  checkedAt: string | null;
};

function toModel(row: Row): DailyTaskLog {
  return { ...row, checked: !!row.checked };
}

export async function listLogsForDate(
  childId: string,
  date: string,
  kind?: ChecklistKind
): Promise<DailyTaskLog[]> {
  const db = await getDb();
  const rows = kind
    ? await db.getAllAsync<Row>(
        'SELECT * FROM daily_task_log WHERE childId = ? AND date = ? AND kind = ?',
        [childId, date, kind]
      )
    : await db.getAllAsync<Row>(
        'SELECT * FROM daily_task_log WHERE childId = ? AND date = ?',
        [childId, date]
      );
  return rows.map(toModel);
}

export async function setChecked(input: {
  childId: string;
  date: string;
  kind: ChecklistKind;
  refId: string;
  checked: boolean;
}): Promise<void> {
  const db = await getDb();
  const existing = await db.getFirstAsync<Row>(
    'SELECT * FROM daily_task_log WHERE childId = ? AND date = ? AND kind = ? AND refId = ?',
    [input.childId, input.date, input.kind, input.refId]
  );
  const checkedAt = input.checked ? new Date().toISOString() : null;
  if (existing) {
    await db.runAsync(
      'UPDATE daily_task_log SET checked = ?, checkedAt = ? WHERE id = ?',
      [input.checked ? 1 : 0, checkedAt, existing.id]
    );
  } else {
    await db.runAsync(
      `INSERT INTO daily_task_log (id, childId, date, kind, refId, checked, checkedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        input.childId,
        input.date,
        input.kind,
        input.refId,
        input.checked ? 1 : 0,
        checkedAt,
      ]
    );
  }
}
