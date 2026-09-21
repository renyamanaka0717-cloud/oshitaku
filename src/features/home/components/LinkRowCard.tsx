import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { PressableCard } from '@/components/PressableCard';
import { ColorPalette, spacing, useTheme } from '@/theme';

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tint: string;
  badgeTint?: string;
  onPress: () => void;
};

// A half-width rectangular link card: icon badge + title/subtitle on the
// left, a chevron on the right — used for the demoted prep/chores row and
// the reward/calendar row on the home screen, distinct from the square
// PrepLinkCard tile shape. On a vivid card tint the badge is a translucent
// white circle; on a neutral (white/cream) card, pass badgeTint for a
// colored accent circle instead, since translucent white disappears there.
export function LinkRowCard({ title, subtitle, icon, tint, badgeTint, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    // PressableCard's outer Animated.View (the actual flex child here) only
    // ever gets a `transform` style — layout props like `flex` passed via
    // `style` land on its inner Pressable instead, so a plain `flex: 1`
    // wrapper is needed here for the two cards in a row to size equally.
    <View style={styles.wrap}>
      <PressableCard backgroundColor={tint} onPress={onPress} style={styles.card}>
        <View style={[styles.iconBadge, badgeTint ? { backgroundColor: badgeTint } : null]}>{icon}</View>
        <View style={styles.textCol}>
          <AppText variant="subtitle" color={colors.black} numberOfLines={1}>
            {title}
          </AppText>
          <AppText variant="caption" color={colors.black} style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </AppText>
        </View>
        <AppText style={styles.chevron} color={colors.black}>
          ›
        </AppText>
      </PressableCard>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
    },
    card: {
      padding: spacing.md,
      gap: spacing.xs,
      height: '100%',
    },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.55)',
      borderWidth: 2,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textCol: {
      gap: 1,
    },
    subtitle: {
      opacity: 0.75,
    },
    chevron: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      fontSize: 20,
      fontWeight: '900',
    },
  });
}
