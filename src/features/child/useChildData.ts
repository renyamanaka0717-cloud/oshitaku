import { useEffect } from 'react';
import { useTimetableStore } from '@/features/timetable/store';
import { useItemsStore } from '@/features/items/store';
import { useMorningStore } from '@/features/morning/store';
import { useEveningStore } from '@/features/evening/store';
import { usePointsStore } from '@/features/points/store';
import { useStampsStore } from '@/features/stamps/store';
import { useRewardsStore } from '@/features/rewards/store';
import { useStreakStore } from '@/features/home/streakStore';
import { useChildStore } from '@/features/child/store';
import { notificationSettingRepository } from '@/db/repositories';
import { syncNotificationSchedule } from '@/features/notifications/service';

export function useChildData(childId: string | null | undefined) {
  const loadTimetable = useTimetableStore((s) => s.load);
  const loadItems = useItemsStore((s) => s.load);
  const loadMorning = useMorningStore((s) => s.load);
  const loadEvening = useEveningStore((s) => s.load);
  const loadPoints = usePointsStore((s) => s.load);
  const loadStamps = useStampsStore((s) => s.load);
  const loadRewards = useRewardsStore((s) => s.load);
  const loadStreak = useStreakStore((s) => s.load);

  useEffect(() => {
    if (!childId) return;
    (async () => {
      await loadTimetable(childId);
      await Promise.all([
        loadItems(childId),
        loadMorning(childId),
        loadEvening(childId),
        loadPoints(childId),
        loadStamps(childId),
        loadRewards(childId),
        loadStreak(childId),
      ]);

      const child = useChildStore.getState().children.find((c) => c.id === childId);
      if (child) {
        const setting = await notificationSettingRepository.getNotificationSetting(childId);
        syncNotificationSchedule(childId, child.name, setting).catch(() => {});
      }
    })();
  }, [childId, loadTimetable, loadItems, loadMorning, loadEvening, loadPoints, loadStamps, loadRewards, loadStreak]);
}
