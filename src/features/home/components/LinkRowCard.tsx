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
  onPress: () => void;
};

// A half-width rectangular link card: icon badge + title/subtitle on the
// left, a chevron on the right — used for the demoted prep/chores row and
// the reward/calendar row on the home screen, distinct from the square
// PrepLinkCard tile shape.
export function LinkRowCard({ title, subtitle, icon, tint, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <PressableCard backgroundColor={tint} onPress={onPress} style={styles.card}>
      <View style={styles.iconBadge}>{icon}</View>
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
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flex: 1,
      padding: spacing.md,
      gap: spacing.xs,
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
