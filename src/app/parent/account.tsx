import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/features/auth/store';
import { useActiveChild } from '@/features/child/store';
import { pushChildToCloud, SyncProgress } from '@/features/sync/syncService';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

export default function AccountSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const session = useAuthStore((s) => s.session);
  const loaded = useAuthStore((s) => s.loaded);
  const error = useAuthStore((s) => s.error);
  const load = useAuthStore((s) => s.load);
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const child = useActiveChild();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  if (!loaded) return null;

  const handleSubmit = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setInfo(null);
    const ok = mode === 'signUp' ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
    setSubmitting(false);
    if (ok && mode === 'signUp') {
      setInfo('登録できました。確認メールが届いていれば認証してください。');
    }
  };

  const handleSync = async () => {
    if (!child) return;
    setSyncing(true);
    setSyncError(null);
    setSyncProgress(null);
    try {
      await pushChildToCloud(child.id, setSyncProgress);
      setSyncedAt(new Date());
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Screen>
      <HeaderBar title="クラウド同期" onBack={() => router.back()} />

      {session ? (
        <Card style={styles.card}>
          <AppText variant="caption" color={colors.textMuted}>
            ログイン中
          </AppText>
          <AppText variant="subtitle">{session.user.email}</AppText>
          <Button label="ログアウト" variant="danger" onPress={signOut} />

          <View style={styles.divider} />

          <AppText variant="subtitle">バックアップ</AppText>
          <AppText variant="caption" color={colors.textMuted}>
            {child ? `${child.name}のデータをクラウドに保存します` : 'お子さまが選択されていません'}
          </AppText>

          {syncing && syncProgress ? (
            <AppText variant="caption" color={colors.textMuted}>
              同期中… ({syncProgress.done}/{syncProgress.total})
            </AppText>
          ) : null}
          {syncError ? (
            <AppText variant="caption" color={colors.danger}>
              {syncError}
            </AppText>
          ) : null}
          {syncedAt && !syncing ? (
            <AppText variant="caption" color={colors.primaryDark}>
              {syncedAt.toLocaleTimeString('ja-JP')} に同期しました
            </AppText>
          ) : null}

          <Button
            label="今すぐ同期"
            onPress={handleSync}
            disabled={!child || syncing}
            variant="secondary"
          />
        </Card>
      ) : (
        <Card style={styles.card}>
          <View style={styles.tabRow}>
            <Button
              label="ログイン"
              variant={mode === 'signIn' ? 'primary' : 'ghost'}
              size="md"
              onPress={() => setMode('signIn')}
              style={styles.tabButton}
            />
            <Button
              label="新規登録"
              variant={mode === 'signUp' ? 'primary' : 'ghost'}
              size="md"
              onPress={() => setMode('signUp')}
              style={styles.tabButton}
            />
          </View>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="メールアドレス"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="パスワード"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />

          {error ? (
            <AppText variant="caption" color={colors.danger}>
              {error}
            </AppText>
          ) : null}
          {info ? (
            <AppText variant="caption" color={colors.primaryDark}>
              {info}
            </AppText>
          ) : null}

          <Button
            label={mode === 'signUp' ? '登録する' : 'ログインする'}
            onPress={handleSubmit}
            disabled={!email.trim() || !password || submitting}
          />
        </Card>
      )}
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      gap: spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: colors.surfaceAlt,
      marginVertical: spacing.xs,
    },
    tabRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    tabButton: {
      flex: 1,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 16,
      color: colors.text,
    },
  });
}
