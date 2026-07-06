import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { useChildStore } from '@/features/child/store';
import { pickChildAvatarImage } from '@/features/child/imagePicker';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

const AVATARS = ['🐣', '🐻', '🐰', '🐱', '🦊', '🐶', '🐼', '🦁'];

export default function ChildrenSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { children, activeChildId, setActiveChild, addChild, updateChild, removeChild } = useChildStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addChild({ name: name.trim(), avatarEmoji: avatar, avatarImageUri: photoUri });
    setName('');
    setPhotoUri(null);
  };

  const handlePickExistingPhoto = async (childId: string) => {
    const uri = await pickChildAvatarImage();
    if (uri) updateChild(childId, { avatarImageUri: uri });
  };

  return (
    <Screen>
      <HeaderBar title="お子さま管理" onBack={() => router.back()} />

      <View style={styles.list}>
        {children.map((child) => (
          <Card key={child.id} style={styles.childCard}>
            <View style={styles.switchRow}>
              <Pressable style={styles.switchTapArea} onPress={() => setActiveChild(child.id)}>
                <ChildAvatar
                  avatarImageUri={child.avatarImageUri}
                  avatarEmoji={child.avatarEmoji}
                  avatarColor={child.avatarColor}
                  size={48}
                />
                <AppText variant="subtitle" style={styles.switchLabel}>
                  {child.id === activeChildId ? '選択中' : 'タップして切りかえ'}
                </AppText>
              </Pressable>
              {children.length > 1 ? (
                <Button
                  label="削除"
                  variant="danger"
                  size="md"
                  onPress={() => removeChild(child.id)}
                />
              ) : null}
            </View>

            <AppText variant="caption">なまえ</AppText>
            <TextInput
              value={child.name}
              onChangeText={(v) => updateChild(child.id, { name: v })}
              style={styles.input}
              maxLength={12}
            />

            <AppText variant="caption">アイコン</AppText>
            <View style={styles.photoRow}>
              <Pressable onPress={() => handlePickExistingPhoto(child.id)}>
                <AppText color={colors.primaryDark}>📷 写真を選ぶ</AppText>
              </Pressable>
              {child.avatarImageUri ? (
                <Pressable onPress={() => updateChild(child.id, { avatarImageUri: null })}>
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
                  onPress={() => updateChild(child.id, { avatarEmoji: a, avatarImageUri: null })}
                  style={[
                    styles.avatar,
                    !child.avatarImageUri && child.avatarEmoji === a ? styles.avatarSelected : null,
                  ]}
                >
                  {a}
                </AppText>
              ))}
            </View>

            <AppText variant="caption">登校時間</AppText>
            <TextInput
              value={child.schoolArrivalTime}
              onChangeText={(v) => updateChild(child.id, { schoolArrivalTime: v })}
              style={styles.timeInput}
              placeholder="08:20"
              placeholderTextColor={colors.textMuted}
            />
          </Card>
        ))}
      </View>

      <Card style={styles.addCard}>
        <AppText variant="subtitle">きょうだいを追加</AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="なまえ"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={12}
        />
        <View style={styles.photoRow}>
          <ChildAvatar avatarImageUri={photoUri} avatarEmoji={avatar} avatarColor={colors.accent} size={48} />
          <Pressable
            onPress={async () => {
              const uri = await pickChildAvatarImage();
              if (uri) setPhotoUri(uri);
            }}
          >
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
              onPress={() => {
                setAvatar(a);
                setPhotoUri(null);
              }}
              style={[styles.avatar, !photoUri && avatar === a ? styles.avatarSelected : null]}
            >
              {a}
            </AppText>
          ))}
        </View>
        <Button label="追加する" onPress={handleAdd} disabled={!name.trim()} />
      </Card>
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    list: {
      gap: spacing.md,
    },
    childCard: {
      gap: spacing.sm,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    switchTapArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    switchLabel: {
      flex: 1,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      fontSize: 16,
      color: colors.text,
    },
    timeInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
      width: 100,
    },
    addCard: {
      gap: spacing.sm,
    },
    photoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    avatarRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    avatar: {
      fontSize: 28,
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
