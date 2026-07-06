import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/Card';
import { SectionHeader } from '@/components/SectionHeader';
import { ChecklistItem } from '@/components/ChecklistItem';
import { EmptyState } from '@/components/EmptyState';
import { spacing } from '@/theme';
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
        <EmptyState icon="🎒" message="今日必要な持ち物はありません" />
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
  list: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
