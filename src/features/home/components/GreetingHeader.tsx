import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Child } from '@/db/models';
import { AppText } from '@/components/AppText';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { getSuggestedMode } from '@/features/home/timeMode';
import { Icon, IconName } from '@/theme/icons';
import { radius, spacing, useTheme } from '@/theme';
import { formatJapaneseDate } from '@/utils/date';

const NIGHT_SCENE = require('@/assets/images/home-header-bg.jpg');
const NIGHT_SCENE_ASPECT = 850 / 504;

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
  const { width: windowWidth } = useWindowDimensions();
  const now = new Date();
  const mode = getSuggestedMode(now);
  const decor = mode ? MODE_DECOR[mode] : null;
  // The bedroom illustration depicts nighttime, so it only shows alongside
  // the "こんばんは！" greeting — there's no day/morning variant yet, so
  // other times of day (including the small おはよう window before dawn)
  // fall back to the plain header.
  const isNight = now.getHours() >= 17;

  const content = (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <View style={styles.greetLine}>
          {decor ? <Icon name={decor} size={24} /> : null}
          <AppText variant="hero" color={isNight ? colors.white : undefined}>
            {greetingForHour(now.getHours())}
          </AppText>
        </View>
        <AppText variant="body" color={isNight ? colors.white : colors.textMuted}>
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

  if (isNight) {
    return (
      <View style={styles.nightWrap}>
        <Image
          source={NIGHT_SCENE}
          style={[styles.nightImage, { width: windowWidth, height: windowWidth / NIGHT_SCENE_ASPECT }]}
          resizeMode="cover"
        />
        <View style={styles.nightOverlay}>{content}</View>
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nightWrap: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.sm,
  },
  nightImage: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  nightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
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
