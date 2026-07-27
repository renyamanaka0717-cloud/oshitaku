import { PropsWithChildren, useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

type Props = PropsWithChildren<{
  delay?: number;
  style?: StyleProp<ViewStyle>;
}>;

// Lets a section drift up and fade in on mount, so the screen feels
// alive instead of popping in all at once. Kept subtle on purpose.
export function FadeInUp({ children, delay = 0, style }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    }).start();
  }, [progress, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
