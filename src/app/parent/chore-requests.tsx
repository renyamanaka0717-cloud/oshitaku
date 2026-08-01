import { useCallback, useMemo, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { useChildStore } from '@/features/child/store';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { useChoreRequestsStore } from '@/features/chores/requestsStore';
import { ColorPalette, spacing, useTheme } from '@/theme';

const POLL_INTERVAL_MS = 7000;

export default function ChoreRequestsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const children = useChildStore((s) => s.children);
  const requests = useChoreRequestsStore((s) => s.requests);
  const pollRemote = useChoreRequestsStore((s) => s.pollRemote);
  const approve = useChoreRequestsStore((s) => s.approve);
  const reject = useChoreRequestsStore((s) => s.reject);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const childIds = useMemo(() => children.map((c) => c.id), [children]);

  useFocusEffect(
    useCallback(() => {
      if (childIds.length === 0) return;
      pollRemote(childIds);
      pollTimer.current = setInterval(() => pollRemote(childIds), POLL_INTERVAL_MS);
      return () => {
        if (pollTimer.current) clearInterval(pollTimer.current);
      };
    }, [childIds, pollRemote])
  );

  const pending = useMemo(
    () =>
      requests
        .filter((r) => r.status === 'pending')
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [requests]
  );

  const handleApprove = async (requestId: string) => {
    try {
      await approve(requestId);
    } catch {
      Alert.alert('承認できませんでした', 'ネットワークをかくにんしてもう一度お試しください');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await reject(requestId);
    } catch {
      Alert.alert('却下できませんでした', 'ネットワークをかくにんしてもう一度お試しください');
    }
  };

  return (
    <Screen>
      <HeaderBar title="おてつだい申請" onBack={() => router.back()} />

      {pending.length === 0 ? (
        <EmptyState icon="✅" message="承認待ちの申請はありません" />
      ) : (
        <View style={styles.list}>
          {pending.map((request) => {
            const child = children.find((c) => c.id === request.childId);
            return (
              <Card key={request.id} style={styles.card}>
                <View style={styles.row}>
                  {child ? (
                    <ChildAvatar
                      avatarImageUri={child.avatarImageUri}
                      avatarEmoji={child.avatarEmoji}
                      avatarColor={child.avatarColor}
                      size={40}
                    />
                  ) : null}
                  <View style={styles.info}>
                    <AppText variant="caption" color={colors.textMuted}>
                      {child?.name ?? ''}
                    </AppText>
                    <AppText variant="subtitle">
                      {request.choreIcon} {request.choreName}
                    </AppText>
                    <AppText variant="caption" color={colors.primaryDark}>
                      +{request.pointValue}pt
                    </AppText>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <Button
                    label="却下"
                    variant="ghost"
                    size="md"
                    onPress={() => handleReject(request.id)}
                    style={styles.actionButton}
                  />
                  <Button
                    label="承認する"
                    size="md"
                    onPress={() => handleApprove(request.id)}
                    style={styles.actionButton}
                  />
                </View>
              </Card>
            );
          })}
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
    card: {
      gap: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    actionRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
}
