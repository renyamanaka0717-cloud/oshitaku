import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Redirect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { StatBadge } from '@/components/StatBadge';
import { useChildStore, useActiveChild } from '@/features/child/store';
import { ChildSwitcherModal } from '@/features/child/components/ChildSwitcherModal';
import { GreetingHeader } from '@/features/home/components/GreetingHeader';
import { TodayBonusCard } from '@/features/home/components/TodayBonusCard';
import { TodayStampsRow } from '@/features/home/components/TodayStampsRow';
import { PrepLinkCard } from '@/features/home/components/PrepLinkCard';
import { useItemsStore } from '@/features/items/store';
import { useMorningStore } from '@/features/morning/store';
import { useEveningStore } from '@/features/evening/store';
import { usePointsStore } from '@/features/points/store';
import { useStampsStore } from '@/features/stamps/store';
import { getSuggestedMode } from '@/features/home/timeMode';
import { ColorPalette, spacing, useTheme } from '@/theme';
import { todayKey } from '@/utils/date';

export default function ChildHome() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { children, activeChildId, setActiveChild } = useChildStore();
  const child = useActiveChild();

  const [switcherVisible, setSwitcherVisible] = useState(false);

  const suggestedMode = useMemo(() => getSuggestedMode(), []);

  const items = useItemsStore((s) => s.items);
  const itemsComplete = useItemsStore((s) => s.isComplete());

  const morningTasks = useMorningStore((s) => s.tasks);
  const morningChecked = useMorningStore((s) => s.checked);
  const morningComplete = useMorningStore((s) => s.isComplete());
  const loadMorning = useMorningStore((s) => s.load);

  const eveningTasks = useEveningStore((s) => s.tasks);
  const eveningChecked = useEveningStore((s) => s.checked);
  const eveningComplete = useEveningStore((s) => s.isComplete());
  const loadEvening = useEveningStore((s) => s.load);

  useFocusEffect(
    useCallback(() => {
      if (child) {
        loadMorning(child.id);
        loadEvening(child.id);
      }
    }, [child, loadMorning, loadEvening])
  );

  const totalPoints = usePointsStore((s) => s.total);
  const rule = usePointsStore((s) => s.rule);

  const stamps = useStampsStore((s) => s.stamps);
  const todayStamps = useMemo(() => stamps.filter((s) => s.date === todayKey()), [stamps]);

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

  return (
    <Screen>
      <GreetingHeader child={child} onPressAvatar={() => setSwitcherVisible(true)} />

      <View style={styles.prepRow}>
        <PrepLinkCard
          title="朝のおしたく"
          icon="☀️"
          done={morningTasks.filter((t) => morningChecked[t.id]).length}
          total={morningTasks.length}
          complete={morningComplete}
          tint={colors.yellow}
          active={suggestedMode === 'morning'}
          onPress={() => router.push('/child/morning')}
        />
        <PrepLinkCard
          title="夜のおしたく"
          icon="🌙"
          done={eveningTasks.filter((t) => eveningChecked[t.id]).length}
          total={eveningTasks.length}
          complete={eveningComplete}
          tint={colors.purple}
          active={suggestedMode === 'evening'}
          onPress={() => router.push('/child/evening')}
        />
      </View>

      <View style={styles.statsRow}>
        <StatBadge icon="⭐" value={totalPoints} label="ポイント" color={colors.accent} />
        <StatBadge
          icon="🎁"
          value="ごほうび"
          label="こうかんする"
          color={colors.pink}
          onPress={() => router.push('/child/rewards')}
        />
      </View>

      <TodayBonusCard bonusPoints={bonusPoints} />
      <TodayStampsRow stamps={todayStamps} />

      <View style={styles.linkRow}>
        <Pressable style={styles.linkItem} onPress={() => router.push('/child/rewards')}>
          <AppText style={styles.linkIcon}>🎁</AppText>
          <AppText variant="caption">ごほうび</AppText>
        </Pressable>
        <Pressable style={styles.linkItem} onPress={() => router.push('/child/chores')}>
          <AppText style={styles.linkIcon}>🧹</AppText>
          <AppText variant="caption">おてつだい</AppText>
        </Pressable>
        <Pressable style={styles.linkItem} onPress={() => router.push('/child/stampbook')}>
          <AppText style={styles.linkIcon}>📔</AppText>
          <AppText variant="caption">スタンプ図鑑</AppText>
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
