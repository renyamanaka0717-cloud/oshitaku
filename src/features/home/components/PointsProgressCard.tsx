import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/AppText';
import { CuteIcon } from '@/components/CuteIcon';
import { PressableCard } from '@/components/PressableCard';
import { BounceOnChange } from '@/components/BounceOnChange';
import { Icon } from '@/theme/icons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  points: number;
  onPress: () => void;
};

const GRADIENT: [string, string] = ['#FFD3C4', '#FFAB91'];

export function PointsProgressCard({ points, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PressableCard backgroundColor="transparent" onPress={onPress} style={styles.card}>
      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.gradient} />

      <View style={styles.leftCol}>
        <BounceOnChange watch={points}>
          <View style={styles.coinWrap}>
            <CuteIcon iconKey="points" size={36} fallback={<Icon name="coin" size={32} />} />
          </View>
        </BounceOnChange>
        <AppText variant="caption" color={colors.text}>
          もっているポイント
        </AppText>
        <AppText variant="hero" color={colors.accentPink}>
          {points}ポイント
        </AppText>
      </View>
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
    leftCol: {
      gap: 2,
    },
    coinWrap: {
      marginBottom: 2,
    },
  });
}
