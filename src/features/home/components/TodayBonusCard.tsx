import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { ColorPalette, spacing, useTheme } from '@/theme';

type Props = {
  bonusPoints: number;
};

export function TodayBonusCard({ bonusPoints }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (bonusPoints <= 0) {
    return (
      <Card style={styles.card}>
        <AppText style={styles.icon}>🎉</AppText>
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
    <Card style={styles.card}>
      <AppText style={styles.icon}>✨</AppText>
      <View style={styles.textCol}>
        <AppText variant="subtitle">今日のボーナス</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          あと{bonusPoints}ポイントもらえるよ！
        </AppText>
      </View>
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    icon: {
      fontSize: 32,
    },
    textCol: {
      flex: 1,
    },
  });
}
