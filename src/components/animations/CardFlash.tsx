import { PropsWithChildren, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = PropsWithChildren<{
  trigger: boolean;
  flashColor: string;
  style?: StyleProp<ViewStyle>;
}>;

export function CardFlash({ trigger, flashColor, style, children }: Props) {
  const highlight = useSharedValue(0);

  useEffect(() => {
    if (trigger) {
      highlight.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 420 })
      );
    }
  }, [trigger, highlight]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: highlight.value > 0 ? flashColor : 'transparent',
    opacity: 1,
  }));

  return (
    <Animated.View
      style={[
        style,
        animatedStyle,
        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
      ]}
      pointerEvents="none"
    />
  );
}
