import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useChildStore } from '@/features/child/store';
import { colors, radius, spacing } from '@/theme';

const AVATARS = ['🐣', '🐻', '🐰', '🐱', '🦊', '🐶', '🐼', '🦁'];

export default function Onboarding() {
  const addChild = useChildStore((s) => s.addChild);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await addChild({ name: name.trim(), avatarEmoji: avatar });
    setSaving(false);
    router.replace('/child/home');
  };

  return (
    <Screen>
      <AppText variant="hero" style={styles.center}>
        ようこそ！
      </AppText>
      <AppText variant="body" style={[styles.center, styles.subtitle]}>
        おしたく習慣をはじめよう
      </AppText>

      <Card>
        <AppText variant="subtitle" style={styles.label}>
          おなまえ
        </AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="なまえを入力"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={12}
        />

        <AppText variant="subtitle" style={styles.label}>
          アイコンをえらぼう
        </AppText>
        <View style={styles.avatarRow}>
          {AVATARS.map((a) => (
            <AppText
              key={a}
              onPress={() => setAvatar(a)}
              style={[styles.avatar, avatar === a ? styles.avatarSelected : null]}
            >
              {a}
            </AppText>
          ))}
        </View>
      </Card>

      <Button label="はじめる" onPress={handleStart} disabled={!name.trim() || saving} size="lg" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  subtitle: { marginBottom: spacing.md },
  label: { marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  avatar: {
    fontSize: 32,
    padding: spacing.sm,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  avatarSelected: {
    backgroundColor: colors.accent,
  },
});
