import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { ChecklistItem } from '@/components/ChecklistItem';
import { CelebrationModal } from '@/components/CelebrationModal';
import { TomorrowPreview } from '@/features/evening/components/TomorrowPreview';
import { useActiveChild } from '@/features/child/store';
import { useEveningStore } from '@/features/evening/store';
import { useTimetableStore } from '@/features/timetable/store';
import { spacing } from '@/theme';

export default function EveningMode() {
  const child = useActiveChild();
  const tasks = useEveningStore((s) => s.tasks);
  const checked = useEveningStore((s) => s.checked);
  const toggle = useEveningStore((s) => s.toggle);

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

  if (!child) return null;

  const handleToggle = async (taskId: string) => {
    const result = await toggle(child, taskId);
    if (result?.gotStamp) {
      setCelebration({ points: result.pointsAwarded, stampKind: result.stampKind, stampType: result.stampType });
    }
  };

  return (
    <Screen>
      <HeaderBar title="夜のおしたく" onBack={() => router.back()} />
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
