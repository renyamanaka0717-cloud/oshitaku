import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { useActiveChild } from '@/features/child/store';
import { pointHistoryRepository } from '@/db/repositories';
import { PointHistory } from '@/db/models';
import { ColorPalette, spacing, useTheme } from '@/theme';

const HISTORY_LIMIT = 200;

export default function RewardHistoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const [history, setHistory] = useState<PointHistory[]>([]);

  useEffect(() => {
    if (!child) return;
    pointHistoryRepository.listPointHistory(child.id, HISTORY_LIMIT).then(setHistory);
  }, [child]);

  const exchanges = useMemo(() => history.filter((h) => h.type === 'reward_exchange'), [history]);

  return (
    <Screen>
      <HeaderBar title="こうかんりれき" onBack={() => router.back()} />

      {exchanges.length === 0 ? (
        <EmptyState icon="🧾" message="まだこうかんしたごほうびはありません" />
      ) : (
        <View style={styles.list}>
          {exchanges.map((item) => (
            <Card key={item.id} style={styles.row}>
              <View style={styles.info}>
                <AppText variant="subtitle">{item.note}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {formatDateLabel(item.date)}
                </AppText>
              </View>
              <AppText variant="subtitle" color={colors.danger}>
                {item.amount}pt
              </AppText>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    info: {
      gap: 2,
    },
  });
}
