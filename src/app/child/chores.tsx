import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { SectionHeader } from '@/components/SectionHeader';
import { StatBadge } from '@/components/StatBadge';
import { EmptyState } from '@/components/EmptyState';
import { ChoreCard } from '@/features/chores/components/ChoreCard';
import { ChoreDetailModal } from '@/features/chores/components/ChoreDetailModal';
import { ChoreCelebration } from '@/features/chores/components/ChoreCelebration';
import { useChoresStore } from '@/features/chores/store';
import { usePointsStore } from '@/features/points/store';
import { Chore } from '@/db/models';
import { colors, spacing } from '@/theme';

export default function ChoresScreen() {
  const allChores = useChoresStore((s) => s.chores);
  const chores = useMemo(() => allChores.filter((c) => c.isActive), [allChores]);
  const complete = useChoresStore((s) => s.complete);
  const totalPoints = usePointsStore((s) => s.total);
  const [selectedChore, setSelectedChore] = useState<Chore | null>(null);
  const [doneChore, setDoneChore] = useState<Chore | null>(null);

  const handleComplete = async (chore: Chore) => {
    await complete(chore);
    setDoneChore(chore);
  };

  return (
    <Screen>
      <HeaderBar title="おてつだい" onBack={() => router.back()} />

      <StatBadge icon="⭐" value={totalPoints} label="いまのポイント" color={colors.accent} />

      <View style={styles.section}>
        <SectionHeader title="おてつだいをする" icon="🧹" />
        {chores.length === 0 ? (
          <EmptyState icon="🧹" message="おてつだいがまだ登録されていません" />
        ) : (
          <View style={styles.list}>
            {chores.map((chore) => (
              <ChoreCard key={chore.id} chore={chore} onPress={() => setSelectedChore(chore)} />
            ))}
          </View>
        )}
      </View>

      <ChoreDetailModal
        visible={!!selectedChore}
        chore={selectedChore}
        onComplete={() => selectedChore && handleComplete(selectedChore)}
        onClose={() => setSelectedChore(null)}
      />

      <ChoreCelebration visible={!!doneChore} chore={doneChore} onClose={() => setDoneChore(null)} />
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
