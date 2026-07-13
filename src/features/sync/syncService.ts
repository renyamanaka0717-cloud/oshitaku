import { getDb } from '@/db/client';
import { supabase } from '@/lib/supabase';
import { useChildStore } from '@/features/child/store';

// Two directions:
//  - pushChildToCloud: local SQLite -> Supabase (backup)
//  - pullChildrenFromCloud: Supabase -> local SQLite (restore on a new device)
// Both use the same table/column config so they stay in sync with each other.

function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function toRemoteRow(
  row: Record<string, unknown>,
  jsonFields: string[] = [],
  boolFields: string[] = []
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    let v = value;
    if (jsonFields.includes(key) && typeof v === 'string') {
      try {
        v = JSON.parse(v);
      } catch {
        // leave as-is if it wasn't valid JSON
      }
    }
    if (boolFields.includes(key)) {
      v = !!v;
    }
    out[camelToSnake(key)] = v;
  }
  return out;
}

function toLocalRow(
  row: Record<string, unknown>,
  columns: string[],
  jsonFields: string[] = [],
  boolFields: string[] = []
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const col of columns) {
    const snakeKey = camelToSnake(col);
    let v = row[snakeKey] ?? row[col];
    if (jsonFields.includes(col)) {
      v = JSON.stringify(v ?? (col === 'schoolArrivalTimes' ? {} : []));
    } else if (boolFields.includes(col)) {
      v = v ? 1 : 0;
    }
    out[col] = v ?? null;
  }
  return out;
}

async function upsertLocalRows(table: string, columns: string[], rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const db = await getDb();
  const placeholders = `(${columns.map(() => '?').join(', ')})`;
  const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
  await db.withTransactionAsync(async () => {
    for (const row of rows) {
      await db.runAsync(sql, columns.map((c) => row[c] as string | number | null));
    }
  });
}

type TableSync = {
  table: string;
  onConflict: string;
  columns: string[];
  jsonFields?: string[];
  boolFields?: string[];
};

const CHILD_SCOPED_TABLES: TableSync[] = [
  { table: 'subject', onConflict: 'id', columns: ['id', 'childId', 'name', 'color', 'createdAt'] },
  { table: 'item', onConflict: 'id', columns: ['id', 'childId', 'name', 'icon', 'createdAt'] },
  { table: 'timetable_set', onConflict: 'id', columns: ['id', 'childId', 'name', 'sortOrder', 'createdAt'] },
  {
    table: 'timetable_entry',
    onConflict: 'id',
    columns: ['id', 'childId', 'timetableSetId', 'dayOfWeek', 'period', 'subjectId'],
  },
  {
    table: 'morning_task',
    onConflict: 'id',
    columns: ['id', 'childId', 'label', 'icon', 'sortOrder', 'daysOfWeek'],
    jsonFields: ['daysOfWeek'],
  },
  {
    table: 'evening_task',
    onConflict: 'id',
    columns: ['id', 'childId', 'label', 'icon', 'sortOrder', 'daysOfWeek'],
    jsonFields: ['daysOfWeek'],
  },
  {
    table: 'day_completion',
    onConflict: 'id',
    columns: [
      'id', 'childId', 'date', 'morningCompleted', 'morningCompletedAt', 'morningOnTime',
      'eveningCompleted', 'eveningCompletedAt', 'eveningOnTime', 'noForgottenItems', 'awardedRules',
    ],
    jsonFields: ['awardedRules'],
    boolFields: ['morningCompleted', 'morningOnTime', 'eveningCompleted', 'eveningOnTime', 'noForgottenItems'],
  },
  {
    table: 'reward',
    onConflict: 'id',
    columns: ['id', 'childId', 'name', 'icon', 'description', 'imageUri', 'pointCost', 'isActive', 'createdAt'],
    boolFields: ['isActive'],
  },
  {
    table: 'chore',
    onConflict: 'id',
    columns: ['id', 'childId', 'name', 'icon', 'pointValue', 'isActive', 'createdAt'],
    boolFields: ['isActive'],
  },
  {
    table: 'point_history',
    onConflict: 'id',
    columns: ['id', 'childId', 'date', 'type', 'amount', 'note', 'createdAt'],
  },
  {
    table: 'stamp',
    onConflict: 'id',
    columns: ['id', 'childId', 'date', 'kind', 'stampType', 'source', 'createdAt'],
  },
  {
    table: 'notification_setting',
    onConflict: 'child_id',
    columns: [
      'childId', 'morningEnabled', 'morningTime', 'eveningEnabled', 'eveningTime',
      'reminderEnabled', 'reminderMinutesAfter',
    ],
    boolFields: ['morningEnabled', 'eveningEnabled', 'reminderEnabled'],
  },
  {
    table: 'point_rule',
    onConflict: 'child_id',
    columns: ['childId', 'morningComplete', 'eveningComplete', 'onTime', 'noForgottenItems', 'perfectDayBonus'],
  },
];

// subject_item has no single-column PK locally reachable by a simple SELECT
// on child_id, so it's handled with its own small join query on push and its
// own subject-id lookup on pull.
const SUBJECT_ITEM_SYNC = { table: 'subject_item', onConflict: 'id', columns: ['id', 'subjectId', 'itemId'] };

const CHILD_COLUMNS = [
  'id', 'name', 'avatarEmoji', 'avatarColor', 'avatarImageUri', 'schoolArrivalTimes',
  'activeTimetableSetId', 'sortOrder', 'createdAt',
];

export type SyncProgress = { table: string; done: number; total: number };

export async function pushChildToCloud(
  childId: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  const parentId = sessionData.session?.user.id;
  if (!parentId) throw new Error('ログインしていません');

  const db = await getDb();

  const childRow = await db.getFirstAsync<Record<string, unknown>>(
    `SELECT ${CHILD_COLUMNS.join(', ')} FROM child WHERE id = ?`,
    [childId]
  );
  if (!childRow) throw new Error('お子さまの情報が見つかりません');

  const total = CHILD_SCOPED_TABLES.length + 2;
  let done = 0;

  const childRemote = toRemoteRow(childRow, ['schoolArrivalTimes']);
  childRemote.parent_id = parentId;
  const { error: childError } = await supabase.from('child').upsert(childRemote, { onConflict: 'id' });
  if (childError) throw childError;
  done += 1;
  onProgress?.({ table: 'child', done, total });

  for (const spec of CHILD_SCOPED_TABLES) {
    const rows = await db.getAllAsync<Record<string, unknown>>(
      `SELECT ${spec.columns.join(', ')} FROM ${spec.table} WHERE childId = ?`,
      [childId]
    );
    if (rows.length > 0) {
      const remoteRows = rows.map((r) => toRemoteRow(r, spec.jsonFields, spec.boolFields));
      const { error } = await supabase.from(spec.table).upsert(remoteRows, { onConflict: spec.onConflict });
      if (error) throw error;
    }
    done += 1;
    onProgress?.({ table: spec.table, done, total });
  }

  const subjectItemRows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT si.id, si.subjectId, si.itemId FROM subject_item si
     JOIN subject s ON s.id = si.subjectId WHERE s.childId = ?`,
    [childId]
  );
  if (subjectItemRows.length > 0) {
    const remoteRows = subjectItemRows.map((r) => toRemoteRow(r));
    const { error } = await supabase.from(SUBJECT_ITEM_SYNC.table).upsert(remoteRows, {
      onConflict: SUBJECT_ITEM_SYNC.onConflict,
    });
    if (error) throw error;
  }
  done += 1;
  onProgress?.({ table: 'subject_item', done, total });
}

export async function pullChildrenFromCloud(
  onProgress?: (progress: SyncProgress) => void
): Promise<{ childCount: number }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const parentId = sessionData.session?.user.id;
  if (!parentId) throw new Error('ログインしていません');

  const { data: remoteChildren, error: childFetchError } = await supabase
    .from('child')
    .select('*')
    .eq('parent_id', parentId);
  if (childFetchError) throw childFetchError;
  if (!remoteChildren || remoteChildren.length === 0) return { childCount: 0 };

  const total = remoteChildren.length * (CHILD_SCOPED_TABLES.length + 2);
  let done = 0;

  for (const remoteChild of remoteChildren) {
    const localChild = toLocalRow(remoteChild, CHILD_COLUMNS, ['schoolArrivalTimes']);
    let arrivalTimes: Record<string, string> = {};
    try {
      arrivalTimes = JSON.parse((localChild.schoolArrivalTimes as string) ?? '{}');
    } catch {
      // ignore, fall through to default below
    }
    const legacyArrivalTime = arrivalTimes['1'] ?? '08:20';

    const db = await getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO child
       (id, name, avatarEmoji, avatarColor, avatarImageUri, schoolArrivalTime, schoolArrivalTimes,
        activeTimetableSetId, sortOrder, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        localChild.id as string,
        localChild.name as string,
        localChild.avatarEmoji as string,
        localChild.avatarColor as string,
        (localChild.avatarImageUri as string) ?? null,
        legacyArrivalTime,
        localChild.schoolArrivalTimes as string,
        (localChild.activeTimetableSetId as string) ?? null,
        localChild.sortOrder as number,
        localChild.createdAt as string,
      ]
    );
    done += 1;
    onProgress?.({ table: 'child', done, total });

    const childId = remoteChild.id as string;

    for (const spec of CHILD_SCOPED_TABLES) {
      const { data, error } = await supabase.from(spec.table).select('*').eq('child_id', childId);
      if (error) throw error;
      if (data && data.length > 0) {
        const localRows = data.map((r) => toLocalRow(r, spec.columns, spec.jsonFields, spec.boolFields));
        await upsertLocalRows(spec.table, spec.columns, localRows);
      }
      done += 1;
      onProgress?.({ table: spec.table, done, total });
    }

    const localSubjectIds = await db.getAllAsync<{ id: string }>(
      'SELECT id FROM subject WHERE childId = ?',
      [childId]
    );
    if (localSubjectIds.length > 0) {
      const { data: subjectItemRows, error: siError } = await supabase
        .from('subject_item')
        .select('id, subject_id, item_id')
        .in('subject_id', localSubjectIds.map((s) => s.id));
      if (siError) throw siError;
      if (subjectItemRows && subjectItemRows.length > 0) {
        const localRows = subjectItemRows.map((r) =>
          toLocalRow(r as unknown as Record<string, unknown>, SUBJECT_ITEM_SYNC.columns)
        );
        await upsertLocalRows(SUBJECT_ITEM_SYNC.table, SUBJECT_ITEM_SYNC.columns, localRows);
      }
    }
    done += 1;
    onProgress?.({ table: 'subject_item', done, total });
  }

  await useChildStore.getState().load();
  return { childCount: remoteChildren.length };
}
