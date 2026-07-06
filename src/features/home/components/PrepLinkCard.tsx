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
  active?: boolean;
  onPress: () => void;
};

export function PrepLinkCard({ title, icon, done, total, complete, tint, active, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      style={[styles.card, { backgroundColor: tint }, active ? styles.cardActive : null]}
      onPress={onPress}
    >
      {active ? (
        <View style={styles.activeBadge}>
          <AppText variant="caption" color={colors.white}>
            いまだよ！
          </AppText>
        </View>
      ) : null}
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
      borderWidth: 3,
      borderColor: 'transparent',
    },
    cardActive: {
      borderColor: colors.primaryDark,
    },
    activeBadge: {
      position: 'absolute',
      top: -10,
      alignSelf: 'center',
      backgroundColor: colors.primaryDark,
      borderRadius: radius.round,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
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
