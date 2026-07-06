import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { ChecklistItem } from '@/components/ChecklistItem';
import { CelebrationModal } from '@/components/CelebrationModal';
import { AllCompleteCelebration } from '@/components/AllCompleteCelebration';
import { ModeSwitch } from '@/components/ModeSwitch';
import { TomorrowDateHeader } from '@/features/evening/components/TomorrowDateHeader';
import { TomorrowPreview } from '@/features/evening/components/TomorrowPreview';
import { EveningStatusRow } from '@/features/evening/components/EveningStatusRow';
import { useActiveChild } from '@/features/child/store';
import { useEveningStore } from '@/features/evening/store';
import { useTimetableStore } from '@/features/timetable/store';
import { usePointsStore } from '@/features/points/store';
import { isAllCompleteToday } from '@/features/home/allComplete';
import { dayCompletionRepository } from '@/db/repositories';
import { DayCompletion } from '@/db/models';
import { spacing } from '@/theme';
import { todayKey } from '@/utils/date';

export default function EveningMode() {
  const child = useActiveChild();
  const tasks = useEveningStore((s) => s.tasks);
  const checked = useEveningStore((s) => s.checked);
  const toggle = useEveningStore((s) => s.toggle);
  const load = useEveningStore((s) => s.load);
  const rule = usePointsStore((s) => s.rule);

  const tomorrowDow = (new Date().getDay() + 1) % 7;
  const timetableEntries = useTimetableStore((s) => s.entries);
  const timetableSubjects = useTimetableStore((s) => s.subjects);
  const timetableItems = useTimetableStore((s) => s.items);
  const subjectItemMap = useTimetableStore((s) => s.subjectItemMap);
  const getEntriesForDay = useTimetableStore((s) => s.getEntriesForDay);
  const getItemsForDay = useTimetableStore((s) => s.getItemsForDay);
  const entries = useMemo(
    () => getEntriesForDay(tomorrowDow),
    [getEntriesForDay, tomorrowDow, timetableEntries, timetableSubjects]
  );
  const items = useMemo(
    () => getItemsForDay(tomorrowDow),
    [getItemsForDay, tomorrowDow, timetableEntries, subjectItemMap, timetableItems]
  );

  const [celebration, setCelebration] = useState<{ points: number; stampKind: 'normal' | 'rare' | null; stampType?: string } | null>(null);
  const [allComplete, setAllComplete] = useState(false);
  const [perfectDay, setPerfectDay] = useState<{ bonusPoints: number; specialStampType: string } | null>(null);
  const [dayCompletion, setDayCompletion] = useState<DayCompletion | null>(null);

  const refreshDayCompletion = useCallback(async (childId: string) => {
    const completion = await dayCompletionRepository.getDayCompletion(childId, todayKey());
    setDayCompletion(completion);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (child) {
        load(child.id);
        refreshDayCompletion(child.id);
      }
    }, [child, load, refreshDayCompletion])
  );

  if (!child) return null;

  const handleToggle = async (taskId: string) => {
    const result = await toggle(child, taskId);
    await refreshDayCompletion(child.id);
    if (result?.perfectDay) {
      setPerfectDay(result.perfectDay);
      setAllComplete(true);
    } else if (result?.gotStamp) {
      if (isAllCompleteToday()) {
        setAllComplete(true);
      } else {
        setCelebration({ points: result.pointsAwarded, stampKind: result.stampKind, stampType: result.stampType });
      }
    }
  };

  const eveningPoints =
    dayCompletion?.eveningCompleted && rule
      ? rule.eveningComplete + (dayCompletion.eveningOnTime ? rule.onTime : 0)
      : 0;
  const prepComplete = tasks.length > 0 && tasks.every((t) => checked[t.id]);

  return (
    <Screen>
      <HeaderBar title="夜のおしたく" onBack={() => router.back()} right={<ModeSwitch active="evening" />} />
      <TomorrowDateHeader />
      <EveningStatusRow eveningPoints={eveningPoints} prepComplete={prepComplete} />
      <TomorrowPreview entries={entries} items={items} />

      <View style={styles.list}>
        {tasks.map((task) => (
          <ChecklistItem
            key={task.id}
            label={task.label}
            icon={task.icon}
            checked={!!checked[task.id]}
            onToggle={() => handleToggle(task.id)}
          />
        ))}
      </View>

      <CelebrationModal
        visible={!!celebration}
        points={celebration?.points ?? 0}
        stampKind={celebration?.stampKind ?? null}
        stampType={celebration?.stampType}
        onClose={() => setCelebration(null)}
      />

      <AllCompleteCelebration
        visible={allComplete}
        perfectDay={perfectDay}
        onClose={() => {
          setAllComplete(false);
          setPerfectDay(null);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
