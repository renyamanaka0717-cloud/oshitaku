import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useChildStore } from '@/features/child/store';
import { colors, radius, spacing } from '@/theme';

const AVATARS = ['🐣', '🐻', '🐰', '🐱', '🦊', '🐶', '🐼', '🦁'];

export default function ChildrenSettings() {
  const { children, activeChildId, setActiveChild, addChild, updateChild, removeChild } = useChildStore();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addChild({ name: name.trim(), avatarEmoji: avatar });
    setName('');
  };

  return (
    <Screen>
      <HeaderBar title="お子さま管理" onBack={() => router.back()} />

      <View style={styles.list}>
        {children.map((child) => (
          <Card key={child.id} style={styles.childRow}>
            <Pressable style={styles.childInfo} onPress={() => setActiveChild(child.id)}>
              <AppText style={styles.emoji}>{child.avatarEmoji}</AppText>
              <View style={styles.childText}>
                <AppText variant="subtitle">
                  {child.name} {child.id === activeChildId ? '（選択中）' : ''}
                </AppText>
                <AppText variant="caption" color={colors.textMuted}>
                  登校時間
                </AppText>
                <TextInput
                  value={child.schoolArrivalTime}
                  onChangeText={(v) => updateChild(child.id, { schoolArrivalTime: v })}
                  style={styles.timeInput}
                  placeholder="08:20"
                />
              </View>
            </Pressable>
            {children.length > 1 ? (
              <Button label="削除" variant="danger" size="md" onPress={() => removeChild(child.id)} />
            ) : null}
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
        <Button label="追加する" onPress={handleAdd} disabled={!name.trim()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  childInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  childText: {
    flex: 1,
    gap: 4,
  },
  emoji: {
    fontSize: 32,
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
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
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
