import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

type Props = {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
};

export function StatBadge({ icon, value, label, color = colors.accent }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
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

const styles = StyleSheet.create({
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
    color: colors.text,
  },
  label: {
    color: colors.text,
    opacity: 0.7,
  },
});
