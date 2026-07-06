import { DayCompletion, PointHistory } from '@/db/models';
import { toDateKey } from '@/utils/date';

export function monthlyAchievementRate(
  completions: DayCompletion[],
  year: number,
  month: number,
  today: Date = new Date()
): number {
  const byDate = new Map(completions.map((c) => [c.date, c]));
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const elapsedDays = isCurrentMonth
    ? today.getDate()
    : new Date(year, month + 1, 0).getDate();

  if (elapsedDays === 0) return 0;

  let achieved = 0;
  for (let day = 1; day <= elapsedDays; day++) {
    const key = toDateKey(new Date(year, month, day));
    const entry = byDate.get(key);
    if (entry?.morningCompleted && entry?.eveningCompleted) achieved += 1;
  }
  return achieved / elapsedDays;
}

export function longestStreak(completions: DayCompletion[]): number {
  const sorted = [...completions]
    .filter((c) => c.morningCompleted && c.eveningCompleted)
    .map((c) => c.date)
    .sort();

  let longest = 0;
  let current = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sorted) {
    const date = new Date(dateStr);
    if (prevDate) {
      const diffDays = Math.round((date.getTime() - prevDate.getTime()) / 86400000);
      current = diffDays === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prevDate = date;
  }
  return longest;
}

export function totalEarnedPoints(history: PointHistory[]): number {
  return history.reduce((sum, h) => (h.amount > 0 ? sum + h.amount : sum), 0);
}

export function forgottenItemDays(completions: DayCompletion[]): number {
  return completions.filter((c) => (c.morningCompleted || c.eveningCompleted) && !c.noForgottenItems).length;
}

export function lastNDaysPoints(history: PointHistory[], days: number, today: Date = new Date()): Array<{ date: string; amount: number }> {
  const totals: Record<string, number> = {};
  for (const h of history) {
    if (h.amount <= 0) continue;
    totals[h.date] = (totals[h.date] ?? 0) + h.amount;
  }
  const result: Array<{ date: string; amount: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    result.push({ date: key, amount: totals[key] ?? 0 });
  }
  return result;
}
