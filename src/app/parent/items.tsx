import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { HeaderBar } from '@/components/HeaderBar';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CuteIcon } from '@/components/CuteIcon';
import { EmptyState } from '@/components/EmptyState';
import { ItemEditorModal } from '@/features/parent/components/ItemEditorModal';
import { useActiveChild } from '@/features/child/store';
import { useTimetableStore } from '@/features/timetable/store';
import { Item } from '@/db/models';
import { cuteIconKeyForItemEmoji } from '@/theme/cuteIcons';
import { ColorPalette, hardShadow, outlineWidth, radius, spacing, useTheme } from '@/theme';
import { goBack } from '@/utils/navigation';

export default function ItemsSettings() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const child = useActiveChild();
  const items = useTimetableStore((s) => s.items);
  const load = useTimetableStore((s) => s.load);
  const createItem = useTimetableStore((s) => s.createItem);
  const updateItem = useTimetableStore((s) => s.updateItem);
  const deleteItem = useTimetableStore((s) => s.deleteItem);

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    if (child) load(child.id);
  }, [child, load]);

  return (
    <Screen>
      <HeaderBar
        title="持ち物リスト"
        onBack={goBack}
        right={
          <Pressable style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <AppText variant="caption" color={colors.white}>
              ＋ 追加
            </AppText>
          </Pressable>
        }
      />

      {items.length === 0 ? (
        <EmptyState icon="📦" message="持ち物がまだ登録されていません" />
      ) : (
        <Card style={styles.listCard}>
          {items.map((item, index) => (
            <Pressable
              key={item.id}
              style={[styles.row, index > 0 ? styles.rowDivider : null]}
              onPress={() => setEditingItem(item)}
            >
              <CuteIcon iconKey={cuteIconKeyForItemEmoji(item.icon)} size={32} fallback={<AppText style={styles.emojiIcon}>{item.icon}</AppText>} />
              <AppText variant="subtitle" style={styles.itemName} numberOfLines={1}>
                {item.name}
              </AppText>
              <AppText style={styles.chevron} color={colors.textMuted}>
                ›
              </AppText>
            </Pressable>
          ))}
        </Card>
      )}

      <ItemEditorModal
        visible={!!editingItem || addModalVisible}
        initialName={editingItem?.name}
        initialIcon={editingItem?.icon}
        onSave={({ name, icon }) => {
          if (editingItem) {
            updateItem(editingItem.id, { name, icon });
          } else {
            createItem(name, icon);
          }
        }}
        onDelete={editingItem ? () => deleteItem(editingItem.id) : undefined}
        onClose={() => {
          setEditingItem(null);
          setAddModalVisible(false);
        }}
      />
    </Screen>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    addButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius.round,
      backgroundColor: colors.primary,
      borderWidth: outlineWidth - 1,
      borderColor: colors.black,
      borderBottomWidth: outlineWidth + hardShadow.offsetSm,
      borderRightWidth: outlineWidth + hardShadow.offsetSm,
    },
    listCard: {
      padding: 0,
      gap: 0,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    emojiIcon: {
      fontSize: 24,
    },
    itemName: {
      flex: 1,
    },
    chevron: {
      fontSize: 24,
    },
  });
}
