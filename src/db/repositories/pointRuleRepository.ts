import { getDb } from '../client';
import { PointRule } from '../models';

export async function getPointRule(childId: string): Promise<PointRule> {
  const db = await getDb();
  let row = await db.getFirstAsync<PointRule>(
    'SELECT * FROM point_rule WHERE childId = ?',
    [childId]
  );
  if (!row) {
    await db.runAsync('INSERT OR IGNORE INTO point_rule (childId) VALUES (?)', [childId]);
    row = await db.getFirstAsync<PointRule>('SELECT * FROM point_rule WHERE childId = ?', [
      childId,
    ]);
  }
  return row!;
}

export async function updatePointRule(
  childId: string,
  patch: Partial<Pick<PointRule, 'morningComplete' | 'eveningComplete' | 'onTime' | 'noForgottenItems' | 'perfectDayBonus'>>
): Promise<PointRule> {
  const db = await getDb();
  await getPointRule(childId);
  const fields = Object.keys(patch);
  if (fields.length > 0) {
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => (patch as Record<string, unknown>)[f]) as (string | number | null)[];
    await db.runAsync(`UPDATE point_rule SET ${setClause} WHERE childId = ?`, [
      ...values,
      childId,
    ]);
  }
  return getPointRule(childId);
}
