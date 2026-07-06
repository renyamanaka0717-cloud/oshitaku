import { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { ConfettiBurst } from '@/components/ConfettiBurst';
import { Reward } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { playSound } from '@/features/sound/soundService';

type Props = {
  visible: boolean;
  reward: Reward | null;
  onClose: () => void;
};

export function RewardCelebration({ visible, reward, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(0.5)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    playSound('reward').catch(() => {});
    scale.setValue(0.5);
    rotate.setValue(0);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 16 }).start();
    Animated.sequence([
      Animated.timing(rotate, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: -1, duration: 250, useNativeDriver: true }),
      Animated.timing(rotate, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [visible, scale, rotate]);

  if (!reward) return null;

  const rotateDeg = rotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-12deg', '0deg', '12deg'] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ConfettiBurst active={visible} count={24} />
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Animated.Text style={[styles.icon, { transform: [{ rotate: rotateDeg }] }]}>
            {reward.icon}
          </Animated.Text>
          <AppText variant="hero" style={styles.center}>
            ごほうびGET！
          </AppText>
          <AppText variant="subtitle" color={colors.primaryDark} style={styles.center}>
            {reward.name}
          </AppText>
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
      fontSize: 64,
    },
    center: {
      textAlign: 'center',
    },
  });
}
