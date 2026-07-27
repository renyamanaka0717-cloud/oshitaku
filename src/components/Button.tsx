import { useMemo } from 'react';
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
import { ColorPalette, outlineWidth, radius, spacing, useTheme, usePressLedge } from '@/theme';

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
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(), []);
  const v = useMemo(() => getVariantStyles(colors), [colors])[variant];
  const { pressIn, pressOut, translate, ledge, scale } = usePressLedge();

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress(e);
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

function createStyles() {
  return StyleSheet.create({
    base: {
      borderRadius: radius.round,
      borderWidth: outlineWidth,
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
