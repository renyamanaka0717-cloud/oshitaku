import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { SubjectPickerModal } from '@/features/timetable/components/SubjectPickerModal';
import { TimetableSetModal } from '@/features/timetable/components/TimetableSetModal';
import { useActiveChild } from '@/features/child/store';
import { useTimetableStore } from '@/features/timetable/store';
import { LESSON_PERIOD } from '@/features/timetable/constants';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { WEEKDAY_LABELS_JA } from '@/utils/date';

const DAYS = [1, 2, 3, 4, 5]; // 月-金
const PERIODS = [1, 2, 3, 4, 5, 6];

export default function TimetableSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const load = useTimetableStore((s) => s.load);
  const sets = useTimetableStore((s) => s.sets);
  const activeSetId = useTimetableStore((s) => s.activeSetId);
  const subjects = useTimetableStore((s) => s.subjects);
  const timetableEntries = useTimetableStore((s) => s.entries);
  const setSlot = useTimetableStore((s) => s.setSlot);
  const createSet = useTimetableStore((s) => s.createSet);
  const renameSet = useTimetableStore((s) => s.renameSet);
  const deleteSet = useTimetableStore((s) => s.deleteSet);
  const setActiveSet = useTimetableStore((s) => s.setActiveSet);
  const getEntriesForDay = useTimetableStore((s) => s.getEntriesForDay);

  const [selectedDay, setSelectedDay] = useState(1);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const entries = useMemo(
    () => getEntriesForDay(selectedDay),
    [getEntriesForDay, selectedDay, timetableEntries, subjects]
  );
  const lessonEntry = entries.find((e) => e.period === LESSON_PERIOD);
  const activeSet = sets.find((s) => s.id === activeSetId);

  return (
    <Screen>
      <HeaderBar title="時間割・教科" onBack={() => router.back()} />

      <View style={styles.section}>
        <SectionHeader title="時間割を切り替え" icon="🗓️" />
        <View style={styles.setChips}>
          {sets.map((s) => (
            <Pressable
              key={s.id}
              style={[styles.setChip, s.id === activeSetId ? styles.setChipActive : null]}
              onPress={() => setActiveSet(s.id)}
            >
              <AppText color={s.id === activeSetId ? colors.white : colors.text}>{s.name}</AppText>
            </Pressable>
          ))}
          <Pressable style={styles.addSetChip} onPress={() => setCreateModalVisible(true)}>
            <AppText color={colors.primaryDark}>＋ 新しい時間割</AppText>
          </Pressable>
        </View>
        <View style={styles.setActions}>
          <Pressable onPress={() => setRenameModalVisible(true)} hitSlop={8}>
            <AppText variant="caption">✏️ この時間割の名前を変更</AppText>
          </Pressable>
          {sets.length > 1 ? (
            <Pressable onPress={() => activeSetId && deleteSet(activeSetId)} hitSlop={8}>
              <AppText variant="caption" color={colors.danger}>
                🗑️ この時間割を削除
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

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

      <View style={styles.section}>
        <SectionHeader title="習い事" icon="🎨" />
        <Pressable style={styles.periodRow} onPress={() => setPickerSlot(LESSON_PERIOD)}>
          <View style={styles.periodBadge}>
            <AppText style={styles.lessonIcon}>🎨</AppText>
          </View>
          <View
            style={[
              styles.subjectSlot,
              { backgroundColor: lessonEntry?.subject?.color ?? colors.surfaceAlt },
            ]}
          >
            <AppText color={lessonEntry ? colors.white : colors.textMuted}>
              {lessonEntry?.subject?.name ?? 'タップして選択'}
            </AppText>
          </View>
        </Pressable>
      </View>

      <SubjectPickerModal
        visible={pickerSlot !== null}
        subjects={subjects}
        onSelect={(subjectId) => {
          if (pickerSlot !== null) setSlot(selectedDay, pickerSlot, subjectId);
        }}
        onClose={() => setPickerSlot(null)}
      />

      <TimetableSetModal
        visible={createModalVisible}
        title="新しい時間割"
        onSave={(name) => createSet(name)}
        onClose={() => setCreateModalVisible(false)}
      />

      <TimetableSetModal
        visible={renameModalVisible}
        title="時間割の名前を変更"
        initialName={activeSet?.name}
        onSave={(name) => activeSetId && renameSet(activeSetId, name)}
        onClose={() => setRenameModalVisible(false)}
      />
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: {
      gap: spacing.sm,
    },
    setChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    setChip: {
      borderRadius: radius.round,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surfaceAlt,
    },
    setChipActive: {
      backgroundColor: colors.primary,
    },
    addSetChip: {
      borderRadius: radius.round,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    setActions: {
      flexDirection: 'row',
      gap: spacing.lg,
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
    lessonIcon: {
      fontSize: 18,
    },
    subjectSlot: {
      flex: 1,
      borderRadius: radius.md,
      padding: spacing.md,
    },
  });
}
