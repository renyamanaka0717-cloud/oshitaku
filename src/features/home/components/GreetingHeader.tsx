import { Pressable, StyleSheet, View } from 'react-native';
import { Child } from '@/db/models';
import { AppText } from '@/components/AppText';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { getSuggestedMode } from '@/features/home/timeMode';
import { Icon, IconName } from '@/theme/icons';
import { spacing, useTheme } from '@/theme';
import { formatJapaneseDate } from '@/utils/date';

function greetingForHour(hour: number): string {
  if (hour < 11) return 'おはよう！';
  if (hour < 17) return 'こんにちは！';
  return 'こんばんは！';
}

// Morning/evening show a small decorative sun/moon next to the greeting
// so the screen's mood shifts with the time of day, without wrapping the
// header in its own colored panel.
const MODE_DECOR: Record<'morning' | 'evening', IconName> = {
  morning: 'sun',
  evening: 'moon',
};

type Props = {
  child: Child;
  onPressAvatar: () => void;
};

export function GreetingHeader({ child, onPressAvatar }: Props) {
  const { colors } = useTheme();
  const now = new Date();
  const mode = getSuggestedMode(now);
  const decor = mode ? MODE_DECOR[mode] : null;

  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <View style={styles.greetLine}>
          {decor ? <Icon name={decor} size={24} /> : null}
          <AppText variant="hero">{greetingForHour(now.getHours())}</AppText>
        </View>
        <AppText variant="body" color={colors.textMuted}>
          {formatJapaneseDate(now)}
        </AppText>
      </View>
      <Pressable onPress={onPressAvatar}>
        <ChildAvatar
          avatarImageUri={child.avatarImageUri}
          avatarEmoji={child.avatarEmoji}
          avatarColor={child.avatarColor}
          size={64}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  textCol: {
    gap: 2,
  },
  greetLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
