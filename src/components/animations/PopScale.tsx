import { PropsWithChildren, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = PropsWithChildren<{
  trigger: boolean;
  restScale?: number;
  popScale?: number;
  style?: StyleProp<ViewStyle>;
}>;

export function PopScale({ trigger, restScale = 1, popScale = 1.25, style, children }: Props) {
  const scale = useSharedValue(trigger ? restScale : restScale * 0.85);

  useEffect(() => {
    if (trigger) {
      scale.value = withSequence(
        withTiming(popScale, { duration: 120 }),
        withSpring(restScale, { damping: 9, stiffness: 160 })
      );
    } else {
      scale.value = withSpring(restScale * 0.85, { damping: 12, stiffness: 180 });
    }
  }, [trigger, popScale, restScale, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
