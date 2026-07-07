import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chore } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  chore: Chore | null;
  onComplete: () => void;
  onClose: () => void;
};

export function ChoreDetailModal({ visible, chore, onComplete, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) setConfirming(false);
  }, [visible, chore?.id]);

  const handleClose = () => {
    setConfirming(false);
    onClose();
  };

  if (!chore) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {confirming ? (
            <>
              <AppText variant="subtitle" style={styles.center}>
                {chore.pointValue}ポイントもらう？
              </AppText>
              <View style={styles.confirmRow}>
                <Button
                  label="やめる"
                  variant="ghost"
                  onPress={() => setConfirming(false)}
                  style={styles.confirmButton}
                />
                <Button
                  label="した！"
                  onPress={() => {
                    onComplete();
                    handleClose();
                  }}
                  style={styles.confirmButton}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.iconBox}>
                <AppText style={styles.icon}>{chore.icon}</AppText>
              </View>
              <AppText variant="title" style={styles.center}>
                {chore.name}
              </AppText>
              <View style={styles.pointBadge}>
                <AppText variant="subtitle" color={colors.primaryDark}>
                  ⭐ +{chore.pointValue}pt
                </AppText>
              </View>
              <Button label="した！" onPress={() => setConfirming(true)} style={styles.fullButton} />
            </>
          )}
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
      alignItems: 'center',
    },
    iconBox: {
      width: 160,
      height: 160,
      borderRadius: radius.lg,
      backgroundColor: colors.green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 64,
    },
    center: {
      textAlign: 'center',
    },
    pointBadge: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    fullButton: {
      alignSelf: 'stretch',
    },
    confirmRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignSelf: 'stretch',
    },
    confirmButton: {
      flex: 1,
    },
  });
}
