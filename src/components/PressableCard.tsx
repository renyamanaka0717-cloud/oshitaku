import { PropsWithChildren, useMemo } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cardShadow, hairline, radius, useTheme, usePressLedge } from '@/theme';

type Props = PropsWithChildren<{
  onPress?: () => void;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  radius?: number;
}>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// A tappable card: soft floating shadow + a hairline edge that sinks and
// squishes slightly on press, so anything wrapped in this reads as
// "pressable" at a glance without a heavy outline.
export function PressableCard({ children, onPress, backgroundColor, style, disabled, radius: r }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(), []);
  const { pressIn, pressOut, translate, scale } = usePressLedge(3);

  const handlePress = () => {
    if (disabled || !onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ translateY: translate }, { scale }] }}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        style={[
          styles.base,
          {
            backgroundColor: backgroundColor ?? colors.surface,
            borderRadius: r ?? radius.lg,
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

function createStyles() {
  return StyleSheet.create({
    base: {
      borderWidth: hairline,
      borderColor: 'rgba(0,0,0,0.06)',
      ...cardShadow,
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
