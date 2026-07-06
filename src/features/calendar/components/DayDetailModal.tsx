import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { DayCompletion, Stamp } from '@/db/models';
import { STAMP_EMOJI } from '@/features/stamps/store';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { formatTime } from '@/utils/date';

type Props = {
  visible: boolean;
  dateKey: string | null;
  completion: DayCompletion | undefined;
  stamps: Stamp[];
  points: number;
  onClose: () => void;
};

export function DayDetailModal({ visible, dateKey, completion, stamps, points, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!dateKey) return null;
  const [, m, d] = dateKey.split('-');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="title" style={styles.title}>
            {Number(m)}月{Number(d)}日
          </AppText>

          {!completion ? (
            <EmptyState icon="🌤️" message="この日はまだ記録がありません" />
          ) : (
            <View style={styles.body}>
              {completion.morningCompleted && completion.eveningCompleted ? (
                <View style={styles.perfectBanner}>
                  <AppText variant="subtitle" color={colors.white} style={styles.center}>
                    ✨ パーフェクトな一日！
                  </AppText>
                </View>
              ) : null}
              <View style={styles.row}>
                <AppText style={styles.icon}>☀️</AppText>
                <AppText variant="body" style={styles.label}>
                  朝のおしたく
                </AppText>
                <AppText variant="caption" color={completion.morningCompleted ? colors.success : colors.textMuted}>
                  {completion.morningCompleted
                    ? `完了 ${completion.morningCompletedAt ? formatTime(completion.morningCompletedAt) : ''}`
                    : '未完了'}
                </AppText>
              </View>
              <View style={styles.row}>
                <AppText style={styles.icon}>🌙</AppText>
                <AppText variant="body" style={styles.label}>
                  夜のおしたく
                </AppText>
                <AppText variant="caption" color={completion.eveningCompleted ? colors.success : colors.textMuted}>
                  {completion.eveningCompleted
                    ? `完了 ${completion.eveningCompletedAt ? formatTime(completion.eveningCompletedAt) : ''}`
                    : '未完了'}
                </AppText>
              </View>
              <View style={styles.row}>
                <AppText style={styles.icon}>⭐</AppText>
                <AppText variant="body" style={styles.label}>
                  獲得ポイント
                </AppText>
                <AppText variant="subtitle" color={colors.primaryDark}>
                  +{points}
                </AppText>
              </View>
              <View style={styles.stampRow}>
                <AppText style={styles.icon}>🏅</AppText>
                <AppText variant="body" style={styles.label}>
                  獲得スタンプ
                </AppText>
                <View style={styles.stampList}>
                  {stamps.length === 0 ? (
                    <AppText variant="caption" color={colors.textMuted}>
                      なし
                    </AppText>
                  ) : (
                    stamps.map((s) => (
                      <AppText key={s.id} style={styles.stampEmoji}>
                        {STAMP_EMOJI[s.stampType] ?? '⭐'}
                      </AppText>
                    ))
                  )}
                </View>
              </View>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
    },
    title: {
      textAlign: 'center',
    },
    body: {
      gap: spacing.md,
    },
    perfectBanner: {
      backgroundColor: colors.purple,
      borderRadius: radius.lg,
      paddingVertical: spacing.sm,
    },
    center: {
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    stampRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    icon: {
      fontSize: 22,
    },
    label: {
      flex: 1,
    },
    stampList: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    stampEmoji: {
      fontSize: 22,
    },
  });
}
