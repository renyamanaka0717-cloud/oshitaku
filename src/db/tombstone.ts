import { getDb } from './client';

// Records that a row was deleted locally so the sync engine can propagate
// the deletion to Supabase (as a soft delete) instead of the row silently
// reappearing there forever or coming back on the next restore.
export async function recordTombstone(tableName: string, recordId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO sync_tombstone (tableName, recordId, deletedAt) VALUES (?, ?, ?)',
    [tableName, recordId, new Date().toISOString()]
  );
}
