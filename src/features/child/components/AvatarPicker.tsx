import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { CuteIcon } from '@/components/CuteIcon';
import { Icon } from '@/theme/icons';
import { AVATAR_OPTIONS } from '@/features/child/avatars';
import { cuteIconKeyForAvatarEmoji } from '@/theme/cuteIcons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  value: string;
  onSelect: (emoji: string) => void;
  onPickPhoto?: () => void;
};

export function AvatarPicker({ value, onSelect, onPickPhoto }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {onPickPhoto ? (
        <Pressable onPress={onPickPhoto} style={styles.chip} hitSlop={4}>
          <AppText style={styles.cameraIcon}>📷</AppText>
        </Pressable>
      ) : null}
      {AVATAR_OPTIONS.map((a) => (
        <Pressable
          key={a.emoji}
          onPress={() => onSelect(a.emoji)}
          style={[styles.chip, value === a.emoji ? styles.chipSelected : null]}
        >
          <CuteIcon iconKey={cuteIconKeyForAvatarEmoji(a.emoji)} size={32} fallback={<Icon name={a.icon} size={28} />} />
        </Pressable>
      ))}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      padding: spacing.sm,
      borderRadius: radius.round,
      backgroundColor: colors.surfaceAlt,
    },
    chipSelected: {
      backgroundColor: colors.accent,
    },
    cameraIcon: {
      fontSize: 20,
    },
  });
}
