import { useState, useEffect, useMemo } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Item } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  title?: string;
  items: Item[];
  selectedIds: string[];
  onSave: (ids: string[]) => void;
  onCreateItem: (name: string, icon: string) => Promise<Item>;
  onClose: () => void;
};

export function ItemMultiPickerModal({
  visible,
  title = '必要な持ち物をえらぶ',
  items,
  selectedIds,
  onSave,
  onCreateItem,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [newIcon, setNewIcon] = useState('📦');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (visible) {
      setSelected(selectedIds);
      setNewIcon('📦');
      setNewName('');
    }
  }, [visible, selectedIds]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const item = await onCreateItem(newName.trim(), newIcon || '📦');
    setSelected((prev) => [...prev, item.id]);
    setNewName('');
    setNewIcon('📦');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
          <View style={styles.grid}>
            {items.map((item) => {
              const active = selected.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={[styles.chip, active ? styles.chipActive : null]}
                  onPress={() => toggle(item.id)}
                >
                  <AppText color={active ? colors.white : colors.text}>
                    {item.icon} {item.name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.newItemRow}>
            <TextInput
              value={newIcon}
              onChangeText={setNewIcon}
              maxLength={2}
              style={styles.newIconInput}
            />
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="あたらしい持ち物を入力"
              placeholderTextColor={colors.textMuted}
              style={styles.newNameInput}
              onSubmitEditing={handleCreate}
            />
            <Button label="登録" size="md" onPress={handleCreate} disabled={!newName.trim()} />
          </View>

          <Button
            label="決定"
            onPress={() => {
              onSave(selected);
              onClose();
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      maxHeight: '70%',
    },
    title: {
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      borderRadius: radius.round,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surfaceAlt,
    },
    chipActive: {
      backgroundColor: colors.secondaryDark,
    },
    newItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
    },
    newIconInput: {
      width: 44,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 18,
      color: colors.text,
    },
    newNameInput: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
  });
}
