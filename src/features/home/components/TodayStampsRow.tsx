import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { AppText } from '@/components/AppText';
import { StampCard } from '@/components/StampCard';
import { Stamp } from '@/db/models';
import { STAMP_EMOJI } from '@/features/stamps/store';
import { countStampsByType } from '@/features/stamps/selectors';
import { STAMP_CATALOG } from '@/db/stampCatalog';
import { Icon } from '@/theme/icons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  stamps: Stamp[];
  allStamps: Stamp[];
};

const MYSTERY_SLOTS = 3;

export function TodayStampsRow({ stamps, allStamps }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const counts = useMemo(() => countStampsByType(allStamps), [allStamps]);
  const ownedCount = useMemo(
    () => STAMP_CATALOG.filter((def) => (counts[def.id] ?? 0) > 0).length,
    [counts]
  );
  const remaining = STAMP_CATALOG.length - ownedCount;
  const completionRate = Math.round((ownedCount / STAMP_CATALOG.length) * 100);

  return (
    <Card>
      <SectionHeader
        title="今日のスタンプ"
        icon={<Icon name="medal" size={20} />}
        right={
          <View style={styles.ratePill}>
            <AppText variant="caption" style={styles.rateText}>
              図鑑 {completionRate}%
            </AppText>
          </View>
        }
      />
      {stamps.length === 0 ? (
        <View style={styles.emptyRow}>
          {Array.from({ length: MYSTERY_SLOTS }).map((_, i) => (
            <View key={i} style={styles.mysterySlot}>
              <AppText style={styles.mysteryMark}>？</AppText>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.row}>
          {stamps.map((stamp) => (
            <StampCard key={stamp.id} emoji={STAMP_EMOJI[stamp.stampType] ?? '⭐'} rare={stamp.kind === 'rare'} size={48} />
          ))}
        </View>
      )}
      <AppText variant="caption" color={colors.textMuted} style={styles.hint}>
        {stamps.length === 0
          ? 'おしたくをがんばってスタンプをゲットしよう'
          : remaining > 0
            ? `あと${remaining}しゅるいで図鑑コンプリート！`
            : '図鑑コンプリート達成！'}
      </AppText>
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    emptyRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    mysterySlot: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: colors.textMuted,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    mysteryMark: {
      fontSize: 20,
      fontWeight: '900',
      color: colors.textMuted,
    },
    hint: {
      marginTop: spacing.sm,
    },
    ratePill: {
      backgroundColor: colors.secondary,
      borderWidth: 2,
      borderColor: colors.black,
      borderRadius: radius.round,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    rateText: {
      color: colors.black,
    },
  });
}
