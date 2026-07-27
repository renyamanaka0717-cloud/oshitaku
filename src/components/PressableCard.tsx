import { PropsWithChildren, useMemo } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ColorPalette, outlineWidth, radius, useTheme, usePressLedge } from '@/theme';

type Props = PropsWithChildren<{
  onPress?: () => void;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  radius?: number;
}>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// A tappable card: bold outline + hard shadow ledge that flattens and
// squishes on press, so anything wrapped in this reads as "pressable"
// at a glance, distinct from static info cards.
export function PressableCard({ children, onPress, backgroundColor, style, disabled, radius: r }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { pressIn, pressOut, translate, ledge, scale } = usePressLedge();

  const handlePress = () => {
    if (disabled || !onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ translateX: translate }, { translateY: translate }, { scale }] }}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        style={[
          styles.base,
          {
            backgroundColor: backgroundColor ?? colors.surface,
            borderColor: colors.black,
            borderRadius: r ?? radius.lg,
            borderBottomWidth: ledge,
            borderRightWidth: ledge,
          },
          disabled ? styles.disabled : null,
          style,
        ]}
      >
        {children}
      </AnimatedPressable>
    </Animated.View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    base: {
      borderWidth: outlineWidth,
      borderColor: colors.black,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
