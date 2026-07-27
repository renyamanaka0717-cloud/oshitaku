import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { PressableCard } from './PressableCard';
import { BounceOnChange } from './BounceOnChange';
import { Icon } from '@/theme/icons';
import { ColorPalette, outlineWidth, radius, useTheme } from '@/theme';

type Props = {
  points: number;
  label?: string;
  color?: string;
  onPress?: () => void;
};

// The points display gets extra star treatment vs a plain StatBadge: a
// big coin with a sparkle accent and a big number that hops when the
// total goes up, since points are the thing kids are meant to want.
export function PointsBadge({ points, label = 'ポイント', color, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const bg = color ?? colors.accent;

  const inner = (
    <BounceOnChange watch={points}>
      <View style={styles.coinWrap}>
        <Icon name="coin" size={46} />
        <View style={styles.sparkle}>
          <Icon name="sparkles" size={16} />
        </View>
      </View>
    </BounceOnChange>
  );

  const content = (
    <View style={styles.inner}>
      {inner}
      <AppText variant="hero" style={styles.value} numberOfLines={1}>
        {points}
      </AppText>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </View>
  );

  if (onPress) {
    return (
      <PressableCard backgroundColor={bg} onPress={onPress} style={styles.card}>
        {content}
      </PressableCard>
    );
  }

  return <View style={[styles.card, styles.staticCard, { backgroundColor: bg }]}>{content}</View>;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: radius.lg,
      paddingVertical: 14,
    },
    staticCard: {
      borderWidth: outlineWidth,
      borderColor: colors.black,
      borderBottomWidth: outlineWidth + 5,
      borderRightWidth: outlineWidth + 5,
    },
    inner: {
      alignItems: 'center',
      gap: 2,
    },
    coinWrap: {
      position: 'relative',
      marginBottom: 2,
    },
    sparkle: {
      position: 'absolute',
      top: -8,
      right: -10,
    },
    value: {
      color: colors.black,
      fontSize: 26,
    },
    label: {
      color: colors.black,
      opacity: 0.7,
    },
  });
}
