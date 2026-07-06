import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SectionHeader } from './SectionHeader';
import { spacing } from '@/theme';

type Props = PropsWithChildren<{
  title: string;
  icon?: string;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}>;

export function Section({ title, icon, right, style, children }: Props) {
  return (
    <View style={[styles.section, style]}>
      <SectionHeader title={title} icon={icon} right={right} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
});
