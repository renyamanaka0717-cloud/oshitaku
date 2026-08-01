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

// Points are an "info" card, not an "action" card: a quiet white face
// that lets the number do the talking, with just a small coin + sparkle
// accent and a hop animation when the total goes up.
export function PointsBadge({ points, label = 'ポイント', color, onPress }: Props) {
  const { colors } = useTheme();
  const bg = color ?? colors.surface;
  const isNeutral = bg === colors.surface || bg === colors.surfaceAlt || bg === colors.background;
  const styles = useMemo(() => createStyles(colors, isNeutral), [colors, isNeutral]);

  const inner = (
    <BounceOnChange watch={points}>
      <View style={styles.coinWrap}>
        <Icon name="coin" size={30} />
        <View style={styles.sparkle}>
          <Icon name="sparkles" size={11} />
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

function createStyles(colors: ColorPalette, isNeutral: boolean) {
  return StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: radius.lg,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    staticCard: {
      borderWidth: outlineWidth,
      borderColor: colors.black,
      borderBottomWidth: outlineWidth + 5,
      borderRightWidth: outlineWidth + 5,
    },
    inner: {
      alignItems: 'center',
      gap: 3,
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
    value: {
      color: isNeutral ? colors.text : colors.black,
      fontSize: 34,
    },
    label: {
      color: isNeutral ? colors.textMuted : colors.black,
      fontSize: 11,
      opacity: isNeutral ? 1 : 0.7,
    },
  });
}
