import { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { SectionHeader } from '@/components/SectionHeader';
import { PointsBadge } from '@/components/PointsBadge';
import { EmptyState } from '@/components/EmptyState';
import { ChoreCard } from '@/features/chores/components/ChoreCard';
import { ChoreDetailModal } from '@/features/chores/components/ChoreDetailModal';
import { ChoreCelebration } from '@/features/chores/components/ChoreCelebration';
import { ChoreRequestSentModal } from '@/features/chores/components/ChoreRequestSentModal';
import { useChoresStore } from '@/features/chores/store';
import { useChoreRequestsStore } from '@/features/chores/requestsStore';
import { usePointsStore } from '@/features/points/store';
import { useActiveChild } from '@/features/child/store';
import { Chore } from '@/db/models';
import { spacing } from '@/theme';

const POLL_INTERVAL_MS = 8000;

export default function ChoresScreen() {
  const child = useActiveChild();
  const allChores = useChoresStore((s) => s.chores);
  const chores = useMemo(() => allChores.filter((c) => c.isActive), [allChores]);
  const totalPoints = usePointsStore((s) => s.total);

  const requests = useChoreRequestsStore((s) => s.requests);
  const requestChore = useChoreRequestsStore((s) => s.requestChore);
  const pollRemote = useChoreRequestsStore((s) => s.pollRemote);
  const justApproved = useChoreRequestsStore((s) => s.justApproved);
  const clearJustApproved = useChoreRequestsStore((s) => s.clearJustApproved);

  const pendingChoreIds = useMemo(
    () => new Set(requests.filter((r) => r.status === 'pending').map((r) => r.choreId)),
    [requests]
  );

  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [sentChoreName, setSentChoreName] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!child) return;
      pollRemote([child.id]);
      pollTimer.current = setInterval(() => pollRemote([child.id]), POLL_INTERVAL_MS);
      return () => {
        if (pollTimer.current) clearInterval(pollTimer.current);
      };
    }, [child, pollRemote])
  );

  const handleRequest = async (chore: Chore) => {
    await requestChore(chore);
    setSentChoreName(chore.name);
  };

  return (
    <Screen>
      <HeaderBar title="おてつだい" onBack={() => router.back()} />

      <PointsBadge points={totalPoints} label="いまのポイント" />

      <View style={styles.section}>
        <SectionHeader title="おてつだいをする" icon="🧹" />
        {chores.length === 0 ? (
          <EmptyState icon="🧹" message="おてつだいがまだ登録されていません" />
        ) : (
          <View style={styles.list}>
            {chores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                pending={pendingChoreIds.has(chore.id)}
                onPress={() => setSelectedChore(chore)}
              />
            ))}
          </View>
        )}
      </View>

      <ChoreDetailModal
        visible={!!selectedChore}
        chore={selectedChore}
        onComplete={() => selectedChore && handleRequest(selectedChore)}
        onClose={() => setSelectedChore(null)}
      />

      <ChoreRequestSentModal
        visible={!!sentChoreName}
        choreName={sentChoreName}
        onClose={() => setSentChoreName(null)}
      />

      <ChoreCelebration
        visible={!!justApproved}
        chore={
          justApproved
            ? { icon: justApproved.choreIcon, name: justApproved.choreName, pointValue: justApproved.pointValue }
            : null
        }
        onClose={clearJustApproved}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
});
