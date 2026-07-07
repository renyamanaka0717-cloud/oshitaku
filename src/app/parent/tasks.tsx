import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

const MENU: Array<{ href: string; icon: string; label: string; description: string }> = [
  { href: '/parent/tasks-morning', icon: '☀️', label: '朝のタスク', description: 'チェックリストの内容を編集' },
  { href: '/parent/tasks-evening', icon: '🌙', label: '夜のタスク', description: 'チェックリストの内容を編集' },
];

export default function TasksSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Screen>
      <HeaderBar title="朝・夜タスク" onBack={() => router.back()} />

      <View style={styles.menu}>
        {MENU.map((item) => (
          <Pressable key={item.href} style={styles.menuItem} onPress={() => router.push(item.href as never)}>
            <AppText style={styles.menuIcon}>{item.icon}</AppText>
            <View style={styles.menuText}>
              <AppText variant="subtitle">{item.label}</AppText>
              <AppText variant="caption">{item.description}</AppText>
            </View>
            <AppText style={styles.chevron} color={colors.textMuted}>
              ›
            </AppText>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    menu: {
      gap: spacing.sm,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    menuIcon: {
      fontSize: 28,
    },
    menuText: {
      flex: 1,
    },
    chevron: {
      fontSize: 24,
    },
  });
}
