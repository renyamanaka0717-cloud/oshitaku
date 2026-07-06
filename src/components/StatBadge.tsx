import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
};

export function StatBadge({ icon, value, label, color }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.badge, { backgroundColor: color ?? colors.accent }]}>
      <AppText style={styles.icon}>{icon}</AppText>
      <AppText variant="title" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    badge: {
      flex: 1,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      gap: 2,
    },
    icon: {
      fontSize: 26,
    },
    value: {
      color: colors.black,
    },
    label: {
      color: colors.black,
      opacity: 0.7,
    },
  });
}
