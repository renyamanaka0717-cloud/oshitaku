import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { mutedVariants, typography, useTheme } from '@/theme';

type Variant = keyof typeof typography;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function AppText({ variant = 'body', color, style, ...props }: Props) {
  const { colors } = useTheme();
  const base = typography[variant];
  const defaultColor = mutedVariants.has(variant) ? colors.textMuted : colors.text;
  return <Text {...props} style={[base, { color: color ?? defaultColor }, style]} />;
}
