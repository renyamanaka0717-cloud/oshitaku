import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

type Props = PropsWithChildren<{
  watch: number;
}>;

// Plays a little "coin hop" bounce whenever `watch` increases — used to
// celebrate a points gain without a full modal/animation sequence.
export function BounceOnChange({ children, watch }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(watch);

  useEffect(() => {
    if (watch > prev.current) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 30, bounciness: 18 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 12 }),
      ]).start();
    }
    prev.current = watch;
  }, [watch, scale]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}
