import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { PressableCard } from '@/components/PressableCard';
import { Icon, IconName } from '@/theme/icons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type PreviewTask = { id: string; icon: string; label: string };

type Props = {
  mode: 'morning' | 'evening';
  tasks: PreviewTask[];
  checked: Record<string, boolean>;
  isSuggested: boolean;
  onPress: () => void;
};

const PREVIEW_LIMIT = 6;

const MODE_CONTENT: Record<'morning' | 'evening', { icon: IconName; title: string }> = {
  morning: { icon: 'sun', title: '朝のおしたく' },
  evening: { icon: 'moon', title: '夜のおしたく' },
};

export function HeroPrepCard({ mode, tasks, checked, isSuggested, onPress }: Props) {
  const { colors } = useTheme();
  const tint = mode === 'morning' ? colors.yellow : colors.purple;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { icon, title } = MODE_CONTENT[mode];

  const doneCount = tasks.filter((t) => checked[t.id]).length;
  const total = tasks.length;
  const remaining = Math.max(0, total - doneCount);
  const complete = total > 0 && doneCount === total;
  const ctaLabel = complete ? 'みてみる' : doneCount > 0 ? 'つづきから' : 'はじめる';
  const previewTasks = tasks.slice(0, PREVIEW_LIMIT);
  const overflowCount = tasks.length - previewTasks.length;

  return (
    <PressableCard backgroundColor={tint} onPress={onPress} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBadge}>
          <Icon name={icon} size={40} />
        </View>
        <View style={styles.headerText}>
          <AppText variant="title" color={colors.black}>
            {title}
          </AppText>
          <AppText variant="caption" color={colors.black}>
            {complete ? 'ぜんぶできたよ！✨' : `のこり ${remaining}こ`}
          </AppText>
        </View>
        {isSuggested ? (
          <View style={styles.suggestedBadge}>
            <AppText variant="caption" color={colors.white}>
              いまだよ！
            </AppText>
          </View>
        ) : null}
      </View>

      {total > 0 ? (
        <View style={styles.previewRow}>
          {previewTasks.map((task) => (
            <View
              key={task.id}
              style={[styles.previewItem, checked[task.id] ? styles.previewItemDone : null]}
            >
              <AppText style={styles.previewIcon}>{task.icon}</AppText>
              {checked[task.id] ? (
                <View style={styles.previewCheck}>
                  <AppText style={styles.previewCheckMark}>✓</AppText>
                </View>
              ) : null}
            </View>
          ))}
          {overflowCount > 0 ? (
            <View style={styles.previewItem}>
              <AppText variant="caption" color={colors.black}>
                +{overflowCount}
              </AppText>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.ctaWrap}>
        <Button label={ctaLabel} size="lg" onPress={onPress} />
      </View>
    </PressableCard>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      padding: spacing.lg,
      gap: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
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
    headerText: {
      flex: 1,
      gap: 2,
    },
    suggestedBadge: {
      backgroundColor: colors.primaryDark,
      borderRadius: radius.round,
      borderWidth: 2,
      borderColor: colors.black,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    previewRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    previewItem: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: 'rgba(255,255,255,0.55)',
      borderWidth: 2,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewItemDone: {
      opacity: 0.5,
    },
    previewIcon: {
      fontSize: 18,
    },
    previewCheck: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 18,
      height: 18,
      borderRadius: 999,
      backgroundColor: colors.success,
      borderWidth: 1.5,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    previewCheckMark: {
      fontSize: 11,
      color: colors.white,
      fontWeight: '900',
    },
    ctaWrap: {
      alignSelf: 'stretch',
    },
  });
}
