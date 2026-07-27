import { useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { ColorPalette, hardShadow, outlineWidth, radius, spacing, useTheme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

type Props = {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: string;
};

function getVariantStyles(colors: ColorPalette): Record<Variant, { bg: string; text: string }> {
  return {
    primary: { bg: colors.primary, text: colors.textOnPrimary },
    secondary: { bg: colors.secondary, text: colors.textOnPrimary },
    ghost: { bg: colors.surfaceAlt, text: colors.text },
    danger: { bg: colors.danger, text: colors.textOnPrimary },
  };
}

// Buttons get a thick bottom/right ink border standing in for a hard
// (non-blurred) drop shadow — a chunky "sticker" ledge rather than a
// soft platform shadow. Pressing flattens that ledge and nudges the
// button down into it, like a real button being pushed.
const BASE_BORDER = outlineWidth;
const LEDGE = outlineWidth + hardShadow.offset;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  textStyle,
  icon,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(), []);
  const v = useMemo(() => getVariantStyles(colors), [colors])[variant];
  const press = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.timing(press, { toValue: 1, duration: 80, useNativeDriver: false }).start();
  };
  const pressOut = () => {
    Animated.timing(press, { toValue: 0, duration: 120, useNativeDriver: false }).start();
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress(e);
  };

  const translate = press.interpolate({ inputRange: [0, 1], outputRange: [0, hardShadow.offset] });
  const ledge = press.interpolate({ inputRange: [0, 1], outputRange: [LEDGE, BASE_BORDER] });

  return (
    <Animated.View style={{ transform: [{ translateX: translate }, { translateY: translate }] }}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        style={[
          styles.base,
          size === 'lg' ? styles.lg : styles.md,
          {
            backgroundColor: v.bg,
            borderColor: colors.black,
            borderBottomWidth: ledge,
            borderRightWidth: ledge,
          },
          disabled ? styles.disabled : null,
          style,
        ]}
      >
        {icon ? <AppText style={styles.icon}>{icon}</AppText> : null}
        <AppText variant="subtitle" color={v.text} style={textStyle}>
          {label}
        </AppText>
      </AnimatedPressable>
    </Animated.View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function createStyles() {
  return StyleSheet.create({
    base: {
      borderRadius: radius.round,
      borderWidth: BASE_BORDER,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    md: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    lg: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
    },
    disabled: {
      opacity: 0.5,
    },
    icon: {
      fontSize: 20,
    },
  });
}
