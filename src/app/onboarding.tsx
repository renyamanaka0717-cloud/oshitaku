import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { useChildStore } from '@/features/child/store';
import { pickChildAvatarImage } from '@/features/child/imagePicker';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

const AVATARS = ['🐣', '🐻', '🐰', '🐱', '🦊', '🐶', '🐼', '🦁'];

export default function Onboarding() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const addChild = useChildStore((s) => s.addChild);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePickPhoto = async () => {
    const uri = await pickChildAvatarImage();
    if (uri) setPhotoUri(uri);
  };

  const handleSelectEmoji = (a: string) => {
    setAvatar(a);
    setPhotoUri(null);
  };

  const handleStart = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await addChild({ name: name.trim(), avatarEmoji: avatar, avatarImageUri: photoUri });
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
        <View style={styles.photoRow}>
          <ChildAvatar avatarImageUri={photoUri} avatarEmoji={avatar} avatarColor={colors.accent} size={56} />
          <Pressable onPress={handlePickPhoto}>
            <AppText color={colors.primaryDark}>📷 写真を選ぶ</AppText>
          </Pressable>
          {photoUri ? (
            <Pressable onPress={() => setPhotoUri(null)}>
              <AppText variant="caption" color={colors.textMuted}>
                写真をやめる
              </AppText>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.avatarRow}>
          {AVATARS.map((a) => (
            <AppText
              key={a}
              onPress={() => handleSelectEmoji(a)}
              style={[
                styles.avatar,
                !photoUri && avatar === a ? styles.avatarSelected : null,
              ]}
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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
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
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.md,
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
}
