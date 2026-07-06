import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, spacing } from '@/theme';
import { STAMP_EMOJI } from '@/features/stamps/store';

type Props = {
  visible: boolean;
  points: number;
  stampKind: 'normal' | 'rare' | null;
  stampType?: string;
  onClose: () => void;
};

export function CelebrationModal({ visible, points, stampKind, stampType, onClose }: Props) {
  const emoji = stampType ? STAMP_EMOJI[stampType] ?? '⭐' : '⭐';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <AppText style={styles.emoji}>{emoji}</AppText>
          <AppText variant="title" style={styles.center}>
            {stampKind === 'rare' ? 'レアスタンプゲット！' : 'よくできました！'}
          </AppText>
          {points > 0 ? (
            <AppText variant="subtitle" color={colors.primaryDark} style={styles.center}>
              +{points} ポイント
            </AppText>
          ) : null}
          <Button label="やったー！" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  emoji: {
    fontSize: 64,
  },
  center: {
    textAlign: 'center',
  },
});
