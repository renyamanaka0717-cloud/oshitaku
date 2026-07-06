import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  title: string;
  icon: string;
  done: number;
  total: number;
  complete: boolean;
  tint: string;
  onPress: () => void;
};

export function PrepLinkCard({ title, icon, done, total, complete, tint, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable style={[styles.card, { backgroundColor: tint }]} onPress={onPress}>
      <AppText style={styles.icon}>{icon}</AppText>
      <View style={styles.textCol}>
        <AppText variant="subtitle" color={colors.black}>
          {title}
        </AppText>
        <AppText variant="caption" color={colors.black}>
          {complete ? 'できた！✨' : `${done}/${total} できた`}
        </AppText>
      </View>
      {complete ? <AppText style={styles.check}>✓</AppText> : null}
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flex: 1,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.xs,
      minHeight: 120,
      justifyContent: 'center',
    },
    icon: {
      fontSize: 36,
    },
    textCol: {
      alignItems: 'center',
    },
    check: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      fontSize: 20,
      color: colors.success,
      fontWeight: '900',
    },
  });
}
