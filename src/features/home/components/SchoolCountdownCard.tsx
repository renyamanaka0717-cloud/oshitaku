import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { ProgressBar } from '@/components/ProgressBar';
import { colors } from '@/theme';
import { minutesUntil, formatMinutes } from '@/utils/date';

type Props = {
  schoolArrivalTime: string;
  progress: number;
};

const DAY_WINDOW_MINUTES = 180;

function colorForMinutes(minutes: number): string {
  if (minutes <= 15) return colors.timeDanger;
  if (minutes <= 45) return colors.timeWarn;
  return colors.timeSafe;
}

export function SchoolCountdownCard({ schoolArrivalTime, progress }: Props) {
  const [remaining, setRemaining] = useState(() => minutesUntil(schoolArrivalTime));

  useEffect(() => {
    const id = setInterval(() => setRemaining(minutesUntil(schoolArrivalTime)), 30000);
    return () => clearInterval(id);
  }, [schoolArrivalTime]);

  const tint = colorForMinutes(remaining);
  const timeProgress = Math.max(0, Math.min(1, 1 - remaining / DAY_WINDOW_MINUTES));

  return (
    <Card style={styles.card}>
      <AppText variant="caption">学校まで</AppText>
      <AppText variant="hero" color={tint} style={styles.countdown}>
        {remaining > 0 ? formatMinutes(remaining) : 'とうこう時間です！'}
      </AppText>
      <ProgressBar progress={timeProgress} color={tint} height={12} />
      <AppText variant="caption" style={styles.progressLabel}>
        今日のじゅんび：{Math.round(progress * 100)}%
      </AppText>
      <ProgressBar progress={progress} color={colors.secondary} height={12} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  countdown: {
    fontSize: 40,
  },
  progressLabel: {
    marginTop: 8,
  },
});
