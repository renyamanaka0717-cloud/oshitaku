import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { ChildEditorModal } from '@/features/child/components/ChildEditorModal';
import { useChildStore } from '@/features/child/store';
import { Child } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { goBack } from '@/utils/navigation';

export default function ChildrenSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { children, addChild, updateChild, removeChild } = useChildStore();
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const canDeleteEditing = !!editingChild && children.length > 1;

  return (
    <Screen>
      <HeaderBar title="お子さま管理" onBack={goBack} />

      {children.length > 0 ? (
        <Card style={styles.listCard}>
          {children.map((child, index) => (
            <Pressable
              key={child.id}
              style={[styles.row, index > 0 ? styles.rowDivider : null]}
              onPress={() => setEditingChild(child)}
            >
              <ChildAvatar
                avatarImageUri={child.avatarImageUri}
                avatarEmoji={child.avatarEmoji}
                avatarColor={child.avatarColor}
                size={48}
              />
              <AppText variant="subtitle" style={styles.name} numberOfLines={1}>
                {child.name}
              </AppText>
              <View style={styles.editAffix}>
                <AppText variant="caption" color={colors.textMuted}>
                  編集
                </AppText>
                <AppText style={styles.chevron} color={colors.textMuted}>
                  ›
                </AppText>
              </View>
            </Pressable>
          ))}
        </Card>
      ) : null}

      <Pressable style={styles.addRow} onPress={() => setAddModalVisible(true)}>
        <AppText variant="subtitle" color={colors.primaryDark}>
          ＋ お子さまを追加
        </AppText>
      </Pressable>

      <ChildEditorModal
        visible={!!editingChild || addModalVisible}
        initialName={editingChild?.name}
        initialAvatarEmoji={editingChild?.avatarEmoji}
        initialAvatarImageUri={editingChild?.avatarImageUri}
        avatarColor={editingChild?.avatarColor ?? colors.accent}
        onSave={({ name, avatarEmoji, avatarImageUri }) => {
          if (editingChild) {
            updateChild(editingChild.id, { name, avatarEmoji, avatarImageUri });
          } else {
            addChild({ name, avatarEmoji, avatarImageUri });
          }
        }}
        onDelete={canDeleteEditing ? () => removeChild(editingChild!.id) : undefined}
        onClose={() => {
          setEditingChild(null);
          setAddModalVisible(false);
        }}
      />
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    listCard: {
      padding: 0,
      gap: 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    name: {
      flex: 1,
    },
    editAffix: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    chevron: {
      fontSize: 24,
    },
    addRow: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      marginTop: spacing.md,
    },
  });
}
