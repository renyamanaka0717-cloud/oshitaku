import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Icon } from '@/theme/icons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export type BonusBreakdownItem = {
  label: string;
  points: number;
};

type Props = {
  bonusPoints: number;
  breakdown: BonusBreakdownItem[];
};

export function TodayBonusCard({ bonusPoints, breakdown }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [detailVisible, setDetailVisible] = useState(false);

  if (bonusPoints <= 0) {
    return (
      <Card style={styles.card}>
        <Icon name="party" size={32} />
        <View style={styles.textCol}>
          <AppText variant="subtitle">今日のボーナス達成！</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            今日もらえるポイントは全部ゲットしたよ
          </AppText>
        </View>
      </Card>
    );
  }

  return (
    <>
      <Pressable onPress={() => setDetailVisible(true)}>
        <Card style={styles.card}>
          <Icon name="sparkles" size={32} />
          <View style={styles.textCol}>
            <AppText variant="subtitle">今日のボーナス</AppText>
            <AppText variant="caption" color={colors.textMuted}>
              あと{bonusPoints}ポイントもらえるよ！
            </AppText>
          </View>
          <AppText style={styles.chevron} color={colors.textMuted}>
            ›
          </AppText>
        </Card>
      </Pressable>

      <Modal visible={detailVisible} transparent animationType="fade" onRequestClose={() => setDetailVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setDetailVisible(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <AppText variant="subtitle" style={styles.title}>
              今日のボーナス
            </AppText>
            <View style={styles.list}>
              {breakdown.map((item, index) => (
                <View key={index} style={styles.row}>
                  <AppText variant="body" style={styles.rowLabel}>
                    {item.label}
                  </AppText>
                  <AppText variant="subtitle" color={colors.primaryDark}>
                    +{item.points}pt
                  </AppText>
                </View>
              ))}
            </View>
            <Button label="わかった！" onPress={() => setDetailVisible(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    textCol: {
      flex: 1,
    },
    chevron: {
      fontSize: 24,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    sheet: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
    },
    title: {
      textAlign: 'center',
    },
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    rowLabel: {
      flex: 1,
    },
  });
}
