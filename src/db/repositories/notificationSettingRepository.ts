import { getDb } from '../client';
import { NotificationSetting } from '../models';

type Row = Omit<
  NotificationSetting,
  'morningEnabled' | 'eveningEnabled' | 'reminderEnabled'
> & {
  morningEnabled: number;
  eveningEnabled: number;
  reminderEnabled: number;
};

function toModel(row: Row): NotificationSetting {
  return {
    ...row,
    morningEnabled: !!row.morningEnabled,
    eveningEnabled: !!row.eveningEnabled,
    reminderEnabled: !!row.reminderEnabled,
  };
}

export async function getNotificationSetting(childId: string): Promise<NotificationSetting> {
  const db = await getDb();
  let row = await db.getFirstAsync<Row>(
    'SELECT * FROM notification_setting WHERE childId = ?',
    [childId]
  );
  if (!row) {
    await db.runAsync('INSERT OR IGNORE INTO notification_setting (childId) VALUES (?)', [
      childId,
    ]);
    row = await db.getFirstAsync<Row>(
      'SELECT * FROM notification_setting WHERE childId = ?',
      [childId]
    );
  }
  return toModel(row!);
}

export async function updateNotificationSetting(
  childId: string,
  patch: Partial<
    Pick<
      NotificationSetting,
      'morningEnabled' | 'morningTime' | 'eveningEnabled' | 'eveningTime' | 'reminderEnabled' | 'reminderMinutesAfter'
    >
  >
): Promise<NotificationSetting> {
  const db = await getDb();
  await getNotificationSetting(childId);
  const fields = Object.keys(patch);
  if (fields.length > 0) {
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => {
      const v = (patch as Record<string, unknown>)[f];
      return typeof v === 'boolean' ? (v ? 1 : 0) : v;
    }) as (string | number | null)[];
    await db.runAsync(`UPDATE notification_setting SET ${setClause} WHERE childId = ?`, [
      ...values,
      childId,
    ]);
  }
  return getNotificationSetting(childId);
}
