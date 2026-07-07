import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { ProgressBar } from '@/components/ProgressBar';
import { CircularProgress } from '@/components/CircularProgress';
import { ColorPalette, spacing, useTheme } from '@/theme';
import { minutesUntil, formatMinutes } from '@/utils/date';

type Props = {
  schoolArrivalTime: string;
  progress: number;
};

const DAY_WINDOW_MINUTES = 180;

function colorForMinutes(colors: ColorPalette, minutes: number): string {
  if (minutes <= 15) return colors.timeDanger;
  if (minutes <= 45) return colors.timeWarn;
  return colors.timeSafe;
}

export function SchoolCountdownCard({ schoolArrivalTime, progress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [remaining, setRemaining] = useState(() => minutesUntil(schoolArrivalTime));

  useEffect(() => {
    const id = setInterval(() => setRemaining(minutesUntil(schoolArrivalTime)), 30000);
    return () => clearInterval(id);
  }, [schoolArrivalTime]);

  const tint = colorForMinutes(colors, remaining);
  const timeProgress = Math.max(0, Math.min(1, 1 - remaining / DAY_WINDOW_MINUTES));

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <CircularProgress progress={timeProgress} color={tint} size={80} strokeWidth={8}>
          <AppText style={styles.ringEmoji}>🏫</AppText>
        </CircularProgress>
        <View style={styles.info}>
          <AppText variant="caption">学校まで</AppText>
          <AppText variant="hero" color={tint} style={styles.countdown} numberOfLines={1} adjustsFontSizeToFit>
            {remaining > 0 ? formatMinutes(remaining) : 'とうこう時間！'}
          </AppText>
        </View>
      </View>

      <AppText variant="caption" style={styles.progressLabel}>
        今日のじゅんび：{Math.round(progress * 100)}%
      </AppText>
      <ProgressBar progress={progress} color={colors.secondary} height={12} />
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      gap: 6,
      paddingVertical: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    ringEmoji: {
      fontSize: 24,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    countdown: {
      fontSize: 28,
    },
    progressLabel: {
      marginTop: 4,
    },
  });
}
