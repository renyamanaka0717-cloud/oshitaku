import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CuteIcon } from '@/components/CuteIcon';
import { useActiveChild, useChildStore } from '@/features/child/store';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { ChildSwitcherModal } from '@/features/child/components/ChildSwitcherModal';
import { useParentAuthStore } from '@/features/parent/store';
import { useChoreRequestsStore } from '@/features/chores/requestsStore';
import { useRewardRequestsStore } from '@/features/rewards/requestsStore';
import { cuteIconKeyForEmoji } from '@/theme/cuteIcons';
import { ColorPalette, hardShadow, outlineWidth, radius, spacing, useTheme } from '@/theme';

type MenuItem = { href: string; icon: string; label: string; description: string };
type MenuSection = {
  key: string;
  title: string;
  subtitle: string;
  illustration: string;
  tint: keyof ColorPalette;
  items: MenuItem[];
};

const SECTIONS: MenuSection[] = [
  {
    key: 'child',
    title: 'お子さまの設定',
    subtitle: 'お子さまの情報を管理します',
    illustration: '🧒',
    tint: 'pink',
    items: [
      { href: '/parent/children', icon: '👨‍👩‍👧‍👦', label: 'お子さま管理', description: 'きょうだいの追加・編集' },
    ],
  },
  {
    key: 'school',
    title: '学校・おしたくの設定',
    subtitle: '学校で必要なものやタスクを設定します',
    illustration: '🏫',
    tint: 'blue',
    items: [
      { href: '/parent/schedule', icon: '⏰', label: '時間設定', description: '曜日ごとの登校時間' },
      { href: '/parent/timetable', icon: '📚', label: '時間割・教科', description: '曜日ごとの時間割と教科の持ち物' },
      { href: '/parent/items', icon: '🎒', label: '持ち物リスト', description: '持ち物の登録' },
      { href: '/parent/tasks', icon: '📝', label: '朝・夜タスク', description: 'チェックリストの内容' },
      { href: '/parent/calendar', icon: '📅', label: 'カレンダー設定', description: 'たのしみな予定の登録' },
    ],
  },
  {
    key: 'points',
    title: 'ポイント・ごほうびの設定',
    subtitle: 'がんばりに応じたポイントやごほうびを設定します',
    illustration: '⭐',
    tint: 'yellow',
    items: [
      { href: '/parent/points', icon: '⭐', label: 'ポイント設定', description: 'もらえるポイント数' },
      { href: '/parent/rewards', icon: '🎁', label: 'ごほうび設定', description: 'ごほうびと交換履歴' },
      { href: '/parent/reward-requests', icon: '🛍️', label: 'ごほうび申請', description: '承認待ちの確認' },
      { href: '/parent/chores', icon: '🧹', label: 'おてつだい設定', description: 'おてつだいと完了履歴' },
      { href: '/parent/chore-requests', icon: '✅', label: 'おてつだい申請', description: '承認待ちの確認' },
    ],
  },
  {
    key: 'other',
    title: 'その他の設定',
    subtitle: '通知やクラウド同期を設定します',
    illustration: '⚙️',
    tint: 'purple',
    items: [
      { href: '/parent/notifications', icon: '🔔', label: '通知設定', description: '通知する時間' },
      { href: '/parent/account', icon: '☁️', label: 'クラウド同期', description: 'アカウント作成・ログイン' },
    ],
  },
];

export default function ParentDashboard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const lock = useParentAuthStore((s) => s.lock);
  const { children, activeChildId, setActiveChild } = useChildStore();
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const choreRequests = useChoreRequestsStore((s) => s.requests);
  const pollChoreRequests = useChoreRequestsStore((s) => s.pollRemote);
  const rewardRequests = useRewardRequestsStore((s) => s.requests);
  const pollRewardRequests = useRewardRequestsStore((s) => s.pollRemote);
  const pendingChoreCount = choreRequests.filter((r) => r.status === 'pending').length;
  const pendingRewardCount = rewardRequests.filter((r) => r.status === 'pending').length;
  const totalPendingCount = pendingChoreCount + pendingRewardCount;

  useEffect(() => {
    if (children.length > 0) {
      const childIds = children.map((c) => c.id);
      pollChoreRequests(childIds);
      pollRewardRequests(childIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children.length]);

  const handleBack = () => {
    lock();
    router.replace('/child/home');
  };

  const badgeCountFor = (href: string) => {
    if (href === '/parent/chore-requests') return pendingChoreCount;
    if (href === '/parent/reward-requests') return pendingRewardCount;
    return 0;
  };

  return (
    <Screen>
      <HeaderBar
        title="保護者モード"
        onBack={handleBack}
        right={
          totalPendingCount > 0 ? (
            <Pressable
              style={styles.headerRequestButton}
              onPress={() =>
                router.push((pendingChoreCount > 0 ? '/parent/chore-requests' : '/parent/reward-requests') as never)
              }
              hitSlop={8}
            >
              <AppText style={styles.headerRequestIcon}>✅</AppText>
              <View style={styles.badge}>
                <AppText variant="caption" color={colors.white}>
                  {totalPendingCount}
                </AppText>
              </View>
            </Pressable>
          ) : null
        }
      />

      {child ? (
        <Card style={styles.childCard}>
          <ChildAvatar
            avatarImageUri={child.avatarImageUri}
            avatarEmoji={child.avatarEmoji}
            avatarColor={child.avatarColor}
            size={48}
          />
          <View style={styles.childCardText}>
            <AppText variant="caption">いま設定中のお子さま</AppText>
            <AppText variant="subtitle">{child.name}</AppText>
          </View>
          {children.length > 1 ? (
            <Pressable style={styles.switchButton} onPress={() => setSwitcherVisible(true)}>
              <AppText variant="caption" color={colors.text}>
                切り替え
              </AppText>
              <AppText style={styles.switchChevron} color={colors.text}>
                ›
              </AppText>
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      {SECTIONS.map((section) => (
        <View key={section.key} style={[styles.sectionPanel, { backgroundColor: colors[section.tint] as string }]}>
          <View style={styles.sectionHeaderRow}>
            <CuteIcon
              iconKey={cuteIconKeyForEmoji(section.illustration)}
              size={40}
              fallback={<AppText style={styles.sectionIllustration}>{section.illustration}</AppText>}
            />
            <View style={styles.sectionHeaderText}>
              <AppText variant="title" color={colors.black}>
                {section.title}
              </AppText>
              <AppText variant="caption" color={colors.black} style={styles.sectionSubtitle}>
                {section.subtitle}
              </AppText>
            </View>
          </View>

          <Card style={styles.sectionCard}>
            {section.items.map((item, index) => {
              const badgeCount = badgeCountFor(item.href);
              return (
                <Pressable
                  key={item.href}
                  style={[styles.menuRow, index > 0 ? styles.menuRowDivider : null]}
                  onPress={() => router.push(item.href as never)}
                >
                  <CuteIcon
                    iconKey={cuteIconKeyForEmoji(item.icon)}
                    size={28}
                    fallback={<AppText style={styles.menuIcon}>{item.icon}</AppText>}
                  />
                  <View style={styles.menuText}>
                    <AppText variant="subtitle">{item.label}</AppText>
                    <AppText variant="caption">{item.description}</AppText>
                  </View>
                  {badgeCount > 0 ? (
                    <View style={styles.badge}>
                      <AppText variant="caption" color={colors.white}>
                        {badgeCount}
                      </AppText>
                    </View>
                  ) : null}
                  <AppText style={styles.chevron}>›</AppText>
                </Pressable>
              );
            })}
          </Card>
        </View>
      ))}

      <ChildSwitcherModal
        visible={switcherVisible}
        children={children}
        activeChildId={activeChildId}
        onSelect={(id) => setActiveChild(id)}
        onClose={() => setSwitcherVisible(false)}
      />
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
    childCardText: {
      flex: 1,
    },
    switchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.pink,
      borderRadius: radius.round,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderWidth: outlineWidth - 1,
      borderColor: colors.black,
      borderBottomWidth: outlineWidth + hardShadow.offsetSm,
      borderRightWidth: outlineWidth + hardShadow.offsetSm,
    },
    switchChevron: {
      fontSize: 16,
    },
    sectionPanel: {
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    sectionIllustration: {
      fontSize: 40,
    },
    sectionHeaderText: {
      flex: 1,
      gap: 2,
    },
    sectionSubtitle: {
      opacity: 0.7,
    },
    sectionCard: {
      padding: 0,
      gap: 0,
    },
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
    },
    menuRowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    menuIcon: {
      fontSize: 28,
    },
    menuText: {
      flex: 1,
    },
    headerRequestButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surface,
      borderRadius: radius.round,
      paddingVertical: 6,
      paddingHorizontal: spacing.sm,
    },
    headerRequestIcon: {
      fontSize: 18,
    },
    badge: {
      minWidth: 22,
      height: 22,
      borderRadius: radius.round,
      backgroundColor: colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },
    chevron: {
      fontSize: 24,
      color: colors.textMuted,
    },
  });
}
