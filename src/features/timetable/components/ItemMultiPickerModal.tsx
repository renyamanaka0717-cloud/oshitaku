import { useState, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Item } from '@/db/models';
import { colors, radius, spacing } from '@/theme';

type Props = {
  visible: boolean;
  items: Item[];
  selectedIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
};

export function ItemMultiPickerModal({ visible, items, selectedIds, onSave, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (visible) setSelected(selectedIds);
  }, [visible, selectedIds]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            必要な持ち物をえらぶ
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

const styles = StyleSheet.create({
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
});
