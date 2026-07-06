import { DayCompletion } from '@/db/models';
import { addDays, toDateKey } from './date';

export function computeStreak(completions: DayCompletion[]): number {
  const byDate = new Map(completions.map((c) => [c.date, c]));
  let streak = 0;
  let cursor = new Date();

  while (true) {
    const key = toDateKey(cursor);
    const entry = byDate.get(key);
    const isToday = key === toDateKey(new Date());
    if (!entry || !(entry.morningCompleted && entry.eveningCompleted)) {
      if (isToday) {
        cursor = addDays(cursor, -1);
        continue;
      }
      break;
    }
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
