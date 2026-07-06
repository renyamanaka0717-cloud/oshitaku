import { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './Button';
import { ConfettiBurst } from './ConfettiBurst';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { playSound } from '@/features/sound/soundService';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function AllCompleteCelebration({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const cardScale = useRef(new Animated.Value(0.5)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    playSound('complete').catch(() => {});
    cardScale.setValue(0.5);
    Animated.spring(cardScale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 14 }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -10, duration: 350, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 350, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, cardScale, bounce]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ConfettiBurst active={visible} count={32} />
        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
          <Animated.Text style={[styles.emoji, { transform: [{ translateY: bounce }] }]}>
            🎉
          </Animated.Text>
          <AppText variant="hero" style={styles.center}>
            やったね！
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.center}>
            今日のおしたく、ぜんぶできたよ！
          </AppText>
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
    center: {
      textAlign: 'center',
    },
  });
}
