import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Reward } from '@/db/models';
import { colors, spacing } from '@/theme';

type Props = {
  reward: Reward;
  currentPoints: number;
  onExchange: () => void;
};

export function RewardCard({ reward, currentPoints, onExchange }: Props) {
  const canAfford = currentPoints >= reward.pointCost;
  return (
    <Card style={styles.card}>
      <AppText style={styles.icon}>{reward.icon}</AppText>
      <View style={styles.info}>
        <AppText variant="subtitle">{reward.name}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {reward.pointCost} ポイント
        </AppText>
      </View>
      <Button
        label="こうかん"
        onPress={onExchange}
        disabled={!canAfford}
        variant={canAfford ? 'secondary' : 'ghost'}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    fontSize: 36,
  },
  info: {
    flex: 1,
  },
});
