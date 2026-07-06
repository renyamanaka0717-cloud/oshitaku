import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { formatMinutes, minutesUntil } from '@/utils/date';

type Props = {
  schoolArrivalTime: string;
};

function colorForMinutes(colors: ColorPalette, minutes: number): string {
  if (minutes <= 15) return colors.timeDanger;
  if (minutes <= 45) return colors.timeWarn;
  return colors.timeSafe;
}

export function BigCountdown({ schoolArrivalTime }: Props) {
  const { colors } = useTheme();
  const [remaining, setRemaining] = useState(() => minutesUntil(schoolArrivalTime));

  useEffect(() => {
    const id = setInterval(() => setRemaining(minutesUntil(schoolArrivalTime)), 15000);
    return () => clearInterval(id);
  }, [schoolArrivalTime]);

  const tint = colorForMinutes(colors, remaining);

  return (
    <View style={[styles.container, { backgroundColor: tint }]}>
      <AppText variant="subtitle" color={colors.white}>
        学校まであと
      </AppText>
      <AppText variant="countdown" color={colors.white}>
        {remaining > 0 ? formatMinutes(remaining) : 'とうこう時間！'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
});
