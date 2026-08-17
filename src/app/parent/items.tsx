import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useActiveChild } from '@/features/child/store';
import { useTimetableStore } from '@/features/timetable/store';
import { ColorPalette, hardShadow, outlineWidth, radius, spacing, useTheme } from '@/theme';

export default function ItemsSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const items = useTimetableStore((s) => s.items);
  const load = useTimetableStore((s) => s.load);
  const createItem = useTimetableStore((s) => s.createItem);
  const updateItem = useTimetableStore((s) => s.updateItem);
  const deleteItem = useTimetableStore((s) => s.deleteItem);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    await createItem(name.trim(), icon);
    setName('');
    setIcon('📦');
  };

  return (
    <Screen>
      <HeaderBar
        title="持ち物リスト"
        onBack={() => router.back()}
        right={
          <Pressable
            style={[styles.editToggle, editMode ? styles.editToggleActive : null]}
            onPress={() => setEditMode((v) => !v)}
          >
            <AppText variant="caption" color={editMode ? colors.white : colors.text}>
              {editMode ? '完了' : '編集'}
            </AppText>
          </Pressable>
        }
      />

      <View style={styles.list}>
        {items.map((item) => (
          <Card key={item.id} style={styles.row}>
            <TextInput
              value={item.icon}
              onChangeText={(v) => updateItem(item.id, { icon: v })}
              style={styles.iconInput}
              maxLength={2}
            />
            <TextInput
              value={item.name}
              onChangeText={(v) => updateItem(item.id, { name: v })}
              style={styles.nameInput}
            />
            {editMode ? (
              <Button label="削除" variant="danger" onPress={() => deleteItem(item.id)} />
            ) : null}
          </Card>
        ))}
      </View>

      <Card style={styles.addCard}>
        <AppText variant="subtitle">持ち物を追加</AppText>
        <View style={styles.row}>
          <TextInput value={icon} onChangeText={setIcon} style={styles.iconInput} maxLength={2} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="持ち物の名前"
            placeholderTextColor={colors.textMuted}
            style={styles.nameInput}
          />
        </View>
        <Button label="追加する" onPress={handleAdd} disabled={!name.trim()} />
      </Card>
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    editToggle: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
      backgroundColor: colors.surfaceAlt,
      borderWidth: outlineWidth - 1,
      borderColor: colors.black,
      borderBottomWidth: outlineWidth + hardShadow.offsetSm,
      borderRightWidth: outlineWidth + hardShadow.offsetSm,
    },
    editToggleActive: {
      backgroundColor: colors.primary,
    },
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconInput: {
      width: 48,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 20,
      color: colors.text,
    },
    nameInput: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    addCard: {
      gap: spacing.sm,
    },
  });
}
