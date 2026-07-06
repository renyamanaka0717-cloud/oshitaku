import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { SectionHeader } from '@/components/SectionHeader';
import { StatBadge } from '@/components/StatBadge';
import { RewardCard } from '@/features/rewards/components/RewardCard';
import { StampGrid } from '@/features/stamps/components/StampGrid';
import { useRewardsStore } from '@/features/rewards/store';
import { usePointsStore } from '@/features/points/store';
import { useStampsStore } from '@/features/stamps/store';
import { colors, spacing } from '@/theme';

export default function RewardsScreen() {
  const allRewards = useRewardsStore((s) => s.rewards);
  const rewards = useMemo(() => allRewards.filter((r) => r.isActive), [allRewards]);
  const exchange = useRewardsStore((s) => s.exchange);
  const totalPoints = usePointsStore((s) => s.total);
  const stamps = useStampsStore((s) => s.stamps);
  const [message, setMessage] = useState<string | null>(null);

  const handleExchange = async (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (!reward) return;
    const ok = await exchange(reward);
    setMessage(ok ? `${reward.name}とこうかんしたよ！🎉` : 'ポイントがたりないよ');
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <Screen>
      <HeaderBar title="ごほうび・スタンプ" onBack={() => router.back()} />

      <StatBadge icon="⭐" value={totalPoints} label="いまのポイント" color={colors.accent} />

      {message ? (
        <AppText variant="subtitle" color={colors.primaryDark} style={styles.message}>
          {message}
        </AppText>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="ごほうびこうかん" icon="🎁" />
        {rewards.length === 0 ? (
          <AppText variant="body" color={colors.textMuted}>
            ごほうびがまだ登録されていません
          </AppText>
        ) : (
          <View style={styles.list}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  message: {
    textAlign: 'center',
  },
});
