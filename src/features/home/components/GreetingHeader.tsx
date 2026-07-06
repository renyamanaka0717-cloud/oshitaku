import { Pressable, StyleSheet, View } from 'react-native';
import { Child } from '@/db/models';
import { AppText } from '@/components/AppText';
import { colors, radius, spacing } from '@/theme';
import { formatJapaneseDate } from '@/utils/date';

function greetingForHour(hour: number): string {
  if (hour < 11) return 'おはよう！';
  if (hour < 17) return 'こんにちは！';
  return 'こんばんは！';
}

type Props = {
  child: Child;
  onPressAvatar: () => void;
};

export function GreetingHeader({ child, onPressAvatar }: Props) {
  const now = new Date();
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <AppText variant="hero">{greetingForHour(now.getHours())}</AppText>
        <AppText variant="body" color={colors.textMuted}>
          {formatJapaneseDate(now)}
        </AppText>
      </View>
      <Pressable
        onPress={onPressAvatar}
        style={[styles.avatar, { backgroundColor: child.avatarColor }]}
      >
        <AppText style={styles.avatarEmoji}>{child.avatarEmoji}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textCol: {
    gap: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
});
