import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { todayKey } from '@/utils/date';

type Props = {
  visible: boolean;
  onSave: (input: { title: string; date: string; icon: string }) => void;
  onClose: () => void;
};

function splitDateKey(dateKey: string): [string, string, string] {
  const [y, m, d] = dateKey.split('-');
  return [y, m, d];
}

export function AddEventModal({ visible, onSave, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📅');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  useEffect(() => {
    if (visible) {
      const [y, m, d] = splitDateKey(todayKey());
      setTitle('');
      setIcon('📅');
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  }, [visible]);

  const handleSave = () => {
    if (!title.trim()) return;
    const y = year.padStart(4, '0');
    const m = month.padStart(2, '0');
    const d = day.padStart(2, '0');
    if (!y || !m || !d) return;
    onSave({ title: title.trim(), date: `${y}-${m}-${d}`, icon: icon || '📅' });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            たのしみな予定を追加
          </AppText>

          <View style={styles.row}>
            <TextInput value={icon} onChangeText={setIcon} maxLength={2} style={styles.iconInput} />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="予定の名前"
              placeholderTextColor={colors.textMuted}
              style={styles.titleInput}
              autoFocus
            />
          </View>

          <View style={styles.dateRow}>
            <TextInput
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
              maxLength={4}
              style={styles.yearInput}
            />
            <AppText variant="body">年</AppText>
            <TextInput
              value={month}
              onChangeText={setMonth}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.dateInput}
            />
            <AppText variant="body">月</AppText>
            <TextInput
              value={day}
              onChangeText={setDay}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.dateInput}
            />
            <AppText variant="body">日</AppText>
          </View>

          <Button label="追加する" onPress={handleSave} disabled={!title.trim()} />
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
    titleInput: {
      flex: 1,
      minWidth: 0,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    yearInput: {
      width: 64,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    dateInput: {
      width: 48,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
  });
}
