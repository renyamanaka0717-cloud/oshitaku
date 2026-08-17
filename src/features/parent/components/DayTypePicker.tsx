import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export const WEEKDAY_DAYS = [1, 2, 3, 4, 5];
export const WEEKEND_DAYS = [0, 6];

function includesAll(daysOfWeek: number[], target: number[]): boolean {
  return target.every((d) => daysOfWeek.includes(d));
}

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

// 平日 and 土日祝 are independent toggles, not a single either/or choice —
// a parent can turn both on so a task shows up every day, or leave just one
// on to keep it weekday- or weekend-only. At least one must stay on.
export function DayTypePicker({ value, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const weekdayOn = includesAll(value, WEEKDAY_DAYS);
  const weekendOn = includesAll(value, WEEKEND_DAYS);

  const toggleWeekday = () => {
    if (weekdayOn) {
      if (!weekendOn) return;
      onChange(value.filter((d) => !WEEKDAY_DAYS.includes(d)));
    } else {
      onChange([...new Set([...value, ...WEEKDAY_DAYS])]);
    }
  };

  const toggleWeekend = () => {
    if (weekendOn) {
      if (!weekdayOn) return;
      onChange(value.filter((d) => !WEEKEND_DAYS.includes(d)));
    } else {
      onChange([...new Set([...value, ...WEEKEND_DAYS])]);
    }
  };

  return (
    <View style={styles.row}>
      <Pressable style={[styles.chip, weekdayOn ? styles.chipActive : null]} onPress={toggleWeekday}>
        <AppText variant="caption" color={weekdayOn ? colors.white : colors.textMuted}>
          平日
        </AppText>
      </Pressable>
      <Pressable style={[styles.chip, weekendOn ? styles.chipActive : null]} onPress={toggleWeekend}>
        <AppText variant="caption" color={weekendOn ? colors.white : colors.textMuted}>
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
