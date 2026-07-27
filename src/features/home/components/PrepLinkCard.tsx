import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { PressableCard } from '@/components/PressableCard';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  title: string;
  icon: string | React.ReactNode;
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
    <View style={styles.wrap}>
      {active ? (
        <View style={styles.activeBadge}>
          <View style={styles.activeChip}>
            <AppText variant="caption" color={colors.white}>
              いまだよ！
            </AppText>
          </View>
        </View>
      ) : null}
      <PressableCard backgroundColor={tint} onPress={onPress} style={styles.card}>
        <View style={styles.iconBadge}>
          {typeof icon === 'string' ? <AppText style={styles.iconText}>{icon}</AppText> : icon}
        </View>
        <View style={styles.textCol}>
          <AppText variant="subtitle" color={colors.black}>
            {title}
          </AppText>
          <AppText variant="caption" color={colors.black}>
            {complete ? 'できた！✨' : `${done}/${total} できた`}
          </AppText>
        </View>
        {complete ? <AppText style={styles.check}>✓</AppText> : null}
      </PressableCard>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
    },
    card: {
      padding: spacing.md,
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 148,
      justifyContent: 'center',
    },
    activeBadge: {
      position: 'absolute',
      top: -14,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 2,
    },
    activeChip: {
      backgroundColor: colors.primaryDark,
      borderRadius: radius.round,
      borderWidth: 2,
      borderColor: colors.black,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    iconBadge: {
      width: 64,
      height: 64,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.55)',
      borderWidth: 2,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 44,
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
