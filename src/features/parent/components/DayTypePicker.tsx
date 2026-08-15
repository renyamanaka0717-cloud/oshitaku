import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export const WEEKDAY_DAYS = [1, 2, 3, 4, 5];
export const WEEKEND_DAYS = [0, 6];

// A task's daysOfWeek counts as "土日祝" only if every day in it is a
// weekend day — anything else (including the legacy every-day default)
// is treated as "平日" so existing tasks keep running on their current days
// until a parent explicitly reassigns them here.
export function isWeekendOnly(daysOfWeek: number[]): boolean {
  return daysOfWeek.length > 0 && daysOfWeek.every((d) => d === 0 || d === 6);
}

type Props = {
  value: number[];
  onChange: (next: number[]) => void;
};

export function DayTypePicker({ value, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isWeekend = isWeekendOnly(value);

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.chip, !isWeekend ? styles.chipActive : null]}
        onPress={() => onChange(WEEKDAY_DAYS)}
      >
        <AppText variant="caption" color={!isWeekend ? colors.white : colors.textMuted}>
          平日
        </AppText>
      </Pressable>
      <Pressable
        style={[styles.chip, isWeekend ? styles.chipActive : null]}
        onPress={() => onChange(WEEKEND_DAYS)}
      >
        <AppText variant="caption" color={isWeekend ? colors.white : colors.textMuted}>
          土日祝
        </AppText>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
      backgroundColor: colors.surfaceAlt,
    },
    chipActive: {
      backgroundColor: colors.secondaryDark,
    },
  });
}
