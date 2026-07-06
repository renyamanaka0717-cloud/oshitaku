import { useEffect, useMemo } from 'react';
import { StyleSheet, Switch, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { useActiveChild } from '@/features/child/store';
import { useNotificationStore } from '@/features/notifications/store';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export default function NotificationsSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const setting = useNotificationStore((s) => s.setting);
  const load = useNotificationStore((s) => s.load);
  const update = useNotificationStore((s) => s.update);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  if (!setting || !child) return null;

  return (
    <Screen>
      <HeaderBar title="通知設定" onBack={() => router.back()} />

      <Card style={styles.row}>
        <AppText style={styles.icon}>☀️</AppText>
        <View style={styles.info}>
          <AppText variant="subtitle">朝の通知</AppText>
          <TextInput
            value={setting.morningTime}
            onChangeText={(v) => update(child.name, { morningTime: v })}
            style={styles.timeInput}
            placeholder="07:00"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <Switch
          value={setting.morningEnabled}
          onValueChange={(v) => update(child.name, { morningEnabled: v })}
        />
      </Card>

      <Card style={styles.row}>
        <AppText style={styles.icon}>🌙</AppText>
        <View style={styles.info}>
          <AppText variant="subtitle">夜の通知</AppText>
          <TextInput
            value={setting.eveningTime}
            onChangeText={(v) => update(child.name, { eveningTime: v })}
            style={styles.timeInput}
            placeholder="20:00"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <Switch
          value={setting.eveningEnabled}
          onValueChange={(v) => update(child.name, { eveningEnabled: v })}
        />
      </Card>

      <Card style={styles.row}>
        <AppText style={styles.icon}>📝</AppText>
        <View style={styles.info}>
          <AppText variant="subtitle">未完了リマインド</AppText>
          <AppText variant="caption">朝の通知から{setting.reminderMinutesAfter}分後</AppText>
        </View>
        <Switch
          value={setting.reminderEnabled}
          onValueChange={(v) => update(child.name, { reminderEnabled: v })}
        />
      </Card>
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
    icon: {
      fontSize: 28,
    },
    info: {
      flex: 1,
      gap: 4,
    },
    timeInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
      width: 100,
    },
  });
}
