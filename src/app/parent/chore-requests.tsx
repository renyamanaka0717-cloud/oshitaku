import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CuteIcon } from '@/components/CuteIcon';
import { EmptyState } from '@/components/EmptyState';
import { useChildStore } from '@/features/child/store';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { useChoreRequestsStore } from '@/features/chores/requestsStore';
import { cuteIconKeyForEmoji } from '@/theme/cuteIcons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { goBack } from '@/utils/navigation';

const POLL_INTERVAL_MS = 7000;

function formatRequestDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm}`;
}

export default function ChoreRequestsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const children = useChildStore((s) => s.children);
  const requests = useChoreRequestsStore((s) => s.requests);
  const loadRequests = useChoreRequestsStore((s) => s.load);
  const pollRemote = useChoreRequestsStore((s) => s.pollRemote);
  const approve = useChoreRequestsStore((s) => s.approve);
  const reject = useChoreRequestsStore((s) => s.reject);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const childIds = useMemo(() => children.map((c) => c.id), [children]);

  useFocusEffect(
    useCallback(() => {
      if (childIds.length === 0) return;
      for (const id of childIds) loadRequests(id);
      pollRemote(childIds);
      pollTimer.current = setInterval(() => pollRemote(childIds), POLL_INTERVAL_MS);
      return () => {
        if (pollTimer.current) clearInterval(pollTimer.current);
      };
    }, [childIds, loadRequests, pollRemote])
  );

  const pending = useMemo(
    () =>
      requests
        .filter((r) => r.status === 'pending')
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [requests]
  );

  const pendingIds = useMemo(() => new Set(pending.map((r) => r.id)), [pending]);
  const selected = useMemo(
    () => Array.from(selectedIds).filter((id) => pendingIds.has(id)),
    [selectedIds, pendingIds]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allSelected = pending.length > 0 && selected.length === pending.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(pending.map((r) => r.id)));
  };

  const handleBulkApprove = async () => {
    try {
      for (const id of selected) await approve(id);
      setSelectedIds(new Set());
    } catch {
      Alert.alert('承認できませんでした', 'ネットワークをかくにんしてもう一度お試しください');
    }
  };

  const handleBulkReject = async () => {
    try {
      for (const id of selected) await reject(id);
      setSelectedIds(new Set());
    } catch {
      Alert.alert('却下できませんでした', 'ネットワークをかくにんしてもう一度お試しください');
    }
  };

  return (
    <Screen scroll={false} contentStyle={styles.screenContent}>
      <HeaderBar title="おてつだい申請" onBack={goBack} />

      {pending.length === 0 ? (
        <EmptyState icon="✅" message="承認待ちの申請はありません" />
      ) : (
        <>
          <Pressable style={styles.selectAllRow} onPress={toggleSelectAll}>
            <View style={[styles.checkbox, allSelected ? styles.checkboxChecked : null]}>
              {allSelected ? (
                <AppText color={colors.white} style={styles.checkmark}>
                  ✓
                </AppText>
              ) : null}
            </View>
            <AppText variant="caption" color={colors.textMuted}>
              すべて選択
            </AppText>
          </Pressable>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.list}>
              {pending.map((request) => {
                const child = children.find((c) => c.id === request.childId);
                const checked = selectedIds.has(request.id);
                return (
                  <Pressable key={request.id} onPress={() => toggleSelect(request.id)}>
                    <Card style={[styles.card, checked ? styles.cardSelected : null]}>
                      <View style={[styles.checkbox, checked ? styles.checkboxChecked : null]}>
                        {checked ? (
                          <AppText color={colors.white} style={styles.checkmark}>
                            ✓
                          </AppText>
                        ) : null}
                      </View>
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
                        <View style={styles.choreLine}>
                          <CuteIcon
                            iconKey={cuteIconKeyForEmoji(request.choreIcon)}
                            size={18}
                            fallback={<AppText style={styles.choreEmoji}>{request.choreIcon}</AppText>}
                          />
                          <AppText variant="subtitle">{request.choreName}</AppText>
                        </View>
                        <AppText variant="caption" color={colors.textMuted}>
                          {formatRequestDateTime(request.createdAt)}
                        </AppText>
                      </View>
                      <AppText variant="subtitle" color={colors.primaryDark}>
                        +{request.pointValue}pt
                      </AppText>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actionBar}>
            <AppText variant="caption" color={colors.textMuted}>
              {selected.length}件選択中
            </AppText>
            <View style={styles.actionButtons}>
              <View style={styles.actionButtonWrap}>
                <Button label="却下" variant="ghost" size="md" onPress={handleBulkReject} disabled={selected.length === 0} />
              </View>
              <View style={styles.actionButtonWrap}>
                <Button label="承認する" size="md" onPress={handleBulkApprove} disabled={selected.length === 0} />
              </View>
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screenContent: {
      flex: 1,
      gap: spacing.md,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.md,
    },
    list: {
      gap: spacing.sm,
    },
    selectAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmark: {
      fontSize: 14,
      fontWeight: '700',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    cardSelected: {
      backgroundColor: colors.surfaceAlt,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    choreLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    choreEmoji: {
      fontSize: 18,
    },
    actionBar: {
      gap: spacing.sm,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButtonWrap: {
      flex: 1,
    },
  });
}
