import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { CuteIcon } from './CuteIcon';
import { CuteIconKey } from '@/theme/cuteIcons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Option = { emoji: string; key: CuteIconKey };

type Props = {
  options: Option[];
  value: string;
  onSelect: (emoji: string) => void;
};

export function CuteIconPicker({ options, value, onSelect }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {options.map((option) => (
        <Pressable
          key={option.emoji}
          onPress={() => onSelect(option.emoji)}
          style={[styles.chip, value === option.emoji ? styles.chipSelected : null]}
        >
          <CuteIcon iconKey={option.key} size={28} fallback={<AppText style={styles.fallback}>{option.emoji}</AppText>} />
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
    fallback: {
      fontSize: 20,
    },
  });
}
