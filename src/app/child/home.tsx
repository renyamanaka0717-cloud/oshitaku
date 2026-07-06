import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Redirect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { StatBadge } from '@/components/StatBadge';
import { CelebrationModal } from '@/components/CelebrationModal';
import { AllCompleteCelebration } from '@/components/AllCompleteCelebration';
import { useChildStore, useActiveChild } from '@/features/child/store';
import { useChildData } from '@/features/child/useChildData';
import { ChildSwitcherModal } from '@/features/child/components/ChildSwitcherModal';
import { GreetingHeader } from '@/features/home/components/GreetingHeader';
import { SchoolCountdownCard } from '@/features/home/components/SchoolCountdownCard';
import { TodayTimetableCard } from '@/features/home/components/TodayTimetableCard';
import { TodayItemsCard } from '@/features/home/components/TodayItemsCard';
import { TodayBonusCard } from '@/features/home/components/TodayBonusCard';
import { TodayStampsRow } from '@/features/home/components/TodayStampsRow';
import { PrepLinkCard } from '@/features/home/components/PrepLinkCard';
import { useTimetableStore } from '@/features/timetable/store';
import { useItemsStore } from '@/features/items/store';
import { useMorningStore } from '@/features/morning/store';
import { useEveningStore } from '@/features/evening/store';
import { usePointsStore } from '@/features/points/store';
import { useStampsStore } from '@/features/stamps/store';
import { useStreakStore } from '@/features/home/streakStore';
import { isAllCompleteToday } from '@/features/home/allComplete';
import { ColorPalette, spacing, useTheme } from '@/theme';
import { todayKey } from '@/utils/date';

export default function ChildHome() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  const itemsComplete = useItemsStore((s) => s.isComplete());

  const morningTasks = useMorningStore((s) => s.tasks);
  const morningChecked = useMorningStore((s) => s.checked);
  const morningComplete = useMorningStore((s) => s.isComplete());

  const eveningTasks = useEveningStore((s) => s.tasks);
  const eveningChecked = useEveningStore((s) => s.checked);
  const eveningComplete = useEveningStore((s) => s.isComplete());

  const totalPoints = usePointsStore((s) => s.total);
  const rule = usePointsStore((s) => s.rule);

  const stamps = useStampsStore((s) => s.stamps);
  const todayStamps = useMemo(() => stamps.filter((s) => s.date === todayKey()), [stamps]);

  const [celebration, setCelebration] = useState<{ points: number; stampKind: 'normal' | 'rare' | null; stampType?: string } | null>(null);
  const [allComplete, setAllComplete] = useState(false);

  const progress = useMemo(() => {
    const morningDone = morningTasks.filter((t) => morningChecked[t.id]).length;
    const eveningDone = eveningTasks.filter((t) => eveningChecked[t.id]).length;
    const itemsDone = items.filter((i) => itemsChecked[i.id]).length;
    const total = morningTasks.length + eveningTasks.length + items.length;
    if (total === 0) return 0;
    return (morningDone + eveningDone + itemsDone) / total;
  }, [morningTasks, morningChecked, eveningTasks, eveningChecked, items, itemsChecked]);

  const bonusPoints = useMemo(() => {
    if (!rule) return 0;
    let total = 0;
    if (!morningComplete) total += rule.morningComplete + rule.onTime;
    if (!eveningComplete) total += rule.eveningComplete;
    if (items.length > 0 && !itemsComplete) total += rule.noForgottenItems;
    return total;
  }, [rule, morningComplete, eveningComplete, items.length, itemsComplete]);

  if (!child) {
    if (children.length === 0) return <Redirect href="/onboarding" />;
    return null;
  }

  const handleToggleItem = async (itemId: string) => {
    const result = await toggleItem(child, itemId);
    if (result?.pointsAwarded) {
      if (isAllCompleteToday()) {
        setAllComplete(true);
      } else {
        setCelebration({ points: result.pointsAwarded, stampKind: null, stampType: undefined });
      }
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

      <View style={styles.statsRow}>
        <StatBadge icon="⭐" value={totalPoints} label="ポイント" color={colors.accent} />
        <StatBadge icon="🔥" value={`${streak}日`} label="連続達成" color={colors.pink} />
      </View>

      <TodayBonusCard bonusPoints={bonusPoints} />
      <TodayStampsRow stamps={todayStamps} />

      <TodayTimetableCard entries={entries} />
      <TodayItemsCard items={items} checked={itemsChecked} onToggle={handleToggleItem} />

      <View style={styles.linkRow}>
        <Pressable style={styles.linkItem} onPress={() => router.push('/child/rewards')}>
          <AppText style={styles.linkIcon}>🎁</AppText>
          <AppText variant="caption">ごほうび</AppText>
        </Pressable>
        <Pressable style={styles.linkItem} onPress={() => router.push('/child/calendar')}>
          <AppText style={styles.linkIcon}>📅</AppText>
          <AppText variant="caption">カレンダー</AppText>
        </Pressable>
        <Pressable style={styles.linkItem} onPress={() => router.push('/child/stats')}>
          <AppText style={styles.linkIcon}>📊</AppText>
          <AppText variant="caption">とうけい</AppText>
        </Pressable>
      </View>

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

      <AllCompleteCelebration visible={allComplete} onClose={() => setAllComplete(false)} />
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    prepRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    linkRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingVertical: spacing.md,
    },
    linkItem: {
      alignItems: 'center',
      gap: 4,
    },
    linkIcon: {
      fontSize: 28,
    },
    parentLink: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
  });
}
