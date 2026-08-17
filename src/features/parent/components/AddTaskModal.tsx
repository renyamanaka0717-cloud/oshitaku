import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { DayTypePicker, WEEKDAY_DAYS } from './DayTypePicker';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  onSave: (input: { label: string; icon: string; daysOfWeek: number[] }) => void;
  onClose: () => void;
};

export function AddTaskModal({ visible, onSave, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('✅');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(WEEKDAY_DAYS);

  useEffect(() => {
    if (visible) {
      setLabel('');
      setIcon('✅');
      setDaysOfWeek(WEEKDAY_DAYS);
    }
  }, [visible]);

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({ label: label.trim(), icon: icon || '✅', daysOfWeek });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            新しいタスクを追加
          </AppText>
          <View style={styles.row}>
            <TextInput value={icon} onChangeText={setIcon} maxLength={2} style={styles.iconInput} />
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder="タスクの名前"
              placeholderTextColor={colors.textMuted}
              style={styles.labelInput}
              autoFocus
              onSubmitEditing={handleSave}
            />
          </View>
          <DayTypePicker value={daysOfWeek} onChange={setDaysOfWeek} />
          <Button label="追加する" onPress={handleSave} disabled={!label.trim()} />
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    sheet: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
    },
    title: {
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconInput: {
      width: 44,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 18,
      color: colors.text,
    },
    labelInput: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
  });
}
