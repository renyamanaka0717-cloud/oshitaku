export type TimeMode = 'morning' | 'evening' | null;

export function getSuggestedMode(now: Date = new Date()): TimeMode {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 17 && hour <= 23) return 'evening';
  return null;
}
