import { StyleSheet, View } from 'react-native';
import { StatBadge } from '@/components/StatBadge';
import { PointsBadge } from '@/components/PointsBadge';
import { useTheme } from '@/theme';

type Props = {
  eveningPoints: number;
  prepComplete: boolean;
};

export function EveningStatusRow({ eveningPoints, prepComplete }: Props) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <PointsBadge points={eveningPoints} label="夜のポイント" color={colors.purple} />
      <StatBadge
        icon={prepComplete ? '✅' : '🎒'}
        value={prepComplete ? '完了' : '準備中'}
        label="明日のじゅんび"
        color={prepComplete ? colors.green : colors.surfaceAlt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
