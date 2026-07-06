import { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
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

  const cardScale = useRef(new Animated.Value(0.6)).current;
  const emojiScale = useRef(new Animated.Value(0)).current;
  const emojiRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!visible) return;
    playSound(stampKind ? 'stamp' : 'complete').catch(() => {});

    cardScale.setValue(0.6);
    emojiScale.setValue(0);
    emojiRotate.setValue(0);

    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 10 }).start();
    Animated.sequence([
      Animated.delay(80),
      Animated.parallel([
        Animated.spring(emojiScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 14,
          bounciness: isRare ? 20 : 12,
        }),
        Animated.timing(emojiRotate, {
          toValue: 1,
          duration: isRare ? 700 : 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    if (isRare) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowPulse, { toValue: 1.15, duration: 650, useNativeDriver: true }),
          Animated.timing(glowPulse, { toValue: 0.9, duration: 650, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [visible, isRare, stampKind, cardScale, emojiScale, emojiRotate, glowPulse]);

  const rotateDeg = emojiRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ConfettiBurst active={visible} count={isRare ? 28 : 16} />
        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
          <View style={styles.emojiWrap}>
            {isRare ? (
              <Animated.View
                style={[styles.glow, { transform: [{ scale: glowPulse }] }]}
              />
            ) : null}
            <Animated.Text
              style={[
                styles.emoji,
                { transform: [{ scale: emojiScale }, { rotate: rotateDeg }] },
              ]}
            >
              {emoji}
            </Animated.Text>
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
