import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { ColorPalette, radius, useTheme } from '@/theme';
import { WEEKDAY_LABELS_JA } from '@/utils/date';

type Props = {
  value: number[];
  onChange: (next: number[]) => void;
};

export function WeekdayChips({ value, onChange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const toggle = (day: number) => {
    const active = value.includes(day);
    const next = active ? value.filter((d) => d !== day) : [...value, day].sort();
    onChange(next);
  };

  return (
    <View style={styles.row}>
      {WEEKDAY_LABELS_JA.map((label, day) => {
        const active = value.includes(day);
        return (
          <Pressable
            key={day}
            style={[styles.chip, active ? styles.chipActive : null]}
            onPress={() => toggle(day)}
          >
            <AppText variant="caption" color={active ? colors.white : colors.textMuted}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 4,
    },
    chip: {
      width: 28,
      height: 28,
      borderRadius: radius.round,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
    },
    chipActive: {
      backgroundColor: colors.secondaryDark,
    },
  });
}
