import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { SubjectPickerModal } from '@/features/timetable/components/SubjectPickerModal';
import { useActiveChild } from '@/features/child/store';
import { useTimetableStore } from '@/features/timetable/store';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { WEEKDAY_LABELS_JA } from '@/utils/date';

const DAYS = [1, 2, 3, 4, 5]; // 月-金
const PERIODS = [1, 2, 3, 4, 5, 6];

export default function TimetableSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const load = useTimetableStore((s) => s.load);
  const subjects = useTimetableStore((s) => s.subjects);
  const timetableEntries = useTimetableStore((s) => s.entries);
  const setSlot = useTimetableStore((s) => s.setSlot);
  const getEntriesForDay = useTimetableStore((s) => s.getEntriesForDay);

  const [selectedDay, setSelectedDay] = useState(1);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const entries = useMemo(
    () => getEntriesForDay(selectedDay),
    [getEntriesForDay, selectedDay, timetableEntries, subjects]
  );

  return (
    <Screen>
      <HeaderBar title="時間割・教科" onBack={() => router.back()} />

      <Button
        label="教科・持ち物を登録する"
        icon="🖍️"
        variant="secondary"
        onPress={() => router.push('/parent/subjects')}
      />

      <View style={styles.section}>
        <SectionHeader title="時間割" icon="📅" />
        <View style={styles.dayTabs}>
          {DAYS.map((day) => (
            <Pressable
              key={day}
              style={[styles.dayTab, selectedDay === day ? styles.dayTabActive : null]}
              onPress={() => setSelectedDay(day)}
            >
              <AppText color={selectedDay === day ? colors.white : colors.text}>
                {WEEKDAY_LABELS_JA[day]}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.periodList}>
          {PERIODS.map((period) => {
            const entry = entries.find((e) => e.period === period);
            return (
              <Pressable
                key={period}
                style={styles.periodRow}
                onPress={() => setPickerSlot(period)}
              >
                <View style={styles.periodBadge}>
                  <AppText variant="subtitle">{period}</AppText>
                </View>
                <View
                  style={[
                    styles.subjectSlot,
                    { backgroundColor: entry?.subject?.color ?? colors.surfaceAlt },
                  ]}
                >
                  <AppText color={entry ? colors.white : colors.textMuted}>
                    {entry?.subject?.name ?? 'タップして選択'}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SubjectPickerModal
        visible={pickerSlot !== null}
        subjects={subjects}
        onSelect={(subjectId) => {
          if (pickerSlot !== null) setSlot(selectedDay, pickerSlot, subjectId);
        }}
        onClose={() => setPickerSlot(null)}
      />
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: {
      gap: spacing.sm,
    },
    dayTabs: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    dayTab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
    },
    dayTabActive: {
      backgroundColor: colors.primary,
    },
    periodList: {
      gap: spacing.sm,
    },
    periodRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    periodBadge: {
      width: 32,
      alignItems: 'center',
    },
    subjectSlot: {
      flex: 1,
      borderRadius: radius.md,
      padding: spacing.md,
    },
  });
}
