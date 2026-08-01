import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { PressableCard } from '@/components/PressableCard';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  title: React.ReactNode;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
  tint: string;
  topBadge?: React.ReactNode;
  cornerBadge?: React.ReactNode;
  onPress: () => void;
};

// The shared square tile shape used for all four top-of-home cards
// (morning/evening + points/chores) so they read as one family — only
// the fill color and content change.
export function PrepLinkCard({ title, subtitle, icon, tint, topBadge, cornerBadge, onPress }: Props) {
  const { colors } = useTheme();
  const isNeutral = tint === colors.surface || tint === colors.surfaceAlt || tint === colors.background;
  const styles = useMemo(() => createStyles(colors, isNeutral), [colors, isNeutral]);
  const titleColor = isNeutral ? colors.text : colors.black;
  const subtitleColor = isNeutral ? colors.textMuted : colors.black;

  return (
    <View style={styles.wrap}>
      {topBadge ? (
        <View style={styles.topBadgeWrap}>
          <View style={styles.topBadgeChip}>{topBadge}</View>
        </View>
      ) : null}
      <PressableCard backgroundColor={tint} onPress={onPress} style={styles.card}>
        <View style={styles.iconBadge}>{icon}</View>
        <View style={styles.textCol}>
          <AppText variant="subtitle" color={titleColor}>
            {title}
          </AppText>
          <AppText variant="caption" color={subtitleColor}>
            {subtitle}
          </AppText>
        </View>
        {cornerBadge ? <View style={styles.cornerBadgeWrap}>{cornerBadge}</View> : null}
      </PressableCard>
    </View>
  );
}

function createStyles(colors: ColorPalette, isNeutral: boolean) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
    },
    card: {
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.sm,
      aspectRatio: 1,
      justifyContent: 'center',
    },
    topBadgeWrap: {
      position: 'absolute',
      top: -14,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 2,
    },
    topBadgeChip: {
      backgroundColor: colors.primaryDark,
      borderRadius: radius.round,
      borderWidth: 2,
      borderColor: colors.black,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    iconBadge: {
      width: 64,
      height: 64,
      borderRadius: 999,
      backgroundColor: isNeutral ? colors.surfaceAlt : 'rgba(255,255,255,0.55)',
      borderWidth: 2,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textCol: {
      alignItems: 'center',
    },
    cornerBadgeWrap: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
    },
  });
}
