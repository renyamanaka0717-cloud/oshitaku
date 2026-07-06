import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { SubjectPickerModal } from '@/features/timetable/components/SubjectPickerModal';
import { ItemMultiPickerModal } from '@/features/timetable/components/ItemMultiPickerModal';
import { useActiveChild } from '@/features/child/store';
import { useTimetableStore } from '@/features/timetable/store';
import { colors, radius, spacing } from '@/theme';
import { WEEKDAY_LABELS_JA } from '@/utils/date';

const DAYS = [1, 2, 3, 4, 5]; // 月-金
const PERIODS = [1, 2, 3, 4, 5, 6];

export default function TimetableSettings() {
  const child = useActiveChild();
  const load = useTimetableStore((s) => s.load);
  const subjects = useTimetableStore((s) => s.subjects);
  const items = useTimetableStore((s) => s.items);
  const timetableEntries = useTimetableStore((s) => s.entries);
  const subjectItemMap = useTimetableStore((s) => s.subjectItemMap);
  const createSubject = useTimetableStore((s) => s.createSubject);
  const deleteSubject = useTimetableStore((s) => s.deleteSubject);
  const setSubjectItems = useTimetableStore((s) => s.setSubjectItems);
  const setSlot = useTimetableStore((s) => s.setSlot);
  const getEntriesForDay = useTimetableStore((s) => s.getEntriesForDay);

  const [selectedDay, setSelectedDay] = useState(1);
  const [subjectName, setSubjectName] = useState('');
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [itemPickerSubjectId, setItemPickerSubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const entries = useMemo(
    () => getEntriesForDay(selectedDay),
    [getEntriesForDay, selectedDay, timetableEntries, subjects]
  );

  const handleAddSubject = async () => {
    if (!subjectName.trim()) return;
    await createSubject(subjectName.trim());
    setSubjectName('');
  };

  return (
    <Screen>
      <HeaderBar title="時間割・教科" onBack={() => router.back()} />

      <View style={styles.section}>
        <SectionHeader title="教科" icon="🖍️" />
        <View style={styles.subjectList}>
          {subjects.map((subject) => (
            <View key={subject.id} style={[styles.subjectChip, { backgroundColor: subject.color }]}>
              <Pressable onPress={() => setItemPickerSubjectId(subject.id)}>
                <AppText color={colors.white}>{subject.name}</AppText>
              </Pressable>
              <Pressable onPress={() => deleteSubject(subject.id)} hitSlop={8}>
                <AppText color={colors.white}> ✕</AppText>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.row}>
          <TextInput
            value={subjectName}
            onChangeText={setSubjectName}
            placeholder="新しい教科名"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <Button label="追加" onPress={handleAddSubject} disabled={!subjectName.trim()} />
        </View>
        <AppText variant="caption" color={colors.textMuted}>
          教科をタップすると必要な持ち物を設定できます
        </AppText>
      </View>

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

      <ItemMultiPickerModal
        visible={itemPickerSubjectId !== null}
        items={items}
        selectedIds={itemPickerSubjectId ? subjectItemMap[itemPickerSubjectId] ?? [] : []}
        onSave={(ids) => {
          if (itemPickerSubjectId) setSubjectItems(itemPickerSubjectId, ids);
        }}
        onClose={() => setItemPickerSubjectId(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  subjectList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.round,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.text,
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
