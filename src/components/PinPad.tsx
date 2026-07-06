import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

type Props = {
  value: string;
  length?: number;
  onPress: (digit: string) => void;
  onDelete: () => void;
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export function PinPad({ value, length = 4, onPress, onDelete }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.dots}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={[styles.dot, i < value.length ? styles.dotFilled : null]} />
        ))}
      </View>
      <View style={styles.grid}>
        {KEYS.map((key, i) => {
          if (key === '') return <View key={i} style={styles.key} />;
          return (
            <Pressable
              key={i}
              style={styles.key}
              onPress={() => (key === '⌫' ? onDelete() : onPress(key))}
            >
              <AppText variant="title">{key}</AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: radius.round,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dotFilled: {
    backgroundColor: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 3 * 76,
    justifyContent: 'center',
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xs,
    backgroundColor: colors.surfaceAlt,
  },
});
