import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing } from '@/theme';
import { Subject, TimetableEntry } from '@/db/models';

type Props = {
  entries: Array<TimetableEntry & { subject: Subject | undefined }>;
};

export function TodayTimetableCard({ entries }: Props) {
  return (
    <Card>
      <SectionHeader title="今日の時間割" icon="📚" />
      {entries.length === 0 ? (
        <AppText variant="body" color={colors.textMuted} style={styles.empty}>
          時間割がまだ登録されていません
        </AppText>
      ) : (
        <View style={styles.list}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.row}>
              <View style={[styles.periodBadge, { backgroundColor: entry.subject?.color ?? colors.surfaceAlt }]}>
                <AppText variant="subtitle" color={colors.white}>
                  {entry.period}
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

const styles = StyleSheet.create({
  empty: {
    marginTop: spacing.sm,
  },
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
