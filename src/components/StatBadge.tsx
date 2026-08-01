import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { PressableCard } from './PressableCard';
import { ColorPalette, hardShadow, outlineWidth, radius, spacing, useTheme } from '@/theme';

type Props = {
  icon: string | React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  onPress?: () => void;
  valueVariant?: 'title' | 'subtitle';
};

export function StatBadge({ icon, value, label, color, onPress, valueVariant = 'title' }: Props) {
  const { colors } = useTheme();
  const bg = color ?? colors.accent;
  // Neutral surfaces (white/cream) invert with the theme, so their text
  // must too; the vivid accent colors intentionally don't invert, so
  // their text stays fixed ink for contrast either way.
  const isNeutral = bg === colors.surface || bg === colors.surfaceAlt || bg === colors.background;
  const styles = useMemo(() => createStyles(colors, isNeutral), [colors, isNeutral]);

  const content = (
    <>
      {typeof icon === 'string' ? <AppText style={styles.icon}>{icon}</AppText> : icon}
      <AppText variant={valueVariant} style={styles.value} numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </>
  );

  if (onPress) {
    return (
      <PressableCard backgroundColor={bg} onPress={onPress} style={styles.badge}>
        {content}
      </PressableCard>
    );
  }

  return <View style={[styles.badge, styles.staticBadge, { backgroundColor: bg }]}>{content}</View>;
}

function createStyles(colors: ColorPalette, isNeutral: boolean) {
  return StyleSheet.create({
    badge: {
      flex: 1,
      borderRadius: radius.lg,
      aspectRatio: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    staticBadge: {
      borderWidth: outlineWidth,
      borderColor: colors.black,
      borderBottomWidth: outlineWidth + hardShadow.offset,
      borderRightWidth: outlineWidth + hardShadow.offset,
    },
    icon: {
      fontSize: 26,
    },
    value: {
      color: isNeutral ? colors.text : colors.black,
    },
    label: {
      color: isNeutral ? colors.textMuted : colors.black,
      opacity: isNeutral ? 1 : 0.7,
    },
  });
}
