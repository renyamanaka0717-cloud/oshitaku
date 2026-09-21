import { useRef } from 'react';
import { Animated } from 'react-native';
import { buttonDepth } from './pop';

// Shared "puffy" press interaction: the element sinks down and squishes
// slightly on press, then springs back on release. Used by Button,
// PressableCard, and NavIconLink so every tappable surface in the app
// feels the same.
export function usePressLedge(depth: number = buttonDepth) {
  const press = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver: false }).start();
  };
  const pressOut = () => {
    Animated.spring(press, { toValue: 0, useNativeDriver: false, friction: 5, tension: 220 }).start();
  };

  const translate = press.interpolate({ inputRange: [0, 1], outputRange: [0, depth] });
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

  return { press, pressIn, pressOut, translate, scale };
}
