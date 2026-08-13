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
  variant?: 'square' | 'wide';
};

// Points are an "info" card, not an "action" card: a quiet white face
// that lets the number do the talking, with just a small coin + sparkle
// accent and a hop animation when the total goes up.
//
// "square" (default) is a flex:1 aspect-ratio tile meant to sit next to
// another square badge in a 2-up row (home/rewards/evening screens).
// "wide" is a compact horizontal card for screens where PointsBadge is
// the only tile on the row, so it isn't forced to stretch into a huge
// square at full screen width (e.g. the chores screen).
export function PointsBadge({ points, label = 'ポイント', color, onPress, variant = 'square' }: Props) {
  const { colors } = useTheme();
  const bg = color ?? colors.surface;
  const isNeutral = bg === colors.surface || bg === colors.surfaceAlt || bg === colors.background;
  const styles = useMemo(() => createStyles(colors, isNeutral), [colors, isNeutral]);
  const wide = variant === 'wide';

  const coin = (
    <BounceOnChange watch={points}>
      <View style={styles.coinWrap}>
        <Icon name="coin" size={wide ? 26 : 30} />
        <View style={styles.sparkle}>
          <Icon name="sparkles" size={11} />
        </View>
      </View>
    </BounceOnChange>
  );

  const content = wide ? (
    <View style={styles.innerWide}>
      {coin}
      <View style={styles.textColWide}>
        <AppText variant="hero" style={styles.value} numberOfLines={1}>
          {points}
        </AppText>
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      </View>
    </View>
  ) : (
    <View style={styles.inner}>
      {coin}
      <AppText variant="hero" style={styles.value} numberOfLines={1}>
        {points}
      </AppText>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </View>
  );

  const cardStyle = wide ? styles.cardWide : styles.card;

  if (onPress) {
    return (
      <PressableCard backgroundColor={bg} onPress={onPress} style={cardStyle}>
        {content}
      </PressableCard>
    );
  }

  return <View style={[cardStyle, styles.staticCard, { backgroundColor: bg }]}>{content}</View>;
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
    cardWide: {
      borderRadius: radius.lg,
      paddingVertical: 14,
      paddingHorizontal: 20,
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
    innerWide: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    textColWide: {
      alignItems: 'flex-start',
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
