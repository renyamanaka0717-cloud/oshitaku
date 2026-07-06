import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function HeaderBar({ title, onBack, right }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        style={styles.backButton}
        onPress={onBack ?? (() => router.back())}
        hitSlop={10}
      >
        <AppText style={styles.backIcon}>←</AppText>
      </Pressable>
      <AppText variant="title" style={styles.title}>
        {title}
      </AppText>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.text,
  },
  title: {
    flex: 1,
  },
  right: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
});
