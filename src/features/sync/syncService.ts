import { getDb } from '@/db/client';
import { supabase } from '@/lib/supabase';

// V1: one-way backup (local SQLite -> Supabase). Restoring from the cloud
// onto a new device is a separate follow-up; this only guarantees the
// signed-in parent's data is safely mirrored to the cloud.

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

type TableSync = {
  table: string;
  onConflict: string;
  sql: string;
  jsonFields?: string[];
  boolFields?: string[];
};

const CHILD_SCOPED_TABLES: TableSync[] = [
  {
    table: 'subject',
    onConflict: 'id',
    sql: 'SELECT id, childId, name, color, createdAt FROM subject WHERE childId = ?',
  },
  {
    table: 'item',
    onConflict: 'id',
    sql: 'SELECT id, childId, name, icon, createdAt FROM item WHERE childId = ?',
  },
  {
    table: 'subject_item',
    onConflict: 'id',
    sql: `SELECT si.id, si.subjectId, si.itemId FROM subject_item si
          JOIN subject s ON s.id = si.subjectId WHERE s.childId = ?`,
  },
  {
    table: 'timetable_set',
    onConflict: 'id',
    sql: 'SELECT id, childId, name, sortOrder, createdAt FROM timetable_set WHERE childId = ?',
  },
  {
    table: 'timetable_entry',
    onConflict: 'id',
    sql: 'SELECT id, childId, timetableSetId, dayOfWeek, period, subjectId FROM timetable_entry WHERE childId = ?',
  },
  {
    table: 'morning_task',
    onConflict: 'id',
    sql: 'SELECT id, childId, label, icon, sortOrder, daysOfWeek FROM morning_task WHERE childId = ?',
    jsonFields: ['daysOfWeek'],
  },
  {
    table: 'evening_task',
    onConflict: 'id',
    sql: 'SELECT id, childId, label, icon, sortOrder, daysOfWeek FROM evening_task WHERE childId = ?',
    jsonFields: ['daysOfWeek'],
  },
  {
    table: 'day_completion',
    onConflict: 'id',
    sql: `SELECT id, childId, date, morningCompleted, morningCompletedAt, morningOnTime,
          eveningCompleted, eveningCompletedAt, eveningOnTime, noForgottenItems, awardedRules
          FROM day_completion WHERE childId = ?`,
    jsonFields: ['awardedRules'],
    boolFields: ['morningCompleted', 'morningOnTime', 'eveningCompleted', 'eveningOnTime', 'noForgottenItems'],
  },
  {
    table: 'reward',
    onConflict: 'id',
    sql: 'SELECT id, childId, name, icon, description, imageUri, pointCost, isActive, createdAt FROM reward WHERE childId = ?',
    boolFields: ['isActive'],
  },
  {
    table: 'chore',
    onConflict: 'id',
    sql: 'SELECT id, childId, name, icon, pointValue, isActive, createdAt FROM chore WHERE childId = ?',
    boolFields: ['isActive'],
  },
  {
    table: 'point_history',
    onConflict: 'id',
    sql: 'SELECT id, childId, date, type, amount, note, createdAt FROM point_history WHERE childId = ?',
  },
  {
    table: 'stamp',
    onConflict: 'id',
    sql: 'SELECT id, childId, date, kind, stampType, source, createdAt FROM stamp WHERE childId = ?',
  },
  {
    table: 'notification_setting',
    onConflict: 'child_id',
    sql: `SELECT childId, morningEnabled, morningTime, eveningEnabled, eveningTime,
          reminderEnabled, reminderMinutesAfter FROM notification_setting WHERE childId = ?`,
    boolFields: ['morningEnabled', 'eveningEnabled', 'reminderEnabled'],
  },
  {
    table: 'point_rule',
    onConflict: 'child_id',
    sql: `SELECT childId, morningComplete, eveningComplete, onTime, noForgottenItems, perfectDayBonus
          FROM point_rule WHERE childId = ?`,
  },
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
    `SELECT id, name, avatarEmoji, avatarColor, avatarImageUri, schoolArrivalTimes,
     activeTimetableSetId, sortOrder, createdAt FROM child WHERE id = ?`,
    [childId]
  );
  if (!childRow) throw new Error('お子さまの情報が見つかりません');

  const total = CHILD_SCOPED_TABLES.length + 1;
  let done = 0;

  const childRemote = toRemoteRow(childRow, ['schoolArrivalTimes']);
  childRemote.parent_id = parentId;
  const { error: childError } = await supabase.from('child').upsert(childRemote, { onConflict: 'id' });
  if (childError) throw childError;
  done += 1;
  onProgress?.({ table: 'child', done, total });

  for (const spec of CHILD_SCOPED_TABLES) {
    const rows = await db.getAllAsync<Record<string, unknown>>(spec.sql, [childId]);
    if (rows.length > 0) {
      const remoteRows = rows.map((r) => toRemoteRow(r, spec.jsonFields, spec.boolFields));
      const { error } = await supabase.from(spec.table).upsert(remoteRows, { onConflict: spec.onConflict });
      if (error) throw error;
    }
    done += 1;
    onProgress?.({ table: spec.table, done, total });
  }
}
