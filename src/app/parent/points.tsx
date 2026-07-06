import { useEffect, useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { useActiveChild } from '@/features/child/store';
import { usePointsStore } from '@/features/points/store';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

const FIELDS: Array<{ key: 'morningComplete' | 'eveningComplete' | 'onTime' | 'noForgottenItems' | 'perfectDayBonus'; label: string; icon: string }> = [
  { key: 'morningComplete', label: '朝完了', icon: '☀️' },
  { key: 'eveningComplete', label: '夜完了', icon: '🌙' },
  { key: 'onTime', label: '時間内達成', icon: '⏰' },
  { key: 'noForgottenItems', label: '忘れ物ゼロ', icon: '🎒' },
  { key: 'perfectDayBonus', label: '朝＋夜パーフェクト', icon: '✨' },
];

export default function PointsSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const rule = usePointsStore((s) => s.rule);
  const load = usePointsStore((s) => s.load);
  const updateRule = usePointsStore((s) => s.updateRule);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  if (!rule) return null;

  return (
    <Screen>
      <HeaderBar title="ポイント設定" onBack={() => router.back()} />
      <AppText variant="body" color={colors.textMuted}>
        それぞれの達成でもらえるポイント数を設定できます
      </AppText>

      {FIELDS.map((field) => (
        <Card key={field.key} style={styles.row}>
          <AppText style={styles.icon}>{field.icon}</AppText>
          <AppText variant="subtitle" style={styles.label}>
            {field.label}
          </AppText>
          <TextInput
            value={String(rule[field.key])}
            onChangeText={(v) => {
              const n = Number(v.replace(/[^0-9]/g, ''));
              updateRule({ [field.key]: Number.isNaN(n) ? 0 : n });
            }}
            keyboardType="number-pad"
            style={styles.input}
          />
          <AppText variant="caption">pt</AppText>
        </Card>
      ))}
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    icon: {
      fontSize: 24,
    },
    label: {
      flex: 1,
    },
    input: {
      width: 64,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 18,
      color: colors.text,
    },
  });
}
