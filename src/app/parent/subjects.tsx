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

  return (
    <Screen>
      <HeaderBar title="教科・持ち物の登録" onBack={() => router.back()} />

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
        <AppText variant="caption">教科をタップすると必要な持ち物を設定できます</AppText>
      </View>

      <ItemMultiPickerModal
        visible={itemPickerSubjectId !== null}
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
  });
}
