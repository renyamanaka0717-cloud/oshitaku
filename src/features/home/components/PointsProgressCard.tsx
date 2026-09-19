import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { PressableCard } from '@/components/PressableCard';
import { ProgressBar } from '@/components/ProgressBar';
import { BounceOnChange } from '@/components/BounceOnChange';
import { Icon } from '@/theme/icons';
import { Reward } from '@/db/models';
import { ColorPalette, spacing, useTheme } from '@/theme';

type Props = {
  points: number;
  nextReward: Reward | null;
  onPress: () => void;
};

export function PointsProgressCard({ points, nextReward, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const canExchange = !!nextReward && points >= nextReward.pointCost;
  const shortfall = nextReward ? Math.max(0, nextReward.pointCost - points) : 0;

  return (
    <PressableCard backgroundColor={colors.cream} onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <BounceOnChange watch={points}>
          <View style={styles.coinWrap}>
            <Icon name="coin" size={34} />
            <View style={styles.sparkle}>
              <Icon name="sparkles" size={13} />
            </View>
          </View>
        </BounceOnChange>
        <View style={styles.textCol}>
          <AppText variant="caption" color={colors.black}>
            いまのポイント
          </AppText>
          <AppText variant="hero" color={colors.black}>
            {points}
          </AppText>
        </View>
      </View>

      {nextReward ? (
        <View style={styles.progressSection}>
          <AppText variant="caption" color={colors.black}>
            {canExchange
              ? `🎉 ${nextReward.name}とこうかんできるよ！`
              : `あと${shortfall}ポイントで${nextReward.name}とこうかんできるよ！`}
          </AppText>
          <ProgressBar progress={points / nextReward.pointCost} color={colors.primary} height={14} />
        </View>
      ) : null}
    </PressableCard>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    coinWrap: {
      position: 'relative',
    },
    sparkle: {
      position: 'absolute',
      top: -6,
      right: -8,
    },
    textCol: {
      gap: 2,
    },
    progressSection: {
      gap: spacing.xs,
    },
  });
}
