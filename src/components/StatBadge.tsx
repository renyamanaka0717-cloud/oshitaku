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
  const styles = useMemo(() => createStyles(colors), [colors]);
  const bg = color ?? colors.accent;

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

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    badge: {
      flex: 1,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
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
      color: colors.black,
    },
    label: {
      color: colors.black,
      opacity: 0.7,
    },
  });
}
