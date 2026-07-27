import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Child } from '@/db/models';
import { AppText } from '@/components/AppText';
import { ChildAvatar } from '@/features/child/components/ChildAvatar';
import { getSuggestedMode } from '@/features/home/timeMode';
import { Icon, IconName } from '@/theme/icons';
import { ColorPalette, hardShadow, outlineWidth, radius, spacing, useTheme } from '@/theme';
import { formatJapaneseDate } from '@/utils/date';

function greetingForHour(hour: number): string {
  if (hour < 11) return 'おはよう！';
  if (hour < 17) return 'こんにちは！';
  return 'こんばんは！';
}

// Morning/evening get a soft gradient band behind the greeting so the
// screen's mood shifts with the time of day, without changing the rest
// of the design system's shapes or components.
const MODE_THEME = {
  morning: {
    gradient: ['#FFE49A', '#FFF3E1'] as const,
    textColor: undefined as string | undefined,
    subColor: undefined as string | undefined,
    decor: 'sun' as IconName,
  },
  evening: {
    gradient: ['#4B3F8F', '#221B47'] as const,
    textColor: '#FFFFFF',
    subColor: 'rgba(255,255,255,0.78)',
    decor: 'moon' as IconName,
  },
};

type Props = {
  child: Child;
  onPressAvatar: () => void;
};

export function GreetingHeader({ child, onPressAvatar }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const now = new Date();
  const mode = getSuggestedMode(now);
  const theme = mode ? MODE_THEME[mode] : null;

  const inner = (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <View style={styles.greetLine}>
          {theme ? <Icon name={theme.decor} size={24} /> : null}
          <AppText variant="hero" color={theme?.textColor}>
            {greetingForHour(now.getHours())}
          </AppText>
        </View>
        <AppText variant="body" color={theme?.subColor ?? colors.textMuted}>
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

  if (!theme) return inner;

  return (
    <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
      {inner}
    </LinearGradient>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    banner: {
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: outlineWidth,
      borderColor: colors.black,
      borderBottomWidth: outlineWidth + hardShadow.offset,
      borderRightWidth: outlineWidth + hardShadow.offset,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
}
