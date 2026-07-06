import { getDb } from '../client';
import { Stamp, StampKind } from '../models';
import { generateId } from '@/utils/id';
import { NORMAL_STAMP_TYPES, RARE_STAMP_TYPES, pickRandom } from '../stampCatalog';

export { NORMAL_STAMP_TYPES, RARE_STAMP_TYPES, pickRandom } from '../stampCatalog';

export async function addStamp(input: {
  childId: string;
  date: string;
  kind: StampKind;
  source: 'morning' | 'evening' | 'perfect';
  stampType?: string;
}): Promise<Stamp> {
  const db = await getDb();
  const stampType =
    input.stampType ?? (input.kind === 'rare' ? pickRandom(RARE_STAMP_TYPES) : pickRandom(NORMAL_STAMP_TYPES));
  const stamp: Stamp = {
    id: generateId(),
    childId: input.childId,
    date: input.date,
    kind: input.kind,
    stampType,
    source: input.source,
    createdAt: new Date().toISOString(),
  };
  await db.runAsync(
    `INSERT INTO stamp (id, childId, date, kind, stampType, source, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [stamp.id, stamp.childId, stamp.date, stamp.kind, stamp.stampType, stamp.source, stamp.createdAt]
  );
  return stamp;
}

export async function listStamps(childId: string, limit = 200): Promise<Stamp[]> {
  const db = await getDb();
  return db.getAllAsync<Stamp>(
    'SELECT * FROM stamp WHERE childId = ? ORDER BY createdAt DESC LIMIT ?',
    [childId, limit]
  );
}
