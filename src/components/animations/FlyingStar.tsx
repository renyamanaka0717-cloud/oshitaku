import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  trigger: boolean;
  emoji?: string;
};

export function FlyingStar({ trigger, emoji = '⭐' }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      progress.value = 0;
      progress.value = withSequence(
        withTiming(1, { duration: 550 }),
        withTiming(0, { duration: 0 })
      );
    }
  }, [trigger, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : 1 - progress.value,
    transform: [
      { translateY: -progress.value * 40 },
      { scale: 0.6 + progress.value * 0.8 },
    ],
  }));

  return (
    <Animated.Text style={[styles.star, animatedStyle]} pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    top: -10,
    right: -6,
    fontSize: 20,
  },
});
