import { DayCompletion, PointHistory, Stamp } from '@/db/models';

export function groupStampsByDate(stamps: Stamp[]): Record<string, Stamp[]> {
  const map: Record<string, Stamp[]> = {};
  for (const stamp of stamps) {
    (map[stamp.date] ??= []).push(stamp);
  }
  return map;
}

export function groupCompletionsByDate(completions: DayCompletion[]): Record<string, DayCompletion> {
  const map: Record<string, DayCompletion> = {};
  for (const c of completions) {
    map[c.date] = c;
  }
  return map;
}

export function sumEarnedPointsByDate(history: PointHistory[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const h of history) {
    if (h.amount <= 0) continue;
    map[h.date] = (map[h.date] ?? 0) + h.amount;
  }
  return map;
}
