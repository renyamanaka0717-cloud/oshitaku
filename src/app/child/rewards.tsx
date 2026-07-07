import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { SectionHeader } from '@/components/SectionHeader';
import { StatBadge } from '@/components/StatBadge';
import { EmptyState } from '@/components/EmptyState';
import { RewardCard } from '@/features/rewards/components/RewardCard';
import { RewardDetailModal } from '@/features/rewards/components/RewardDetailModal';
import { RewardCelebration } from '@/features/rewards/components/RewardCelebration';
import { useRewardsStore } from '@/features/rewards/store';
import { usePointsStore } from '@/features/points/store';
import { Reward } from '@/db/models';
import { colors, spacing } from '@/theme';

export default function RewardsScreen() {
  const allRewards = useRewardsStore((s) => s.rewards);
  const rewards = useMemo(() => allRewards.filter((r) => r.isActive), [allRewards]);
  const exchange = useRewardsStore((s) => s.exchange);
  const totalPoints = usePointsStore((s) => s.total);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [gotReward, setGotReward] = useState<Reward | null>(null);

  const handleExchange = async (reward: Reward) => {
    const ok = await exchange(reward);
    if (ok) setGotReward(reward);
  };

  return (
    <Screen>
      <HeaderBar title="ごほうび" onBack={() => router.back()} />

      <View style={styles.statsRow}>
        <StatBadge icon="⭐" value={totalPoints} label="いまのポイント" color={colors.accent} />
        <StatBadge
          icon="🧾"
          value="りれき"
          label="こうかんりれき"
          color={colors.surfaceAlt}
          onPress={() => router.push('/child/reward-history')}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="ごほうびこうかん" icon="🎁" />
        {rewards.length === 0 ? (
          <EmptyState icon="🎁" message="ごほうびがまだ登録されていません" />
        ) : (
          <View style={styles.grid}>
            {rewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} onPress={() => setSelectedReward(reward)} />
            ))}
          </View>
        )}
      </View>

      <RewardDetailModal
        visible={!!selectedReward}
        reward={selectedReward}
        currentPoints={totalPoints}
        onExchange={() => selectedReward && handleExchange(selectedReward)}
        onClose={() => setSelectedReward(null)}
      />

      <RewardCelebration visible={!!gotReward} reward={gotReward} onClose={() => setGotReward(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
