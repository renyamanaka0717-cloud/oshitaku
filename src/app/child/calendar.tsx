import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useActiveChild } from '@/features/child/store';
import { useCalendarStore } from '@/features/calendar/store';
import { ColorPalette, spacing, useTheme } from '@/theme';
import { formatJapaneseDate, parseDateKey, todayKey } from '@/utils/date';
import { goBack } from '@/utils/navigation';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const allEvents = useCalendarStore((s) => s.events);
  const load = useCalendarStore((s) => s.load);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const upcomingEvents = useMemo(() => {
    const today = todayKey();
    return allEvents.filter((e) => e.date >= today);
  }, [allEvents]);

  return (
    <Screen>
      <HeaderBar title="たのしみなよてい" onBack={goBack} />

      <View style={styles.section}>
        {upcomingEvents.length === 0 ? (
          <EmptyState icon="📅" message="まだたのしみな予定はありません" />
        ) : (
          upcomingEvents.map((event) => (
            <Card key={event.id} style={styles.row}>
              <AppText style={styles.icon}>{event.icon}</AppText>
              <View style={styles.textCol}>
                <AppText variant="body">{event.title}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {formatJapaneseDate(parseDateKey(event.date))}
                </AppText>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    icon: {
      fontSize: 32,
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
  });
}
