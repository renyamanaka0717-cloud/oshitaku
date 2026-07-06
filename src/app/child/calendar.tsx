import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { MonthGrid } from '@/features/calendar/components/MonthGrid';
import { DayDetailModal } from '@/features/calendar/components/DayDetailModal';
import {
  groupCompletionsByDate,
  groupStampsByDate,
  sumEarnedPointsByDate,
} from '@/features/calendar/selectors';
import { useActiveChild } from '@/features/child/store';
import { dayCompletionRepository, pointHistoryRepository, stampRepository } from '@/db/repositories';
import { DayCompletion, PointHistory, Stamp } from '@/db/models';
import { spacing, useTheme } from '@/theme';

const HISTORY_LIMIT = 400;

export default function StampCalendarScreen() {
  const { colors } = useTheme();
  const child = useActiveChild();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [completions, setCompletions] = useState<DayCompletion[]>([]);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!child) return;
    Promise.all([
      dayCompletionRepository.listRecentCompletions(child.id, HISTORY_LIMIT),
      stampRepository.listStamps(child.id, HISTORY_LIMIT),
      pointHistoryRepository.listPointHistory(child.id, HISTORY_LIMIT),
    ]).then(([c, s, h]) => {
      setCompletions(c);
      setStamps(s);
      setHistory(h);
    });
  }, [child]);

  const stampsByDate = useMemo(() => groupStampsByDate(stamps), [stamps]);
  const completionsByDate = useMemo(() => groupCompletionsByDate(completions), [completions]);
  const pointsByDate = useMemo(() => sumEarnedPointsByDate(history), [history]);

  const goPrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  if (!child) return null;

  return (
    <Screen>
      <HeaderBar title="スタンプカレンダー" onBack={() => router.back()} />

      <Card style={styles.card}>
        <View style={styles.monthNav}>
          <Pressable onPress={goPrevMonth} hitSlop={8}>
            <AppText variant="title">‹</AppText>
          </Pressable>
          <AppText variant="subtitle">
            {year}年 {month + 1}月
          </AppText>
          <Pressable onPress={goNextMonth} hitSlop={8}>
            <AppText variant="title">›</AppText>
          </Pressable>
        </View>

        <MonthGrid
          year={year}
          month={month}
          stampsByDate={stampsByDate}
          completionsByDate={completionsByDate}
          onSelectDate={setSelectedDate}
        />

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.surfaceAlt }]} />
            <AppText variant="caption">達成</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <AppText variant="caption">レアスタンプ</AppText>
          </View>
        </View>
      </Card>

      <DayDetailModal
        visible={selectedDate !== null}
        dateKey={selectedDate}
        completion={selectedDate ? completionsByDate[selectedDate] : undefined}
        stamps={selectedDate ? stampsByDate[selectedDate] ?? [] : []}
        points={selectedDate ? pointsByDate[selectedDate] ?? 0 : 0}
        onClose={() => setSelectedDate(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
});
