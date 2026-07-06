import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

type Props = PropsWithChildren<{
  style?: ViewStyle;
  tint?: string;
}>;

export function Card({ children, style, tint }: Props) {
  return (
    <View style={[styles.card, tint ? { backgroundColor: tint } : null, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#D9A066',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
});
