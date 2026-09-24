import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CuteIconPicker } from '@/components/CuteIconPicker';
import { ALL_ICON_OPTIONS } from '@/theme/cuteIcons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

const DEFAULT_ICON = '📦';

type Props = {
  visible: boolean;
  initialName?: string;
  initialIcon?: string;
  onSave: (input: { name: string; icon: string }) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function ItemEditorModal({ visible, initialName = '', initialIcon = DEFAULT_ICON, onSave, onDelete, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState(initialIcon);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isEditing = !!onDelete;

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setIcon(initialIcon);
      setConfirmingDelete(false);
    }
  }, [visible, initialName, initialIcon]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon });
    onClose();
  };

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            {isEditing ? '持ち物を編集' : '持ち物を追加'}
          </AppText>

          <AppText variant="caption" color={colors.textMuted}>
            持ち物の名前
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="持ち物の名前"
            placeholderTextColor={colors.textMuted}
            style={styles.nameInput}
            autoFocus
          />

          <AppText variant="caption" color={colors.textMuted} style={styles.iconLabel}>
            アイコン
          </AppText>
          <ScrollView style={styles.iconScroll} showsVerticalScrollIndicator={false}>
            <CuteIconPicker options={ALL_ICON_OPTIONS} value={icon} onSelect={setIcon} />
          </ScrollView>

          <Button label="保存する" onPress={handleSave} disabled={!name.trim()} />

          {isEditing ? (
            confirmingDelete ? (
              <View style={styles.confirmRow}>
                <AppText variant="caption" color={colors.danger} style={styles.confirmText}>
                  本当に削除しますか？
                </AppText>
                <View style={styles.confirmButtons}>
                  <Pressable style={styles.confirmCancel} onPress={() => setConfirmingDelete(false)} hitSlop={6}>
                    <AppText variant="caption">キャンセル</AppText>
                  </Pressable>
                  <Pressable style={styles.confirmDelete} onPress={handleDelete} hitSlop={6}>
                    <AppText variant="caption" color={colors.white}>
                      削除する
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.deleteLink} onPress={() => setConfirmingDelete(true)} hitSlop={6}>
                <AppText variant="caption" color={colors.danger}>
                  この持ち物を削除
                </AppText>
              </Pressable>
            )
          ) : null}
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
      maxHeight: '85%',
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    nameInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    iconLabel: {
      marginTop: spacing.xs,
    },
    iconScroll: {
      maxHeight: 260,
    },
    deleteLink: {
      alignItems: 'center',
      paddingTop: spacing.xs,
    },
    confirmRow: {
      alignItems: 'center',
      gap: spacing.xs,
      paddingTop: spacing.xs,
    },
    confirmText: {
      textAlign: 'center',
    },
    confirmButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    confirmCancel: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
      backgroundColor: colors.surfaceAlt,
    },
    confirmDelete: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
      backgroundColor: colors.danger,
    },
  });
}
