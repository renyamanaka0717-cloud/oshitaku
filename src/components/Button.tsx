import { useMemo } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { ColorPalette, buttonDepth, darken, radius, spacing, useTheme, usePressLedge } from '@/theme';

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
  // Overrides the variant's own fill color (e.g. a mode-specific CTA
  // tint) while still deriving a matching darker "puffy" base layer.
  color?: string;
};

function getVariantStyles(colors: ColorPalette): Record<Variant, { bg: string; text: string }> {
  return {
    primary: { bg: colors.primary, text: colors.textOnPrimary },
    secondary: { bg: colors.secondary, text: colors.textOnPrimary },
    ghost: { bg: colors.surfaceAlt, text: colors.text },
    danger: { bg: colors.danger, text: colors.textOnPrimary },
  };
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  textStyle,
  icon,
  color,
}: Props) {
  const { colors } = useTheme();
  const v = useMemo(() => getVariantStyles(colors), [colors])[variant];
  const bg = color ?? v.bg;
  const styles = useMemo(() => createStyles(bg), [bg]);
  const { pressIn, pressOut, translate, scale } = usePressLedge();

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress(e);
  };

  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.depthLayer, disabled ? styles.disabled : null]} />
      <Animated.View style={{ transform: [{ translateY: translate }, { scale }] }}>
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          disabled={disabled}
          style={[styles.base, size === 'lg' ? styles.lg : styles.md, disabled ? styles.disabled : null]}
        >
          {icon ? <AppText style={styles.icon}>{icon}</AppText> : null}
          <AppText variant="subtitle" color={v.text} style={textStyle}>
            {label}
          </AppText>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

function createStyles(bg: string) {
  return StyleSheet.create({
    wrap: {
      position: 'relative',
    },
    base: {
      borderRadius: radius.round,
      backgroundColor: bg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      overflow: 'hidden',
    },
    depthLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: buttonDepth,
      height: '100%',
      borderRadius: radius.round,
      backgroundColor: darken(bg, 0.2),
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
