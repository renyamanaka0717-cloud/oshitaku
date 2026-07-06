import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { Subject, TimetableEntry } from '@/db/models';
import { LESSON_PERIOD } from '@/features/timetable/constants';

type Props = {
  entries: Array<TimetableEntry & { subject: Subject | undefined }>;
};

export function TodayTimetableCard({ entries }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Card>
      <SectionHeader title="今日の時間割" icon="📚" />
      {entries.length === 0 ? (
        <EmptyState icon="📚" message="時間割がまだ登録されていません" />
      ) : (
        <View style={styles.list}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.row}>
              <View style={[styles.periodBadge, { backgroundColor: entry.subject?.color ?? colors.surfaceAlt }]}>
                <AppText variant="subtitle" color={colors.white}>
                  {entry.period === LESSON_PERIOD ? '🎨' : entry.period}
                </AppText>
              </View>
              <AppText variant="subtitle">{entry.subject?.name ?? '？'}</AppText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    list: {
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    periodBadge: {
      width: 32,
      height: 32,
      borderRadius: radius.round,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
