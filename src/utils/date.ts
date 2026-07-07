export const WEEKDAY_LABELS_JA = ['日', '月', '火', '水', '木', '金', '土'];

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function tomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toDateKey(d);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatJapaneseDate(date: Date): string {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = WEEKDAY_LABELS_JA[date.getDay()];
  return `${m}月${d}日（${w}）`;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesUntil(targetTime: string, from: Date = new Date()): number {
  const target = new Date(from);
  const [h, m] = targetTime.split(':').map(Number);
  target.setHours(h, m, 0, 0);
  return Math.round((target.getTime() - from.getTime()) / 60000);
}

export function formatMinutes(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? '-' : '';
  const abs = Math.abs(totalMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  if (h > 0) return `${sign}${h}時間${m}分`;
  return `${sign}${m}分`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function arrivalTimeForDay(times: Record<number, string>, dayOfWeek: number): string {
  return times[dayOfWeek] ?? '08:20';
}

export function todayArrivalTime(times: Record<number, string>): string {
  return arrivalTimeForDay(times, new Date().getDay());
}
