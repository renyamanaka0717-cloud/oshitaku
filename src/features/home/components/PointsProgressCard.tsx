import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/AppText';
import { CuteIcon } from '@/components/CuteIcon';
import { PressableCard } from '@/components/PressableCard';
import { ProgressBar } from '@/components/ProgressBar';
import { BounceOnChange } from '@/components/BounceOnChange';
import { Icon } from '@/theme/icons';
import { Reward } from '@/db/models';
import { ColorPalette, radius, smallShadow, spacing, useTheme } from '@/theme';

type Props = {
  points: number;
  nextReward: Reward | null;
  onPress: () => void;
};

const GRADIENT: [string, string] = ['#FFD3C4', '#FFAB91'];

export function PointsProgressCard({ points, nextReward, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const canExchange = !!nextReward && points >= nextReward.pointCost;
  const shortfall = nextReward ? Math.max(0, nextReward.pointCost - points) : 0;

  return (
    <PressableCard backgroundColor="transparent" onPress={onPress} style={styles.card}>
      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.gradient} />

      <View style={styles.row}>
        <View style={styles.leftCol}>
          <BounceOnChange watch={points}>
            <View style={styles.coinWrap}>
              <CuteIcon iconKey="points" size={36} fallback={<Icon name="coin" size={32} />} />
              <View style={styles.sparkle}>
                <Icon name="sparkles" size={13} />
              </View>
            </View>
          </BounceOnChange>
          <AppText variant="caption" color={colors.text}>
            もっているポイント
          </AppText>
          <AppText variant="hero" color={colors.accentPink}>
            {points}ポイント
          </AppText>
        </View>

        {nextReward ? (
          <View style={styles.bubble}>
            <AppText variant="caption" color={colors.text}>
              {canExchange
                ? `🎉 ${nextReward.name}と\nこうかんできるよ！`
                : `あと${shortfall}ポイントで\n${nextReward.name}と\nこうかんできるよ！`}
            </AppText>
          </View>
        ) : null}
      </View>

      {nextReward ? (
        <View style={styles.progressSection}>
          <View style={styles.progressBarWrap}>
            <ProgressBar progress={points / nextReward.pointCost} color={colors.accentPink} height={14} />
          </View>
          <AppText variant="caption" color={colors.text}>
            {points}/{nextReward.pointCost}
          </AppText>
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
      overflow: 'hidden',
      borderRadius: radius.xl,
    },
    gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    leftCol: {
      gap: 2,
    },
    coinWrap: {
      position: 'relative',
      marginBottom: 2,
    },
    sparkle: {
      position: 'absolute',
      top: -6,
      right: -8,
    },
    bubble: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.sm,
      ...smallShadow,
    },
    progressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    progressBarWrap: {
      flex: 1,
    },
  });
}
