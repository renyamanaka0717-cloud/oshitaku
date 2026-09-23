import { Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Child } from '@/db/models';
import { AppText } from '@/components/AppText';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { CuteIcon } from '@/components/CuteIcon';
import { getSuggestedMode } from '@/features/home/timeMode';
import { Icon, IconName } from '@/theme/icons';
import { CuteIconKey } from '@/theme/cuteIcons';
import { radius, spacing, useTheme } from '@/theme';
import { formatJapaneseDate } from '@/utils/date';

const MORNING_SCENE = require('@/assets/images/home-header-bg-morning.png');
const MORNING_SCENE_ASPECT = 1628 / 966;
const NIGHT_SCENE = require('@/assets/images/home-header-bg.jpg');
const NIGHT_SCENE_ASPECT = 850 / 504;

type Scene = 'morning' | 'night' | null;

function greetingForHour(hour: number): string {
  if (hour < 11) return 'おはよう！';
  if (hour < 17) return 'こんにちは！';
  return 'こんばんは！';
}

// The bedroom illustrations only cover the おはよう／こんばんは windows —
// there's no daytime (こんにちは) variant yet, so that stretch of the day
// (and the small pre-dawn sliver of おはよう) falls back to the plain header.
function sceneForHour(hour: number): Scene {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 17) return 'night';
  return null;
}

// Morning/evening show a small decorative sun/moon next to the greeting
// so the screen's mood shifts with the time of day, without wrapping the
// header in its own colored panel.
const MODE_DECOR: Record<'morning' | 'evening', { icon: IconName; cuteKey: CuteIconKey }> = {
  morning: { icon: 'sun', cuteKey: 'morningPrep' },
  evening: { icon: 'moon', cuteKey: 'eveningPrep' },
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
  const scene = sceneForHour(now.getHours());
  const textColor = scene === 'night' ? colors.white : undefined;
  const dateColor = scene === 'night' ? colors.white : colors.textMuted;

  const content = (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <View style={styles.greetLine}>
          {decor ? <CuteIcon iconKey={decor.cuteKey} size={24} fallback={<Icon name={decor.icon} size={24} />} /> : null}
          <AppText variant="hero" color={textColor}>
            {greetingForHour(now.getHours())}
          </AppText>
        </View>
        <AppText variant="body" color={dateColor}>
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

  if (scene) {
    const source = scene === 'morning' ? MORNING_SCENE : NIGHT_SCENE;
    const aspect = scene === 'morning' ? MORNING_SCENE_ASPECT : NIGHT_SCENE_ASPECT;
    return (
      <View style={styles.sceneWrap}>
        <Image
          source={source}
          style={[styles.sceneImage, { width: windowWidth, height: windowWidth / aspect }]}
          resizeMode="cover"
        />
        <View style={styles.sceneOverlay}>{content}</View>
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
  sceneWrap: {
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.sm,
  },
  sceneImage: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  sceneOverlay: {
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
