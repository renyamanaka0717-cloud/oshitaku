import { useRef } from 'react';
import { Animated } from 'react-native';
import { hardShadow, outlineWidth } from './pop';

// Shared "pressable sticker" interaction: the element sinks into its own
// hard shadow and squishes slightly, then springs back on release. Used
// by Button and PressableCard so every tappable surface in the app feels
// the same.
export function usePressLedge(baseBorder: number = outlineWidth, ledgeExtra: number = hardShadow.offset) {
  const press = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver: false }).start();
  };
  const pressOut = () => {
    Animated.spring(press, { toValue: 0, useNativeDriver: false, friction: 5, tension: 220 }).start();
  };

  const translate = press.interpolate({ inputRange: [0, 1], outputRange: [0, hardShadow.offset] });
  const ledge = press.interpolate({ inputRange: [0, 1], outputRange: [baseBorder + ledgeExtra, baseBorder] });
  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });

  return { press, pressIn, pressOut, translate, ledge, scale };
}
