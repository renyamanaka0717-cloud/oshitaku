import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Stamp } from '@/db/models';
import { STAMP_EMOJI } from '@/features/stamps/store';
import { colors, radius, spacing } from '@/theme';

type Props = {
  stamps: Stamp[];
};

export function StampGrid({ stamps }: Props) {
  if (stamps.length === 0) {
    return (
      <AppText variant="body" color={colors.textMuted}>
        まだスタンプがありません。おしたくをがんばろう！
      </AppText>
    );
  }

  return (
    <View style={styles.grid}>
      {stamps.map((stamp) => (
        <View
          key={stamp.id}
          style={[styles.stamp, stamp.kind === 'rare' ? styles.rare : styles.normal]}
        >
          <AppText style={styles.emoji}>{STAMP_EMOJI[stamp.stampType] ?? '⭐'}</AppText>
        </View>
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
  stamp: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  normal: {
    backgroundColor: colors.surfaceAlt,
  },
  rare: {
    backgroundColor: colors.accent,
  },
  emoji: {
    fontSize: 28,
  },
});
