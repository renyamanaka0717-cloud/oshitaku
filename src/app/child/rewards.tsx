import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { SectionHeader } from '@/components/SectionHeader';
import { PointsBadge } from '@/components/PointsBadge';
import { EmptyState } from '@/components/EmptyState';
import { RewardCard } from '@/features/rewards/components/RewardCard';
import { RewardDetailModal } from '@/features/rewards/components/RewardDetailModal';
import { RewardCelebration } from '@/features/rewards/components/RewardCelebration';
import { RewardRequestSentModal } from '@/features/rewards/components/RewardRequestSentModal';
import { useRewardsStore } from '@/features/rewards/store';
import { useRewardRequestsStore } from '@/features/rewards/requestsStore';
import { usePointsStore } from '@/features/points/store';
import { useActiveChild } from '@/features/child/store';
import { Reward } from '@/db/models';
import { colors, hardShadow, outlineWidth, radius, spacing } from '@/theme';
import { goBack } from '@/utils/navigation';

const POLL_INTERVAL_MS = 8000;

export default function RewardsScreen() {
  const child = useActiveChild();
  const allRewards = useRewardsStore((s) => s.rewards);
  const rewards = useMemo(() => allRewards.filter((r) => r.isActive), [allRewards]);
  const totalPoints = usePointsStore((s) => s.total);

  const requests = useRewardRequestsStore((s) => s.requests);
  const requestReward = useRewardRequestsStore((s) => s.requestReward);
  const pollRemote = useRewardRequestsStore((s) => s.pollRemote);
  const justApproved = useRewardRequestsStore((s) => s.justApproved);
  const clearJustApproved = useRewardRequestsStore((s) => s.clearJustApproved);

  const pendingRewardIds = useMemo(
    () => new Set(requests.filter((r) => r.status === 'pending').map((r) => r.rewardId)),
    [requests]
  );

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [sentRewardName, setSentRewardName] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!child) return;
      pollRemote([child.id]);
      pollTimer.current = setInterval(() => pollRemote([child.id]), POLL_INTERVAL_MS);
      return () => {
        if (pollTimer.current) clearInterval(pollTimer.current);
      };
    }, [child, pollRemote])
  );

  const handleRequest = async (reward: Reward) => {
    await requestReward(reward);
    setSentRewardName(reward.name);
  };

  return (
    <Screen>
      <HeaderBar
        title="ごほうび"
        onBack={goBack}
        right={
          <Pressable style={styles.historyButton} onPress={() => router.push('/child/reward-history')}>
            <AppText variant="caption" color={colors.text}>
              🧾 りれき
            </AppText>
          </Pressable>
        }
      />

      <PointsBadge points={totalPoints} label="いまのポイント" variant="wide" />

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
                pending={pendingRewardIds.has(reward.id)}
                onPress={() => setSelectedReward(reward)}
              />
            ))}
          </View>
        )}
      </View>

      <RewardDetailModal
        visible={!!selectedReward}
        reward={selectedReward}
        currentPoints={totalPoints}
        onRequest={() => selectedReward && handleRequest(selectedReward)}
        onClose={() => setSelectedReward(null)}
      />

      <RewardRequestSentModal
        visible={!!sentRewardName}
        rewardName={sentRewardName}
        onClose={() => setSentRewardName(null)}
      />

      <RewardCelebration
        visible={!!justApproved}
        reward={justApproved ? { icon: justApproved.rewardIcon, name: justApproved.rewardName } : null}
        onClose={clearJustApproved}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  historyButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceAlt,
    borderWidth: outlineWidth - 1,
    borderColor: colors.black,
    borderBottomWidth: outlineWidth + hardShadow.offsetSm,
    borderRightWidth: outlineWidth + hardShadow.offsetSm,
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
