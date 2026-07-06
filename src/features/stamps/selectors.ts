import { Stamp } from '@/db/models';

export function countStampsByType(stamps: Stamp[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const stamp of stamps) {
    counts[stamp.stampType] = (counts[stamp.stampType] ?? 0) + 1;
  }
  return counts;
}
