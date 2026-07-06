import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { AppText } from '@/components/AppText';
import { SectionHeader } from '@/components/SectionHeader';
import { ChecklistItem } from '@/components/ChecklistItem';
import { colors, spacing } from '@/theme';
import { Item } from '@/db/models';

type Props = {
  items: Item[];
  checked: Record<string, boolean>;
  onToggle: (itemId: string) => void;
};

export function TodayItemsCard({ items, checked, onToggle }: Props) {
  return (
    <Card>
      <SectionHeader title="今日の持ち物" icon="🎒" />
      {items.length === 0 ? (
        <AppText variant="body" color={colors.textMuted} style={styles.empty}>
          今日必要な持ち物はありません
        </AppText>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              label={item.name}
              icon={item.icon}
              checked={!!checked[item.id]}
              onToggle={() => onToggle(item.id)}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: {
    marginTop: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
