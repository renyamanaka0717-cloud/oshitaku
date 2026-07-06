import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  title: string;
  initialName?: string;
  onSave: (name: string) => void;
  onClose: () => void;
};

export function TimetableSetModal({ visible, title, initialName, onSave, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState(initialName ?? '');

  useEffect(() => {
    if (visible) setName(initialName ?? '');
  }, [visible, initialName]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="例：通常の時間割、2学期"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus
            onSubmitEditing={handleSave}
          />
          <Button label="保存" onPress={handleSave} disabled={!name.trim()} />
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
    },
    title: {
      textAlign: 'center',
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.md,
      fontSize: 16,
      color: colors.text,
    },
  });
}
