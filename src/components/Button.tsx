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
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

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
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress(e);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={disabled}
        style={[
          styles.base,
          size === 'lg' ? styles.lg : styles.md,
          { backgroundColor: v.bg },
          disabled ? styles.disabled : null,
          style,
        ]}
      >
        {icon ? <AppText style={styles.icon}>{icon}</AppText> : null}
        <AppText variant="subtitle" color={v.text} style={textStyle}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

function createStyles() {
  return StyleSheet.create({
    base: {
      borderRadius: radius.round,
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
