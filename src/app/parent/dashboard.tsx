import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { useActiveChild, useChildStore } from '@/features/child/store';
import { useParentAuthStore } from '@/features/parent/store';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

const MENU: Array<{ href: string; icon: string; label: string; description: string }> = [
  { href: '/parent/children', icon: '👨‍👩‍👧‍👦', label: 'お子さま管理', description: 'きょうだいの追加・登校時間' },
  { href: '/parent/timetable', icon: '📚', label: '時間割・教科', description: '曜日ごとの時間割と教科の持ち物' },
  { href: '/parent/items', icon: '🎒', label: '持ち物リスト', description: '持ち物の登録' },
  { href: '/parent/tasks', icon: '📝', label: '朝・夜タスク', description: 'チェックリストの内容' },
  { href: '/parent/points', icon: '⭐', label: 'ポイント設定', description: 'もらえるポイント数' },
  { href: '/parent/rewards', icon: '🎁', label: 'ごほうび設定', description: 'ごほうびと交換履歴' },
  { href: '/parent/notifications', icon: '🔔', label: '通知設定', description: '通知する時間' },
  { href: '/parent/appearance', icon: '🎨', label: '表示設定', description: 'ライト・ダークモード' },
];

export default function ParentDashboard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const lock = useParentAuthStore((s) => s.lock);

  const handleBack = () => {
    lock();
    router.replace('/child/home');
  };

  return (
    <Screen>
      <HeaderBar title="保護者モード" onBack={handleBack} />

      {child ? (
        <Card style={styles.childCard}>
          <AppText style={styles.emoji}>{child.avatarEmoji}</AppText>
          <View>
            <AppText variant="caption">いま設定中のお子さま</AppText>
            <AppText variant="subtitle">{child.name}</AppText>
          </View>
        </Card>
      ) : null}

      <View style={styles.menu}>
        {MENU.map((item) => (
          <Pressable key={item.href} style={styles.menuItem} onPress={() => router.push(item.href as never)}>
            <AppText style={styles.menuIcon}>{item.icon}</AppText>
            <View style={styles.menuText}>
              <AppText variant="subtitle">{item.label}</AppText>
              <AppText variant="caption">{item.description}</AppText>
            </View>
            <AppText style={styles.chevron}>›</AppText>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    childCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    emoji: {
      fontSize: 36,
    },
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
      color: colors.textMuted,
    },
  });
}
