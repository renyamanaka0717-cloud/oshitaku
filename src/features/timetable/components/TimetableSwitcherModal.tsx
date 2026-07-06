import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { TimetableSet } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  sets: TimetableSet[];
  activeSetId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export function TimetableSwitcherModal({
  visible,
  sets,
  activeSetId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            時間割を切り替え
          </AppText>

          <View style={styles.list}>
            {sets.map((s) => {
              const active = s.id === activeSetId;
              return (
                <Pressable
                  key={s.id}
                  style={[styles.row, active ? styles.rowActive : null]}
                  onPress={() => {
                    onSelect(s.id);
                    onClose();
                  }}
                >
                  <AppText color={active ? colors.white : colors.text}>{s.name}</AppText>
                  {active ? <AppText color={colors.white}>✓</AppText> : null}
                </Pressable>
              );
            })}
          </View>

          <Pressable
            style={styles.createRow}
            onPress={() => {
              onClose();
              onCreate();
            }}
          >
            <AppText color={colors.primaryDark}>＋ 新しい時間割を追加</AppText>
          </Pressable>

          <View style={styles.footerActions}>
            <Pressable
              onPress={() => {
                onClose();
                onRename();
              }}
              hitSlop={8}
            >
              <AppText variant="caption">✏️ この時間割の名前を変更</AppText>
            </Pressable>
            {sets.length > 1 ? (
              <Pressable
                onPress={() => {
                  onClose();
                  onDelete();
                }}
                hitSlop={8}
              >
                <AppText variant="caption" color={colors.danger}>
                  🗑️ この時間割を削除
                </AppText>
              </Pressable>
            ) : null}
          </View>
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
      maxHeight: '80%',
    },
    title: {
      textAlign: 'center',
    },
    list: {
      gap: spacing.xs,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surfaceAlt,
    },
    rowActive: {
      backgroundColor: colors.primary,
    },
    createRow: {
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
      alignItems: 'center',
    },
    footerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });
}
