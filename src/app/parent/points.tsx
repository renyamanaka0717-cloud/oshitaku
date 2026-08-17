import { useEffect, useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { useActiveChild } from '@/features/child/store';
import { usePointsStore } from '@/features/points/store';
import { ColorPalette, outlineWidth, radius, spacing, useTheme } from '@/theme';

const FIELDS: Array<{
  key: 'morningComplete' | 'eveningComplete' | 'onTime' | 'noForgottenItems' | 'perfectDayBonus';
  label: string;
  icon: string;
  tint: keyof ColorPalette;
}> = [
  { key: 'morningComplete', label: '朝完了', icon: '☀️', tint: 'yellow' },
  { key: 'eveningComplete', label: '夜完了', icon: '🌙', tint: 'purple' },
  { key: 'onTime', label: '時間内達成', icon: '⏰', tint: 'blue' },
  { key: 'noForgottenItems', label: '忘れ物ゼロ', icon: '🎒', tint: 'green' },
  { key: 'perfectDayBonus', label: '朝＋夜パーフェクト', icon: '✨', tint: 'pink' },
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
          <View style={[styles.iconBox, { backgroundColor: colors[field.tint] as string }]}>
            <AppText style={styles.icon}>{field.icon}</AppText>
          </View>
          <AppText variant="subtitle" style={styles.label}>
            {field.label}
          </AppText>
          <View style={styles.inputWrap}>
            <TextInput
              value={String(rule[field.key])}
              onChangeText={(v) => {
                const n = Number(v.replace(/[^0-9]/g, ''));
                updateRule({ [field.key]: Number.isNaN(n) ? 0 : n });
              }}
              keyboardType="number-pad"
              style={styles.input}
            />
            <AppText variant="caption" color={colors.textMuted}>
              pt
            </AppText>
          </View>
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
      gap: spacing.md,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: outlineWidth - 1,
      borderColor: colors.black,
    },
    icon: {
      fontSize: 22,
    },
    label: {
      flex: 1,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    input: {
      width: 60,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      borderWidth: outlineWidth - 1,
      borderColor: colors.border,
      paddingVertical: spacing.sm,
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
  });
}
