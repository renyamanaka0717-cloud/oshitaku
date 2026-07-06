import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { SectionHeader } from '@/components/SectionHeader';
import { StatBadge } from '@/components/StatBadge';
import { EmptyState } from '@/components/EmptyState';
import { RewardCard } from '@/features/rewards/components/RewardCard';
import { RewardCelebration } from '@/features/rewards/components/RewardCelebration';
import { StampGrid } from '@/features/stamps/components/StampGrid';
import { useRewardsStore } from '@/features/rewards/store';
import { usePointsStore } from '@/features/points/store';
import { useStampsStore } from '@/features/stamps/store';
import { Reward } from '@/db/models';
import { colors, spacing } from '@/theme';

export default function RewardsScreen() {
  const allRewards = useRewardsStore((s) => s.rewards);
  const rewards = useMemo(() => allRewards.filter((r) => r.isActive), [allRewards]);
  const exchange = useRewardsStore((s) => s.exchange);
  const totalPoints = usePointsStore((s) => s.total);
  const stamps = useStampsStore((s) => s.stamps);
  const [gotReward, setGotReward] = useState<Reward | null>(null);

  const handleExchange = async (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;
    const ok = await exchange(reward);
    if (ok) setGotReward(reward);
  };

  return (
    <Screen>
      <HeaderBar title="ごほうび・スタンプ" onBack={() => router.back()} />

      <StatBadge icon="⭐" value={totalPoints} label="いまのポイント" color={colors.accent} />

      <View style={styles.section}>
        <SectionHeader title="ごほうびこうかん" icon="🎁" />
        {rewards.length === 0 ? (
          <EmptyState icon="🎁" message="ごほうびがまだ登録されていません" />
        ) : (
          <View style={styles.grid}>
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                currentPoints={totalPoints}
                onExchange={() => handleExchange(reward.id)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="スタンプ帳" icon="📔" />
        <StampGrid stamps={stamps} />
      </View>

      <RewardCelebration visible={!!gotReward} reward={gotReward} onClose={() => setGotReward(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
