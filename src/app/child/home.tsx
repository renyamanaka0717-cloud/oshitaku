import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { StatBadge } from '@/components/StatBadge';
import { CelebrationModal } from '@/components/CelebrationModal';
import { useChildStore, useActiveChild } from '@/features/child/store';
import { useChildData } from '@/features/child/useChildData';
import { ChildSwitcherModal } from '@/features/child/components/ChildSwitcherModal';
import { GreetingHeader } from '@/features/home/components/GreetingHeader';
import { SchoolCountdownCard } from '@/features/home/components/SchoolCountdownCard';
import { TodayTimetableCard } from '@/features/home/components/TodayTimetableCard';
import { TodayItemsCard } from '@/features/home/components/TodayItemsCard';
import { PrepLinkCard } from '@/features/home/components/PrepLinkCard';
import { useTimetableStore } from '@/features/timetable/store';
import { useItemsStore } from '@/features/items/store';
import { useMorningStore } from '@/features/morning/store';
import { useEveningStore } from '@/features/evening/store';
import { usePointsStore } from '@/features/points/store';
import { useStreakStore } from '@/features/home/streakStore';
import { colors, spacing } from '@/theme';

export default function ChildHome() {
  const { children, activeChildId, setActiveChild } = useChildStore();
  const child = useActiveChild();
  useChildData(child?.id);

  const [switcherVisible, setSwitcherVisible] = useState(false);
  const streak = useStreakStore((s) => s.streak);

  const dayOfWeek = new Date().getDay();
  const timetableEntries = useTimetableStore((s) => s.entries);
  const timetableSubjects = useTimetableStore((s) => s.subjects);
  const getEntriesForDay = useTimetableStore((s) => s.getEntriesForDay);
  const entries = useMemo(
    () => getEntriesForDay(dayOfWeek),
    [getEntriesForDay, dayOfWeek, timetableEntries, timetableSubjects]
  );

  const items = useItemsStore((s) => s.items);
  const itemsChecked = useItemsStore((s) => s.checked);
  const toggleItem = useItemsStore((s) => s.toggle);

  const morningTasks = useMorningStore((s) => s.tasks);
  const morningChecked = useMorningStore((s) => s.checked);
  const morningComplete = useMorningStore((s) => s.isComplete());

  const eveningTasks = useEveningStore((s) => s.tasks);
  const eveningChecked = useEveningStore((s) => s.checked);
  const eveningComplete = useEveningStore((s) => s.isComplete());

  const totalPoints = usePointsStore((s) => s.total);

  const [celebration, setCelebration] = useState<{ points: number; stampKind: 'normal' | 'rare' | null; stampType?: string } | null>(null);

  const progress = useMemo(() => {
    const morningDone = morningTasks.filter((t) => morningChecked[t.id]).length;
    const eveningDone = eveningTasks.filter((t) => eveningChecked[t.id]).length;
    const itemsDone = items.filter((i) => itemsChecked[i.id]).length;
    const total = morningTasks.length + eveningTasks.length + items.length;
    if (total === 0) return 0;
    return (morningDone + eveningDone + itemsDone) / total;
  }, [morningTasks, morningChecked, eveningTasks, eveningChecked, items, itemsChecked]);

  if (!child) {
    if (children.length === 0) return <Redirect href="/onboarding" />;
    return null;
  }

  const handleToggleItem = async (itemId: string) => {
    const result = await toggleItem(child, itemId);
    if (result?.pointsAwarded) {
      setCelebration({ points: result.pointsAwarded, stampKind: null, stampType: undefined });
    }
  };

  return (
    <Screen>
      <GreetingHeader child={child} onPressAvatar={() => setSwitcherVisible(true)} />

      <SchoolCountdownCard schoolArrivalTime={child.schoolArrivalTime} progress={progress} />

      <View style={styles.prepRow}>
        <PrepLinkCard
          title="朝のおしたく"
          icon="☀️"
          done={morningTasks.filter((t) => morningChecked[t.id]).length}
          total={morningTasks.length}
          complete={morningComplete}
          tint={colors.yellow}
          onPress={() => router.push('/child/morning')}
        />
        <PrepLinkCard
          title="夜のおしたく"
          icon="🌙"
          done={eveningTasks.filter((t) => eveningChecked[t.id]).length}
          total={eveningTasks.length}
          complete={eveningComplete}
          tint={colors.purple}
          onPress={() => router.push('/child/evening')}
        />
      </View>

      <TodayTimetableCard entries={entries} />
      <TodayItemsCard items={items} checked={itemsChecked} onToggle={handleToggleItem} />

      <View style={styles.statsRow}>
        <StatBadge icon="⭐" value={totalPoints} label="ポイント" color={colors.accent} />
        <StatBadge icon="🔥" value={`${streak}日`} label="連続達成" color={colors.pink} />
      </View>

      <Pressable onPress={() => router.push('/child/rewards')}>
        <AppText variant="subtitle" color={colors.primaryDark} style={styles.rewardsLink}>
          🎁 ごほうびをみる
        </AppText>
      </Pressable>

      <Pressable onPress={() => router.push('/parent')} style={styles.parentLink}>
        <AppText variant="caption">保護者の方はこちら</AppText>
      </Pressable>

      <ChildSwitcherModal
        visible={switcherVisible}
        children={children}
        activeChildId={activeChildId}
        onSelect={(id) => setActiveChild(id)}
        onClose={() => setSwitcherVisible(false)}
      />

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
  prepRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rewardsLink: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  parentLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
