import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { SubjectPickerModal } from '@/features/timetable/components/SubjectPickerModal';
import { TimetableSetModal } from '@/features/timetable/components/TimetableSetModal';
import { TimetableSwitcherModal } from '@/features/timetable/components/TimetableSwitcherModal';
import { useActiveChild } from '@/features/child/store';
import { useTimetableStore } from '@/features/timetable/store';
import { LESSON_PERIOD } from '@/features/timetable/constants';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { WEEKDAY_LABELS_JA } from '@/utils/date';

const DAYS = [1, 2, 3, 4, 5, 6, 0]; // 月-日
const PERIODS = [1, 2, 3, 4, 5, 6];

type Cursor = { day: number; period: number };

// After picking a subject in edit mode, move on to the next period so a
// parent can fill the whole week without re-opening the picker each time.
// The lesson slot (習い事) sits outside that numbered sequence, so it
// doesn't auto-advance anywhere.
function advanceCursor(cursor: Cursor): Cursor | null {
  const { day, period } = cursor;
  if (period === LESSON_PERIOD) return null;
  const lastPeriod = PERIODS[PERIODS.length - 1];
  if (period < lastPeriod) return { day, period: period + 1 };
  const dayIndex = DAYS.indexOf(day);
  const nextDay = DAYS[(dayIndex + 1) % DAYS.length];
  return { day: nextDay, period: PERIODS[0] };
}

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
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [cursor, setCursor] = useState<Cursor | null>(null);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const entries = useMemo(
    () => getEntriesForDay(selectedDay),
    [getEntriesForDay, selectedDay, timetableEntries, subjects]
  );
  const lessonEntry = entries.find((e) => e.period === LESSON_PERIOD);
  const activeSet = sets.find((s) => s.id === activeSetId);

  const startEdit = () => {
    const first: Cursor = { day: DAYS[0], period: PERIODS[0] };
    setEditMode(true);
    setCursor(first);
    setSelectedDay(first.day);
  };

  const stopEdit = () => {
    setEditMode(false);
    setCursor(null);
  };

  const handlePeriodPress = (period: number) => {
    if (editMode) {
      setCursor({ day: selectedDay, period });
    } else {
      setPickerSlot(period);
    }
  };

  const handleEditSelect = (subjectId: string | null) => {
    if (!cursor) return;
    setSlot(cursor.day, cursor.period, subjectId);
    const next = advanceCursor(cursor);
    if (next) {
      setCursor(next);
      setSelectedDay(next.day);
    }
  };

  return (
    <Screen scroll={false} contentStyle={styles.screenContent}>
      <HeaderBar
        title="時間割・教科"
        onBack={() => router.back()}
        right={
          <Pressable
            style={[styles.editToggle, editMode ? styles.editToggleActive : null]}
            onPress={editMode ? stopEdit : startEdit}
          >
            <AppText variant="caption" color={editMode ? colors.white : colors.text}>
              {editMode ? '完了' : '編集'}
            </AppText>
          </Pressable>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionHeader title="時間割を切り替え" icon="🗓️" />
          <Pressable style={styles.switchButton} onPress={() => setSwitcherVisible(true)}>
            <AppText variant="subtitle" color={colors.white}>
              {activeSet?.name ?? '時間割'}
            </AppText>
            <AppText color={colors.white}>切り替え ▾</AppText>
          </Pressable>
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
              const isCursorHere = editMode && cursor?.day === selectedDay && cursor.period === period;
              return (
                <Pressable key={period} style={styles.periodRow} onPress={() => handlePeriodPress(period)}>
                  <View style={styles.cursorIndicator}>
                    {isCursorHere ? <AppText style={styles.cursorArrow}>▶</AppText> : null}
                  </View>
                  <View style={styles.periodBadge}>
                    <AppText variant="subtitle">{period}</AppText>
                  </View>
                  <View
                    style={[
                      styles.subjectSlot,
                      { backgroundColor: entry?.subject?.color ?? colors.surfaceAlt },
                      isCursorHere ? styles.subjectSlotActive : null,
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
          {(() => {
            const isCursorHere = editMode && cursor?.day === selectedDay && cursor.period === LESSON_PERIOD;
            return (
              <Pressable
                style={styles.periodRow}
                onPress={() => (editMode ? setCursor({ day: selectedDay, period: LESSON_PERIOD }) : setPickerSlot(LESSON_PERIOD))}
              >
                <View style={styles.cursorIndicator}>
                  {isCursorHere ? <AppText style={styles.cursorArrow}>▶</AppText> : null}
                </View>
                <View style={styles.periodBadge}>
                  <AppText style={styles.lessonIcon}>🎨</AppText>
                </View>
                <View
                  style={[
                    styles.subjectSlot,
                    { backgroundColor: lessonEntry?.subject?.color ?? colors.surfaceAlt },
                    isCursorHere ? styles.subjectSlotActive : null,
                  ]}
                >
                  <AppText color={lessonEntry ? colors.white : colors.textMuted}>
                    {lessonEntry?.subject?.name ?? 'タップして選択'}
                  </AppText>
                </View>
              </Pressable>
            );
          })()}
        </View>
      </ScrollView>

      {editMode && cursor ? (
        <View style={styles.editPanel}>
          <AppText variant="caption" color={colors.textMuted} style={styles.editPanelLabel}>
            {WEEKDAY_LABELS_JA[cursor.day]}曜日・
            {cursor.period === LESSON_PERIOD ? '習い事' : `${cursor.period}時間目`}
            を編集中
          </AppText>
          <View style={styles.editPanelGrid}>
            <Pressable style={[styles.editChip, { backgroundColor: colors.surfaceAlt }]} onPress={() => handleEditSelect(null)}>
              <AppText>空白</AppText>
            </Pressable>
            {subjects.map((s) => (
              <Pressable
                key={s.id}
                style={[styles.editChip, { backgroundColor: s.color }]}
                onPress={() => handleEditSelect(s.id)}
              >
                <AppText color={colors.white}>{s.name}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <SubjectPickerModal
        visible={pickerSlot !== null}
        subjects={subjects}
        onSelect={(subjectId) => {
          if (pickerSlot !== null) setSlot(selectedDay, pickerSlot, subjectId);
        }}
        onClose={() => setPickerSlot(null)}
      />

      <TimetableSwitcherModal
        visible={switcherVisible}
        sets={sets}
        activeSetId={activeSetId}
        onSelect={(id) => setActiveSet(id)}
        onCreate={() => setCreateModalVisible(true)}
        onRename={() => setRenameModalVisible(true)}
        onDelete={() => activeSetId && deleteSet(activeSetId)}
        onClose={() => setSwitcherVisible(false)}
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
    screenContent: {
      flex: 1,
      gap: spacing.md,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      gap: spacing.md,
      paddingBottom: spacing.md,
    },
    editToggle: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
      backgroundColor: colors.surfaceAlt,
    },
    editToggleActive: {
      backgroundColor: colors.primary,
    },
    section: {
      gap: spacing.sm,
    },
    switchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.primary,
    },
    dayTabs: {
      flexDirection: 'row',
      gap: 4,
    },
    dayTab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: 2,
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
    cursorIndicator: {
      width: 16,
      alignItems: 'center',
    },
    cursorArrow: {
      fontSize: 16,
      color: colors.primary,
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
    subjectSlotActive: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    editPanel: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.sm,
      shadowColor: colors.shadow,
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: -2 },
      elevation: 4,
    },
    editPanelLabel: {
      textAlign: 'center',
    },
    editPanelGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    editChip: {
      borderRadius: radius.round,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
  });
}
