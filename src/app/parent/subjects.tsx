import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import { ItemMultiPickerModal } from '@/features/timetable/components/ItemMultiPickerModal';
import { useActiveChild } from '@/features/child/store';
import { useTimetableStore } from '@/features/timetable/store';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export default function SubjectsSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const load = useTimetableStore((s) => s.load);
  const subjects = useTimetableStore((s) => s.subjects);
  const items = useTimetableStore((s) => s.items);
  const subjectItemMap = useTimetableStore((s) => s.subjectItemMap);
  const createSubject = useTimetableStore((s) => s.createSubject);
  const deleteSubject = useTimetableStore((s) => s.deleteSubject);
  const setSubjectItems = useTimetableStore((s) => s.setSubjectItems);
  const createItem = useTimetableStore((s) => s.createItem);

  const [subjectName, setSubjectName] = useState('');
  const [itemPickerSubjectId, setItemPickerSubjectId] = useState<string | null>(null);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const handleAddSubject = async () => {
    if (!subjectName.trim()) return;
    await createSubject(subjectName.trim());
    setSubjectName('');
  };

  const activeSubject = subjects.find((s) => s.id === itemPickerSubjectId);

  return (
    <Screen>
      <HeaderBar title="教科・持ち物の登録" onBack={() => router.back()} />

      <View style={styles.section}>
        <SectionHeader title="教科" icon="🖍️" />

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

        <View style={styles.subjectList}>
          {subjects.map((subject) => {
            const itemCount = subjectItemMap[subject.id]?.length ?? 0;
            return (
              <View key={subject.id} style={styles.subjectCard}>
                <Pressable
                  style={styles.subjectTapArea}
                  onPress={() => setItemPickerSubjectId(subject.id)}
                >
                  <View style={[styles.subjectIcon, { backgroundColor: subject.color }]}>
                    <AppText style={styles.subjectIconText}>🖍️</AppText>
                  </View>
                  <View style={styles.subjectTextCol}>
                    <AppText variant="subtitle">{subject.name}</AppText>
                    <AppText variant="caption" color={colors.textMuted}>
                      {itemCount > 0 ? `持ち物 ${itemCount}こ` : '持ち物を追加する'}
                    </AppText>
                  </View>
                  <AppText style={styles.chevron} color={colors.textMuted}>
                    ›
                  </AppText>
                </Pressable>
                <Pressable
                  onPress={() => deleteSubject(subject.id)}
                  hitSlop={8}
                  style={styles.deleteButton}
                >
                  <AppText color={colors.textMuted}>✕</AppText>
                </Pressable>
              </View>
            );
          })}
        </View>

        <AppText variant="caption">教科をタップすると必要な持ち物を設定できます</AppText>
      </View>

      <ItemMultiPickerModal
        visible={itemPickerSubjectId !== null}
        title={activeSubject ? `${activeSubject.name}の持ち物` : undefined}
        items={items}
        selectedIds={itemPickerSubjectId ? subjectItemMap[itemPickerSubjectId] ?? [] : []}
        onSave={(ids) => {
          if (itemPickerSubjectId) setSubjectItems(itemPickerSubjectId, ids);
        }}
        onCreateItem={createItem}
        onClose={() => setItemPickerSubjectId(null)}
      />
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
    subjectList: {
      gap: spacing.sm,
    },
    subjectCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    subjectTapArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
    },
    subjectIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.round,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subjectIconText: {
      fontSize: 24,
    },
    subjectTextCol: {
      flex: 1,
      gap: 2,
    },
    chevron: {
      fontSize: 24,
    },
    deleteButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
  });
}
