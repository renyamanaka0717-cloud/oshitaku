import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { SectionHeader } from '@/components/SectionHeader';
import { SimpleBarChart } from '@/components/SimpleBarChart';
import { useActiveChild } from '@/features/child/store';
import { useStreakStore } from '@/features/home/streakStore';
import { dayCompletionRepository, pointHistoryRepository, stampRepository } from '@/db/repositories';
import { DayCompletion, PointHistory, Stamp } from '@/db/models';
import {
  forgottenItemDays,
  lastNDaysPoints,
  longestStreak,
  monthlyAchievementRate,
  totalEarnedPoints,
} from '@/features/stats/selectors';
import { spacing, useTheme } from '@/theme';

const HISTORY_LIMIT = 400;

export default function StatsScreen() {
  const { colors } = useTheme();
  const child = useActiveChild();
  const streak = useStreakStore((s) => s.streak);

  const [completions, setCompletions] = useState<DayCompletion[]>([]);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [stamps, setStamps] = useState<Stamp[]>([]);

  useEffect(() => {
    if (!child) return;
    Promise.all([
      dayCompletionRepository.listRecentCompletions(child.id, HISTORY_LIMIT),
      pointHistoryRepository.listPointHistory(child.id, HISTORY_LIMIT),
      stampRepository.listStamps(child.id, HISTORY_LIMIT),
    ]).then(([c, h, s]) => {
      setCompletions(c);
      setHistory(h);
      setStamps(s);
    });
  }, [child]);

  const now = new Date();
  const achievementRate = useMemo(
    () => monthlyAchievementRate(completions, now.getFullYear(), now.getMonth(), now),
    [completions]
  );
  const longest = useMemo(() => longestStreak(completions), [completions]);
  const totalPoints = useMemo(() => totalEarnedPoints(history), [history]);
  const forgottenDays = useMemo(() => forgottenItemDays(completions), [completions]);

  const weekBars = useMemo(() => {
    const points = lastNDaysPoints(history, 7, now);
    return points.map((p) => ({
      label: `${new Date(p.date).getMonth() + 1}/${new Date(p.date).getDate()}`,
      value: p.amount,
    }));
  }, [history]);

  if (!child) return null;

  return (
    <Screen>
      <HeaderBar title="とうけい" onBack={() => router.back()} />

      <View style={styles.grid}>
        <StatCard icon="📈" value={`${Math.round(achievementRate * 100)}%`} label="今月の達成率" />
        <StatCard icon="🔥" value={`${streak}日`} label="連続達成日数" />
        <StatCard icon="🏆" value={`${longest}日`} label="最長記録" accentColor={colors.accentDark} />
        <StatCard icon="⭐" value={totalPoints} label="累計ポイント" />
        <StatCard icon="🏅" value={stamps.length} label="累計スタンプ" />
        <StatCard icon="🎒" value={forgottenDays} label="忘れ物のあった日" accentColor={colors.danger} />
      </View>

      <Card style={styles.chartCard}>
        <SectionHeader title="今週もらったポイント" icon="📊" />
        <SimpleBarChart data={weekBars} color={colors.secondary} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  chartCard: {
    gap: spacing.sm,
  },
});
