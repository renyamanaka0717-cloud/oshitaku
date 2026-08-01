import { useMemo } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  choreName: string | null;
  onClose: () => void;
};

export function ChoreRequestSentModal({ visible, choreName, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!choreName) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <AppText style={styles.icon}>📨</AppText>
          <AppText variant="hero" style={styles.center}>
            申請したよ！
          </AppText>
          <AppText variant="subtitle" color={colors.textMuted} style={styles.center}>
            「{choreName}」をおうちの人が確認するまでまってね
          </AppText>
          <Button label="わかった！" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.sm,
      width: '100%',
      maxWidth: 320,
    },
    icon: {
      fontSize: 56,
    },
    center: {
      textAlign: 'center',
    },
  });
}
