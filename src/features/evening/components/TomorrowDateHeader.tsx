import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { addDays, formatJapaneseDate } from '@/utils/date';

export function TomorrowDateHeader() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tomorrow = useMemo(() => addDays(new Date(), 1), []);

  return (
    <View style={styles.container}>
      <AppText variant="subtitle" color={colors.white}>
        明日の準備をしよう
      </AppText>
      <AppText variant="title" color={colors.white}>
        {formatJapaneseDate(tomorrow)}
      </AppText>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.purple,
      borderRadius: radius.xl,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      gap: spacing.xs,
    },
  });
}
