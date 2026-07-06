import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Child } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  children: Child[];
  activeChildId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export function ChildSwitcherModal({ visible, children, activeChildId, onSelect, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="title" style={styles.title}>
            だれのおしたく？
          </AppText>
          <View style={styles.grid}>
            {children.map((child) => (
              <Pressable
                key={child.id}
                style={[
                  styles.item,
                  { backgroundColor: child.avatarColor },
                  child.id === activeChildId ? styles.itemActive : null,
                ]}
                onPress={() => {
                  onSelect(child.id);
                  onClose();
                }}
              >
                <AppText style={styles.emoji}>{child.avatarEmoji}</AppText>
                <AppText variant="subtitle">{child.name}</AppText>
              </Pressable>
            ))}
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
    },
    title: {
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      justifyContent: 'center',
    },
    item: {
      width: 100,
      height: 100,
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    itemActive: {
      borderWidth: 4,
      borderColor: colors.primaryDark,
    },
    emoji: {
      fontSize: 36,
    },
  });
}
