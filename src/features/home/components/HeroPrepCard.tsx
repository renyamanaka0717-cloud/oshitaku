import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { PressableCard } from '@/components/PressableCard';
import { Icon, IconName } from '@/theme/icons';
import { ColorPalette, radius, smallShadow, spacing, useTheme } from '@/theme';

type PreviewTask = { id: string; icon: string; label: string };

type Props = {
  mode: 'morning' | 'evening';
  tasks: PreviewTask[];
  checked: Record<string, boolean>;
  isSuggested: boolean;
  onPress: () => void;
};

const PREVIEW_LIMIT = 4;

const MODE_CONTENT: Record<'morning' | 'evening', { icon: IconName; title: string }> = {
  morning: { icon: 'sun', title: '朝のおしたく' },
  evening: { icon: 'moon', title: '夜のおしたく' },
};

// Soft top-to-bottom gradient per mode, a shade lighter at the top so the
// hero card reads as a gently lit surface instead of a flat color block.
const MODE_GRADIENT: Record<'morning' | 'evening', [string, string]> = {
  morning: ['#FFE68A', '#FFD84D'],
  evening: ['#DDD1FF', '#C9B8FF'],
};

export function HeroPrepCard({ mode, tasks, checked, isSuggested, onPress }: Props) {
  const { colors } = useTheme();
  const gradient = MODE_GRADIENT[mode];
  const ctaColor = mode === 'morning' ? colors.primaryDark : colors.purpleDark;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { icon, title } = MODE_CONTENT[mode];

  const doneCount = tasks.filter((t) => checked[t.id]).length;
  const total = tasks.length;
  const remaining = Math.max(0, total - doneCount);
  const complete = total > 0 && doneCount === total;
  const ctaLabel = complete ? `${title}を みてみる ›` : doneCount > 0 ? `${title}の つづきから ›` : `${title}を はじめる！ ›`;
  const previewTasks = tasks.slice(0, PREVIEW_LIMIT);
  const overflowCount = tasks.length - previewTasks.length;

  return (
    <View style={styles.wrap}>
      {isSuggested ? (
        <View style={styles.suggestedWrap}>
          <View style={styles.suggestedBubble}>
            <AppText variant="caption" color={colors.text}>
              いまは
            </AppText>
          </View>
        </View>
      ) : null}

      <PressableCard backgroundColor="transparent" onPress={onPress} style={styles.card}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}
        />

        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Icon name={icon} size={36} />
          </View>
          <AppText variant="title" color={colors.text} style={styles.titleText}>
            {title}
          </AppText>
          <View style={styles.remainingChip}>
            <AppText variant="caption" color={colors.text}>
              あと{remaining}こ
            </AppText>
          </View>
        </View>

        {total > 0 ? (
          <View style={styles.progressRow}>
            <View style={styles.dotsRow}>
              {tasks.map((t) => (
                <View key={t.id} style={[styles.dot, checked[t.id] ? styles.dotDone : null]} />
              ))}
            </View>
            <AppText variant="caption" color={colors.text}>
              {doneCount}/{total} できた
            </AppText>
          </View>
        ) : null}

        {total > 0 ? (
          <View style={styles.previewRow}>
            {previewTasks.map((task) => (
              <View
                key={task.id}
                style={[styles.previewItem, checked[task.id] ? styles.previewItemDone : null]}
              >
                <AppText style={styles.previewIcon}>{task.icon}</AppText>
                <AppText variant="caption" color={colors.text} numberOfLines={1} style={styles.previewLabel}>
                  {task.label}
                </AppText>
                {checked[task.id] ? (
                  <View style={styles.previewCheck}>
                    <AppText style={styles.previewCheckMark}>✓</AppText>
                  </View>
                ) : null}
              </View>
            ))}
            {overflowCount > 0 ? (
              <View style={styles.previewItem}>
                <AppText variant="subtitle" color={colors.text}>
                  +{overflowCount}
                </AppText>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.ctaWrap}>
          <Button label={ctaLabel} size="lg" onPress={onPress} color={ctaColor} />
        </View>
      </PressableCard>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    wrap: {
      position: 'relative',
    },
    suggestedWrap: {
      position: 'absolute',
      top: -12,
      left: spacing.lg,
      zIndex: 2,
    },
    suggestedBubble: {
      backgroundColor: colors.surface,
      borderRadius: radius.round,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
      ...smallShadow,
    },
    card: {
      padding: spacing.lg,
      gap: spacing.md,
      overflow: 'hidden',
      borderRadius: radius.xl,
    },
    gradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconBadge: {
      width: 56,
      height: 56,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.75)',
      alignItems: 'center',
      justifyContent: 'center',
      ...smallShadow,
    },
    titleText: {
      flex: 1,
    },
    remainingChip: {
      backgroundColor: 'rgba(255,255,255,0.85)',
      borderRadius: radius.round,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dotsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    dot: {
      width: 16,
      height: 16,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.7)',
    },
    dotDone: {
      backgroundColor: colors.accentPink,
    },
    previewRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    previewItem: {
      flex: 1,
      height: 76,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      padding: 4,
      ...smallShadow,
    },
    previewItemDone: {
      opacity: 0.55,
    },
    previewIcon: {
      fontSize: 28,
    },
    previewLabel: {
      fontSize: 10,
      textAlign: 'center',
    },
    previewCheck: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: 999,
      backgroundColor: colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewCheckMark: {
      fontSize: 12,
      color: colors.white,
      fontWeight: '900',
    },
    ctaWrap: {
      alignSelf: 'stretch',
    },
  });
}
