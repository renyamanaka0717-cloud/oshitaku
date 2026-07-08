import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
  onPress?: () => void;
  valueVariant?: 'title' | 'subtitle';
};

export function StatBadge({ icon, value, label, color, onPress, valueVariant = 'title' }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const Container = onPress ? Pressable : View;
  return (
    <Container style={[styles.badge, { backgroundColor: color ?? colors.accent }]} onPress={onPress}>
      <AppText style={styles.icon}>{icon}</AppText>
      <AppText variant={valueVariant} style={styles.value} numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </Container>
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
