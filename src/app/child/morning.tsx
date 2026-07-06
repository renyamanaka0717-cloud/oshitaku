import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { ChecklistItem } from '@/components/ChecklistItem';
import { CelebrationModal } from '@/components/CelebrationModal';
import { AllCompleteCelebration } from '@/components/AllCompleteCelebration';
import { BigCountdown } from '@/features/morning/components/BigCountdown';
import { useActiveChild } from '@/features/child/store';
import { useMorningStore } from '@/features/morning/store';
import { isAllCompleteToday } from '@/features/home/allComplete';
import { spacing } from '@/theme';

export default function MorningMode() {
  const child = useActiveChild();
  const tasks = useMorningStore((s) => s.tasks);
  const checked = useMorningStore((s) => s.checked);
  const toggle = useMorningStore((s) => s.toggle);
  const load = useMorningStore((s) => s.load);

  const [celebration, setCelebration] = useState<{ points: number; stampKind: 'normal' | 'rare' | null; stampType?: string } | null>(null);
  const [allComplete, setAllComplete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (child) load(child.id);
    }, [child, load])
  );

  if (!child) return null;

  const handleToggle = async (taskId: string) => {
    const result = await toggle(child, taskId);
    if (result?.gotStamp) {
      if (isAllCompleteToday()) {
        setAllComplete(true);
      } else {
        setCelebration({ points: result.pointsAwarded, stampKind: result.stampKind, stampType: result.stampType });
      }
    }
  };

  return (
    <Screen>
      <HeaderBar title="朝のおしたく" onBack={() => router.back()} />
      <BigCountdown schoolArrivalTime={child.schoolArrivalTime} />
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

      <AllCompleteCelebration visible={allComplete} onClose={() => setAllComplete(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
});
