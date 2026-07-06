import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from './Card';
import { AppText } from './AppText';
import { ColorPalette, spacing, useTheme } from '@/theme';

type Props = {
  icon: string;
  value: string | number;
  label: string;
  sublabel?: string;
  accentColor?: string;
};

export function StatCard({ icon, value, label, sublabel, accentColor }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Card style={styles.card}>
      <View style={styles.iconWrap}>
        <AppText style={styles.icon}>{icon}</AppText>
      </View>
      <AppText variant="hero" color={accentColor ?? colors.primaryDark} style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
      {sublabel ? (
        <AppText variant="caption" color={colors.textMuted}>
          {sublabel}
        </AppText>
      ) : null}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      minWidth: 140,
    },
    iconWrap: {
      marginBottom: spacing.xs,
    },
    icon: {
      fontSize: 28,
    },
    value: {
      fontSize: 28,
    },
  });
}
