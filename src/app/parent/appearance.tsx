import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ColorPalette, ThemeMode, radius, spacing, useTheme } from '@/theme';

const OPTIONS: Array<{ mode: ThemeMode; icon: string; label: string }> = [
  { mode: 'light', icon: '☀️', label: 'ライトモード' },
  { mode: 'dark', icon: '🌙', label: 'ダークモード' },
  { mode: 'system', icon: '📱', label: '端末の設定に合わせる' },
];

export default function AppearanceSettings() {
  const { colors, mode, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen>
      <HeaderBar title="表示設定" onBack={() => router.back()} />
      <AppText variant="body" color={colors.textMuted}>
        アプリの見た目を選べます
      </AppText>

      <View style={styles.list}>
        {OPTIONS.map((option) => {
          const active = mode === option.mode;
          return (
            <Pressable key={option.mode} onPress={() => setMode(option.mode)}>
              <Card style={[styles.row, active ? styles.rowActive : null]}>
                <AppText style={styles.icon}>{option.icon}</AppText>
                <AppText variant="subtitle" style={styles.label}>
                  {option.label}
                </AppText>
                {active ? <AppText style={styles.check}>✓</AppText> : null}
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    rowActive: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    icon: {
      fontSize: 24,
    },
    label: {
      flex: 1,
    },
    check: {
      fontSize: 20,
      color: colors.success,
      fontWeight: '900',
      borderRadius: radius.round,
    },
  });
}
