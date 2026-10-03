import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { CuteIcon } from '@/components/CuteIcon';
import { EmptyState } from '@/components/EmptyState';
import { useChoreRequestsStore } from '@/features/chores/requestsStore';
import { useActiveChild } from '@/features/child/store';
import { cuteIconKeyForEmoji } from '@/theme/cuteIcons';
import { ColorPalette, spacing, useTheme } from '@/theme';
import { formatJapaneseDate } from '@/utils/date';
import { goBack } from '@/utils/navigation';

const STATUS_LABEL: Record<string, string> = {
  pending: '申請中',
  approved: 'できた！',
  rejected: 'またこんど',
};

export default function ChoreHistoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const requests = useChoreRequestsStore((s) => s.requests);
  const pollRemote = useChoreRequestsStore((s) => s.pollRemote);

  useFocusEffect(
    useCallback(() => {
      if (child) pollRemote([child.id]);
    }, [child, pollRemote])
  );

  const sorted = useMemo(
    () => [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests]
  );

  const statusColor = (status: string) => {
    if (status === 'approved') return colors.primaryDark;
    if (status === 'rejected') return colors.textMuted;
    return colors.text;
  };

  return (
    <Screen>
      <HeaderBar title="申請りれき" onBack={goBack} />

      {sorted.length === 0 ? (
        <EmptyState icon="🧾" message="まだ申請したおてつだいはありません" />
      ) : (
        <View style={styles.list}>
          {sorted.map((request) => (
            <Card key={request.id} style={styles.row}>
              <CuteIcon
                iconKey={cuteIconKeyForEmoji(request.choreIcon)}
                size={28}
                fallback={<AppText style={styles.emoji}>{request.choreIcon}</AppText>}
              />
              <View style={styles.info}>
                <AppText variant="subtitle">{request.choreName}</AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  {formatJapaneseDate(new Date(request.createdAt))}
                </AppText>
              </View>
              <View style={styles.statusCol}>
                <AppText variant="caption" color={statusColor(request.status)}>
                  {STATUS_LABEL[request.status]}
                </AppText>
                {request.status === 'approved' ? (
                  <AppText variant="caption" color={colors.primaryDark}>
                    +{request.pointValue}pt
                  </AppText>
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
    },
    emoji: {
      fontSize: 24,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    statusCol: {
      alignItems: 'flex-end',
      gap: 2,
    },
  });
}
