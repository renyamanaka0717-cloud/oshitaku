import { useEffect, useMemo } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { Button } from './Button';
import { ConfettiBurst } from './ConfettiBurst';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { STAMP_EMOJI } from '@/features/stamps/store';
import { playSound } from '@/features/sound/soundService';

type Props = {
  visible: boolean;
  points: number;
  stampKind: 'normal' | 'rare' | null;
  stampType?: string;
  onClose: () => void;
};

export function CelebrationModal({ visible, points, stampKind, stampType, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isRare = stampKind === 'rare';
  const emoji = stampType ? STAMP_EMOJI[stampType] ?? '⭐' : '⭐';

  const cardScale = useSharedValue(0.6);
  const emojiScale = useSharedValue(0);
  const emojiRotate = useSharedValue(0);
  const glowPulse = useSharedValue(0.9);

  useEffect(() => {
    if (!visible) return;
    playSound(stampKind ? 'stamp' : 'complete').catch(() => {});

    cardScale.value = 0.6;
    emojiScale.value = 0;
    emojiRotate.value = 0;

    cardScale.value = withSpring(1, { damping: 9, stiffness: 140 });
    emojiScale.value = withDelay(
      80,
      withSpring(1, { damping: isRare ? 7 : 10, stiffness: 150 })
    );
    emojiRotate.value = withDelay(80, withTiming(1, { duration: isRare ? 700 : 450 }));

    if (isRare) {
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 650 }),
          withTiming(0.9, { duration: 650 })
        ),
        -1
      );
    }
  }, [visible, isRare, stampKind, cardScale, emojiScale, emojiRotate, glowPulse]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { rotate: `${emojiRotate.value * 360}deg` },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowPulse.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ConfettiBurst active={visible} count={isRare ? 28 : 16} />
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.emojiWrap}>
            {isRare ? <Animated.View style={[styles.glow, glowStyle]} /> : null}
            <Animated.Text style={[styles.emoji, emojiStyle]}>{emoji}</Animated.Text>
          </View>
          <AppText variant="title" style={styles.center}>
            {isRare ? 'レアスタンプゲット！' : stampKind ? 'よくできました！' : 'やったね！'}
          </AppText>
          {points > 0 ? (
            <AppText variant="subtitle" color={colors.primaryDark} style={styles.center}>
              +{points} ポイント
            </AppText>
          ) : null}
          <Button label="やったー！" onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
    emojiWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 96,
      height: 96,
    },
    glow: {
      position: 'absolute',
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: colors.accent,
      opacity: 0.4,
    },
    emoji: {
      fontSize: 64,
    },
    center: {
      textAlign: 'center',
    },
  });
}
