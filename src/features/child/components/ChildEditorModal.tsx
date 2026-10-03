import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CuteIcon } from '@/components/CuteIcon';
import { ChildAvatar } from './ChildAvatar';
import { AvatarPicker } from './AvatarPicker';
import { pickChildAvatarImage } from '@/features/child/imagePicker';
import { AVATAR_EMOJIS } from '@/features/child/avatars';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  initialName?: string;
  initialAvatarEmoji?: string;
  initialAvatarImageUri?: string | null;
  avatarColor: string;
  onSave: (input: { name: string; avatarEmoji: string; avatarImageUri: string | null }) => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function ChildEditorModal({
  visible,
  initialName = '',
  initialAvatarEmoji = AVATAR_EMOJIS[0],
  initialAvatarImageUri = null,
  avatarColor,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState(initialName);
  const [avatarEmoji, setAvatarEmoji] = useState(initialAvatarEmoji);
  const [avatarImageUri, setAvatarImageUri] = useState<string | null>(initialAvatarImageUri);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isEditing = !!onDelete;

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setAvatarEmoji(initialAvatarEmoji);
      setAvatarImageUri(initialAvatarImageUri);
      setConfirmingDelete(false);
    }
  }, [visible, initialName, initialAvatarEmoji, initialAvatarImageUri]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), avatarEmoji, avatarImageUri });
    onClose();
  };

  const handlePickPhoto = async () => {
    const uri = await pickChildAvatarImage();
    if (uri) setAvatarImageUri(uri);
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
            {isEditing ? 'お子さまを編集' : 'お子さまを追加'}
          </AppText>

          <View style={styles.preview}>
            <ChildAvatar avatarImageUri={avatarImageUri} avatarEmoji={avatarEmoji} avatarColor={avatarColor} size={72} />
          </View>

          <AppText variant="caption" color={colors.textMuted}>
            名前
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="名前"
            placeholderTextColor={colors.textMuted}
            style={styles.nameInput}
            maxLength={12}
            autoFocus
          />

          <Pressable style={styles.photoButton} onPress={handlePickPhoto}>
            <CuteIcon iconKey="photoPicker" size={18} fallback={<AppText style={styles.photoButtonIcon}>📷</AppText>} />
            <AppText variant="caption">写真を使う</AppText>
          </Pressable>

          <AppText variant="caption" color={colors.textMuted} style={styles.iconLabel}>
            アイコンを選ぶ
          </AppText>
          <ScrollView style={styles.iconScroll} showsVerticalScrollIndicator={false}>
            <AvatarPicker
              value={avatarImageUri ? '' : avatarEmoji}
              onSelect={(a) => {
                setAvatarEmoji(a);
                setAvatarImageUri(null);
              }}
            />
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
                  この子を削除
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
      maxHeight: '88%',
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    preview: {
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    nameInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    photoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      paddingVertical: spacing.sm,
      marginTop: spacing.xs,
    },
    photoButtonIcon: {
      fontSize: 18,
    },
    iconLabel: {
      marginTop: spacing.xs,
    },
    iconScroll: {
      maxHeight: 220,
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
