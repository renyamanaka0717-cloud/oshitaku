import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { DayCompletion, Stamp } from '@/db/models';
import { STAMP_EMOJI } from '@/features/stamps/store';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { WEEKDAY_LABELS_JA, daysInMonth, firstWeekdayOfMonth, toDateKey, todayKey } from '@/utils/date';

type Props = {
  year: number;
  month: number; // 0-indexed
  stampsByDate: Record<string, Stamp[]>;
  completionsByDate: Record<string, DayCompletion>;
  onSelectDate: (dateKey: string) => void;
};

export function MonthGrid({ year, month, stampsByDate, completionsByDate, onSelectDate }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const today = todayKey();

  const cells = useMemo(() => {
    const total = daysInMonth(year, month);
    const offset = firstWeekdayOfMonth(year, month);
    const list: Array<{ day: number; dateKey: string } | null> = [];
    for (let i = 0; i < offset; i++) list.push(null);
    for (let day = 1; day <= total; day++) {
      list.push({ day, dateKey: toDateKey(new Date(year, month, day)) });
    }
    return list;
  }, [year, month]);

  return (
    <View>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS_JA.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <AppText variant="caption">{label}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell, i) => {
          if (!cell) return <View key={`empty-${i}`} style={styles.cell} />;
          const stamps = stampsByDate[cell.dateKey] ?? [];
          const completion = completionsByDate[cell.dateKey];
          const isPerfectDay = !!completion?.morningCompleted && !!completion?.eveningCompleted;
          const hasRare = stamps.some((s) => s.kind === 'rare');
          const bestStamp =
            stamps.find((s) => s.kind === 'special') ?? stamps.find((s) => s.kind === 'rare') ?? stamps[0];
          const isToday = cell.dateKey === today;

          return (
            <Pressable
              key={cell.dateKey}
              style={[
                styles.cell,
                styles.dayCell,
                isToday ? styles.today : null,
                completion ? (hasRare ? styles.rareDay : styles.completedDay) : null,
                isPerfectDay ? styles.perfectDay : null,
              ]}
              onPress={() => onSelectDate(cell.dateKey)}
            >
              <AppText variant="caption" style={isToday ? styles.todayLabel : undefined}>
                {cell.day}
              </AppText>
              {bestStamp ? (
                <AppText style={styles.stampEmoji}>{STAMP_EMOJI[bestStamp.stampType] ?? '⭐'}</AppText>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    weekdayRow: {
      flexDirection: 'row',
    },
    weekdayCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      padding: 2,
    },
    dayCell: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      gap: 2,
    },
    today: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    todayLabel: {
      color: colors.primaryDark,
      fontWeight: '800',
    },
    completedDay: {
      backgroundColor: colors.surfaceAlt,
    },
    rareDay: {
      backgroundColor: colors.accent,
    },
    perfectDay: {
      backgroundColor: colors.purple,
      borderWidth: 2,
      borderColor: colors.accentDark,
    },
    stampEmoji: {
      fontSize: 16,
    },
  });
}
