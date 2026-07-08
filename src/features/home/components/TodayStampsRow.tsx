import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { StampCard } from '@/components/StampCard';
import { EmptyState } from '@/components/EmptyState';
import { Stamp } from '@/db/models';
import { STAMP_EMOJI } from '@/features/stamps/store';
import { spacing } from '@/theme';

type Props = {
  stamps: Stamp[];
};

export function TodayStampsRow({ stamps }: Props) {
  return (
    <Card>
      <SectionHeader title="今日のスタンプ" icon="🏅" />
      {stamps.length === 0 ? (
        <EmptyState message="おしたくをがんばってスタンプをゲットしよう" />
      ) : (
        <View style={styles.row}>
          {stamps.map((stamp) => (
            <StampCard key={stamp.id} emoji={STAMP_EMOJI[stamp.stampType] ?? '⭐'} rare={stamp.kind === 'rare'} size={48} />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
