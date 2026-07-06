import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CircularProgress } from '@/components/CircularProgress';
import { Section } from '@/components/Section';
import { StampBookEntry } from '@/features/stamps/components/StampBookEntry';
import { countStampsByType } from '@/features/stamps/selectors';
import { useStampsStore } from '@/features/stamps/store';
import { STAMP_CATALOG } from '@/db/stampCatalog';
import { spacing, useTheme } from '@/theme';

export default function StampBookScreen() {
  const { colors } = useTheme();
  const stamps = useStampsStore((s) => s.stamps);
  const counts = useMemo(() => countStampsByType(stamps), [stamps]);

  const ownedCount = useMemo(
    () => STAMP_CATALOG.filter((def) => (counts[def.id] ?? 0) > 0).length,
    [counts]
  );
  const completionRate = ownedCount / STAMP_CATALOG.length;

  const normalDefs = STAMP_CATALOG.filter((d) => d.kind === 'normal');
  const rareDefs = STAMP_CATALOG.filter((d) => d.kind === 'rare');
  const specialDefs = STAMP_CATALOG.filter((d) => d.kind === 'special');

  return (
    <Screen>
      <HeaderBar title="スタンプ図鑑" onBack={() => router.back()} />

      <Card style={styles.summaryCard}>
        <CircularProgress progress={completionRate} size={92} strokeWidth={10} color={colors.secondaryDark}>
          <AppText variant="subtitle">{Math.round(completionRate * 100)}%</AppText>
        </CircularProgress>
        <View style={styles.summaryText}>
          <AppText variant="subtitle">コンプリート率</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {ownedCount} / {STAMP_CATALOG.length} しゅるい 集めたよ
          </AppText>
        </View>
      </Card>

      <Section title="通常スタンプ" icon="⭐">
        <View style={styles.grid}>
          {normalDefs.map((def) => (
            <StampBookEntry key={def.id} def={def} count={counts[def.id] ?? 0} />
          ))}
        </View>
      </Section>

      <Section title="レアスタンプ" icon="🌈">
        <View style={styles.grid}>
          {rareDefs.map((def) => (
            <StampBookEntry key={def.id} def={def} count={counts[def.id] ?? 0} />
          ))}
        </View>
      </Section>

      <Section title="特別スタンプ" icon="✨">
        <View style={styles.grid}>
          {specialDefs.map((def) => (
            <StampBookEntry key={def.id} def={def} count={counts[def.id] ?? 0} />
          ))}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  summaryText: {
    flex: 1,
    gap: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
