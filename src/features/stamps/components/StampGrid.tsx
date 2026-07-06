import { StyleSheet, View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { StampCard } from '@/components/StampCard';
import { Stamp } from '@/db/models';
import { STAMP_EMOJI } from '@/features/stamps/store';
import { spacing } from '@/theme';

type Props = {
  stamps: Stamp[];
};

export function StampGrid({ stamps }: Props) {
  if (stamps.length === 0) {
    return <EmptyState icon="📔" message="まだスタンプがありません。おしたくをがんばろう！" />;
  }

  return (
    <View style={styles.grid}>
      {stamps.map((stamp) => (
        <StampCard key={stamp.id} emoji={STAMP_EMOJI[stamp.stampType] ?? '⭐'} rare={stamp.kind === 'rare'} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
