import { useEffect, useMemo } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { Button } from './Button';
import { ConfettiBurst } from './ConfettiBurst';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { playSound } from '@/features/sound/soundService';
import { STAMP_EMOJI } from '@/features/stamps/store';

type PerfectDayInfo = {
  bonusPoints: number;
  specialStampType: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  perfectDay?: PerfectDayInfo | null;
};

export function AllCompleteCelebration({ visible, onClose, perfectDay }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const cardScale = useSharedValue(0.5);
  const bounce = useSharedValue(0);
  const glowPulse = useSharedValue(0.9);

  useEffect(() => {
    if (!visible) return;
    playSound(perfectDay ? 'stamp' : 'complete').catch(() => {});
    cardScale.value = 0.5;
    cardScale.value = withSpring(1, { damping: 8, stiffness: 130 });

    bounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 350 }),
        withTiming(0, { duration: 350 })
      ),
      -1
    );

    if (perfectDay) {
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 650 }),
          withTiming(0.9, { duration: 650 })
        ),
        -1
      );
    }
  }, [visible, perfectDay, cardScale, bounce, glowPulse]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowPulse.value }],
  }));

  const specialEmoji = perfectDay ? STAMP_EMOJI[perfectDay.specialStampType] ?? '✨' : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ConfettiBurst active={visible} count={perfectDay ? 40 : 32} />
        <Animated.View style={[styles.card, cardStyle]}>
          {perfectDay ? (
            <View style={styles.specialEmojiWrap}>
              <Animated.View style={[styles.glow, glowStyle]} />
              <AppText style={styles.specialEmoji}>{specialEmoji}</AppText>
            </View>
          ) : (
            <Animated.Text style={[styles.emoji, emojiStyle]}>🎉</Animated.Text>
          )}
          <AppText variant="hero" style={styles.center}>
            {perfectDay ? 'パーフェクトな一日！✨' : 'やったね！'}
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.center}>
            {perfectDay ? '朝も夜もばっちりだったね！' : '今日のおしたく、ぜんぶできたよ！'}
          </AppText>
          {perfectDay ? (
            <AppText variant="subtitle" color={colors.primaryDark} style={styles.center}>
              +{perfectDay.bonusPoints} ボーナスポイント！
            </AppText>
          ) : null}
          <Button label="ばんざーい！" onPress={onClose} />
        </Animated.View>
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
    emoji: {
      fontSize: 72,
    },
    specialEmojiWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 104,
      height: 104,
    },
    glow: {
      position: 'absolute',
      width: 104,
      height: 104,
      borderRadius: 52,
      backgroundColor: colors.accent,
      opacity: 0.4,
    },
    specialEmoji: {
      fontSize: 72,
    },
    center: {
      textAlign: 'center',
    },
  });
}
