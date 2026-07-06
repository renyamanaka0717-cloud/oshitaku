import * as SQLite from 'expo-sqlite';

const DB_NAME = 'oshitaku.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = result?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS child (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        avatarEmoji TEXT NOT NULL,
        avatarColor TEXT NOT NULL,
        schoolArrivalTime TEXT NOT NULL,
        sortOrder INTEGER NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subject (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS item (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS subject_item (
        id TEXT PRIMARY KEY NOT NULL,
        subjectId TEXT NOT NULL,
        itemId TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS timetable_entry (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        dayOfWeek INTEGER NOT NULL,
        period INTEGER NOT NULL,
        subjectId TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS morning_task (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        label TEXT NOT NULL,
        icon TEXT NOT NULL,
        sortOrder INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS evening_task (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        label TEXT NOT NULL,
        icon TEXT NOT NULL,
        sortOrder INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_task_log (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        date TEXT NOT NULL,
        kind TEXT NOT NULL,
        refId TEXT NOT NULL,
        checked INTEGER NOT NULL,
        checkedAt TEXT
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_task_log_unique
        ON daily_task_log (childId, date, kind, refId);

      CREATE TABLE IF NOT EXISTS day_completion (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        date TEXT NOT NULL,
        morningCompleted INTEGER NOT NULL DEFAULT 0,
        morningCompletedAt TEXT,
        morningOnTime INTEGER NOT NULL DEFAULT 0,
        eveningCompleted INTEGER NOT NULL DEFAULT 0,
        eveningCompletedAt TEXT,
        noForgottenItems INTEGER NOT NULL DEFAULT 0,
        awardedRules TEXT NOT NULL DEFAULT '[]'
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_day_completion_unique
        ON day_completion (childId, date);

      CREATE TABLE IF NOT EXISTS reward (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        pointCost INTEGER NOT NULL,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS point_history (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS stamp (
        id TEXT PRIMARY KEY NOT NULL,
        childId TEXT NOT NULL,
        date TEXT NOT NULL,
        kind TEXT NOT NULL,
        stampType TEXT NOT NULL,
        source TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notification_setting (
        childId TEXT PRIMARY KEY NOT NULL,
        morningEnabled INTEGER NOT NULL DEFAULT 1,
        morningTime TEXT NOT NULL DEFAULT '07:00',
        eveningEnabled INTEGER NOT NULL DEFAULT 1,
        eveningTime TEXT NOT NULL DEFAULT '20:00',
        reminderEnabled INTEGER NOT NULL DEFAULT 1,
        reminderMinutesAfter INTEGER NOT NULL DEFAULT 20
      );

      CREATE TABLE IF NOT EXISTS point_rule (
        childId TEXT PRIMARY KEY NOT NULL,
        morningComplete INTEGER NOT NULL DEFAULT 10,
        eveningComplete INTEGER NOT NULL DEFAULT 10,
        onTime INTEGER NOT NULL DEFAULT 5,
        noForgottenItems INTEGER NOT NULL DEFAULT 5
      );

      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
    version = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${version}`);
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await migrate(db);
      return db;
    });
  }
  return dbPromise;
}
