import { useEffect, useMemo } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AppText } from './AppText';
import { Button } from './Button';
import { ConfettiBurst } from './ConfettiBurst';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { Icon } from '@/theme/icons';
import { playSound } from '@/features/sound/soundService';

type Props = {
  visible: boolean;
  points: number;
  onClose: () => void;
};

export function CelebrationModal({ visible, points, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const cardScale = useSharedValue(0.6);
  const emojiScale = useSharedValue(0);
  const emojiRotate = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    playSound('complete').catch(() => {});

    cardScale.value = 0.6;
    emojiScale.value = 0;
    emojiRotate.value = 0;

    cardScale.value = withSpring(1, { damping: 9, stiffness: 140 });
    emojiScale.value = withDelay(80, withSpring(1, { damping: 10, stiffness: 150 }));
    emojiRotate.value = withDelay(80, withTiming(1, { duration: 450 }));
  }, [visible, cardScale, emojiScale, emojiRotate]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { rotate: `${emojiRotate.value * 360}deg` },
    ],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ConfettiBurst active={visible} count={16} />
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.emojiWrap}>
            <Animated.View style={emojiStyle}>
              <Icon name="star" size={64} />
            </Animated.View>
          </View>
          <AppText variant="title" style={styles.center}>
            やったね！
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
    center: {
      textAlign: 'center',
    },
  });
}
