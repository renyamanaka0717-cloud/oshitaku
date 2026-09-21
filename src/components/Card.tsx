import { PropsWithChildren, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ColorPalette, cardShadow, hairline, radius, spacing, useTheme } from '@/theme';

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  tint?: string;
}>;

export function Card({ children, style, tint }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.card, tint ? { backgroundColor: tint } : null, style]}>{children}</View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: hairline,
      borderColor: 'rgba(0,0,0,0.06)',
      ...cardShadow,
    },
  });
}
