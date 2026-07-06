import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { SectionHeader } from '@/components/SectionHeader';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { Item, Subject, TimetableEntry } from '@/db/models';
import { LESSON_PERIOD } from '@/features/timetable/constants';

type Props = {
  entries: Array<TimetableEntry & { subject: Subject | undefined }>;
  items: Item[];
};

export function TomorrowPreview({ entries, items }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Card style={styles.card}>
      <SectionHeader title="明日の時間割" icon="📅" />
      {entries.length === 0 ? (
        <AppText variant="body" color={colors.textMuted}>
          時間割が登録されていません
        </AppText>
      ) : (
        <View style={styles.subjectRow}>
          {entries.map((e) => (
            <View key={e.id} style={[styles.chip, { backgroundColor: e.subject?.color ?? colors.surfaceAlt }]}>
              <AppText variant="caption" color={colors.white}>
                {e.period === LESSON_PERIOD ? '🎨' : `${e.period}.`} {e.subject?.name ?? '？'}
              </AppText>
            </View>
          ))}
        </View>
      )}

      <SectionHeader title="明日の持ち物" icon="🎒" />
      {items.length === 0 ? (
        <AppText variant="body" color={colors.textMuted}>
          明日必要な持ち物はありません
        </AppText>
      ) : (
        <View style={styles.subjectRow}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemChip}>
              <AppText>{item.icon} {item.name}</AppText>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      gap: spacing.sm,
    },
    subjectRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    chip: {
      borderRadius: radius.round,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    itemChip: {
      borderRadius: radius.round,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surfaceAlt,
    },
  });
}
