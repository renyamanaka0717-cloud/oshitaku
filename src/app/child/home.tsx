import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Redirect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { NavIconLink } from '@/components/NavIconLink';
import { FadeInUp } from '@/components/FadeInUp';
import { useChildStore, useActiveChild } from '@/features/child/store';
import { ChildSwitcherModal } from '@/features/child/components/ChildSwitcherModal';
import { GreetingHeader } from '@/features/home/components/GreetingHeader';
import { TodayBonusCard, BonusBreakdownItem } from '@/features/home/components/TodayBonusCard';
import { HeroPrepCard } from '@/features/home/components/HeroPrepCard';
import { PointsProgressCard } from '@/features/home/components/PointsProgressCard';
import { LinkRowCard } from '@/features/home/components/LinkRowCard';
import { useItemsStore } from '@/features/items/store';
import { useMorningStore } from '@/features/morning/store';
import { useEveningStore } from '@/features/evening/store';
import { usePointsStore } from '@/features/points/store';
import { useRewardsStore } from '@/features/rewards/store';
import { getSuggestedMode } from '@/features/home/timeMode';
import { Icon } from '@/theme/icons';
import { ColorPalette, spacing, useTheme } from '@/theme';

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
  const rewards = useRewardsStore((s) => s.rewards);

  const nextReward = useMemo(() => {
    const active = rewards.filter((r) => r.isActive);
    if (active.length === 0) return null;
    return [...active].sort((a, b) => a.pointCost - b.pointCost)[0];
  }, [rewards]);

  const bonusPoints = useMemo(() => {
    if (!rule) return 0;
    let total = 0;
    if (!morningComplete) total += rule.morningComplete + rule.onTime;
    if (!eveningComplete) total += rule.eveningComplete;
    if (items.length > 0 && !itemsComplete) total += rule.noForgottenItems;
    return total;
  }, [rule, morningComplete, eveningComplete, items.length, itemsComplete]);

  const bonusBreakdown = useMemo<BonusBreakdownItem[]>(() => {
    if (!rule) return [];
    const breakdown: BonusBreakdownItem[] = [];
    if (!morningComplete) {
      breakdown.push({ label: '朝のおしたくを終わらせる', points: rule.morningComplete });
      breakdown.push({ label: '朝を時間内に終わらせる', points: rule.onTime });
    }
    if (!eveningComplete) {
      breakdown.push({ label: '夜のおしたくを終わらせる', points: rule.eveningComplete });
    }
    if (items.length > 0 && !itemsComplete) {
      breakdown.push({ label: '忘れ物をゼロにする', points: rule.noForgottenItems });
    }
    return breakdown;
  }, [rule, morningComplete, eveningComplete, items.length, itemsComplete]);

  if (!child) {
    if (children.length === 0) return <Redirect href="/onboarding" />;
    return null;
  }

  const heroMode = suggestedMode ?? (!morningComplete ? 'morning' : 'evening');
  const demotedMode = heroMode === 'morning' ? 'evening' : 'morning';

  return (
    <Screen>
      <GreetingHeader child={child} onPressAvatar={() => setSwitcherVisible(true)} />

      <FadeInUp delay={40}>
        <HeroPrepCard
          mode={heroMode}
          tasks={heroMode === 'morning' ? morningTasks : eveningTasks}
          checked={heroMode === 'morning' ? morningChecked : eveningChecked}
          isSuggested={suggestedMode === heroMode}
          onPress={() => router.push(heroMode === 'morning' ? '/child/morning' : '/child/evening')}
        />
      </FadeInUp>

      <FadeInUp delay={100}>
        <View style={styles.demotedRow}>
          {demotedMode === 'morning' ? (
            <LinkRowCard
              title="朝のおしたく"
              subtitle={morningComplete ? 'できた！✨' : 'あさのじゅんびをみる'}
              icon={<Icon name="sun" size={28} />}
              tint={colors.yellow}
              onPress={() => router.push('/child/morning')}
            />
          ) : (
            <LinkRowCard
              title="夜のおしたく"
              subtitle={eveningComplete ? 'できた！✨' : 'よるのじゅんびをみる'}
              icon={<Icon name="moon" size={28} />}
              tint={colors.purple}
              onPress={() => router.push('/child/evening')}
            />
          )}
          <LinkRowCard
            title="おてつだい"
            subtitle="できることをみる"
            icon={<Icon name="broom" size={28} />}
            tint={colors.green}
            onPress={() => router.push('/child/chores')}
          />
        </View>
      </FadeInUp>

      <FadeInUp delay={160}>
        <TodayBonusCard bonusPoints={bonusPoints} breakdown={bonusBreakdown} />
      </FadeInUp>

      <FadeInUp delay={220}>
        <PointsProgressCard
          points={totalPoints}
          nextReward={nextReward}
          onPress={() => router.push('/child/rewards')}
        />
      </FadeInUp>

      <FadeInUp delay={280}>
        <View style={styles.featureRow}>
          <LinkRowCard
            title="ごほうび"
            subtitle="どんなごほうびがあるかな？"
            icon={<Icon name="gift" size={28} />}
            tint={colors.surface}
            badgeTint={colors.pink}
            onPress={() => router.push('/child/rewards')}
          />
          <LinkRowCard
            title="カレンダー"
            subtitle="たのしみなよていをみる"
            icon={<AppText style={styles.calendarIcon}>📅</AppText>}
            tint={colors.surface}
            badgeTint={colors.blue}
            onPress={() => router.push('/child/calendar')}
          />
        </View>
      </FadeInUp>

      <FadeInUp delay={340}>
        <View style={styles.linkRow}>
          <NavIconLink icon="house" label="ホーム" tint={colors.primary} active onPress={() => {}} />
          <NavIconLink icon="chart" label="とうけい" tint={colors.surfaceAlt} onPress={() => router.push('/child/stats')} />
          <NavIconLink icon="gear" label="設定" tint={colors.surfaceAlt} onPress={() => router.push('/parent/dashboard')} />
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
    demotedRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    featureRow: {
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
    calendarIcon: {
      fontSize: 24,
    },
  });
}
