import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Redirect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { StatBadge } from '@/components/StatBadge';
import { PointsBadge } from '@/components/PointsBadge';
import { NavIconLink } from '@/components/NavIconLink';
import { FadeInUp } from '@/components/FadeInUp';
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
import { Icon } from '@/theme/icons';
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

      <FadeInUp delay={40}>
        <View style={styles.prepRow}>
          <PrepLinkCard
            title="朝のおしたく"
            icon={<Icon name="sun" size={52} />}
            done={morningTasks.filter((t) => morningChecked[t.id]).length}
            total={morningTasks.length}
            complete={morningComplete}
            tint={colors.yellow}
            active={suggestedMode === 'morning'}
            onPress={() => router.push('/child/morning')}
          />
          <PrepLinkCard
            title="夜のおしたく"
            icon={<Icon name="moon" size={52} />}
            done={eveningTasks.filter((t) => eveningChecked[t.id]).length}
            total={eveningTasks.length}
            complete={eveningComplete}
            tint={colors.purple}
            active={suggestedMode === 'evening'}
            onPress={() => router.push('/child/evening')}
          />
        </View>
      </FadeInUp>

      <FadeInUp delay={100}>
        <View style={styles.statsRow}>
          <PointsBadge points={totalPoints} label="ポイント" />
          <StatBadge
            icon={<Icon name="broom" size={26} />}
            value="おてつだい"
            label="やってみる"
            color={colors.surface}
            onPress={() => router.push('/child/chores')}
            valueVariant="subtitle"
          />
        </View>
      </FadeInUp>

      <FadeInUp delay={160}>
        <TodayBonusCard bonusPoints={bonusPoints} />
      </FadeInUp>

      <FadeInUp delay={220}>
        <TodayStampsRow stamps={todayStamps} allStamps={stamps} />
      </FadeInUp>

      <FadeInUp delay={280}>
        <View style={styles.linkRow}>
          <NavIconLink icon="gift" label="ごほうび" tint={colors.pink} onPress={() => router.push('/child/rewards')} />
          <NavIconLink icon="broom" label="おてつだい" tint={colors.blue} onPress={() => router.push('/child/chores')} />
          <NavIconLink icon="notebook" label="スタンプ図鑑" tint={colors.yellow} onPress={() => router.push('/child/stampbook')} />
          <NavIconLink icon="chart" label="とうけい" tint={colors.secondary} onPress={() => router.push('/child/stats')} />
        </View>
      </FadeInUp>

      <View style={styles.parentLink}>
        <AppText
          variant="caption"
          color={colors.textMuted}
          onPress={() => router.push('/parent/dashboard')}
        >
          保護者の方はこちら
        </AppText>
      </View>

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
      paddingVertical: spacing.sm,
    },
    parentLink: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
  });
}
