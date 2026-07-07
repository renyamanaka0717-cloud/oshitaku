import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Bar = {
  label: string;
  value: number;
};

type Props = {
  data: Bar[];
  color?: string;
  height?: number;
};

export function SimpleBarChart({ data, color, height = 100 }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tint = color ?? colors.secondary;
  const max = Math.max(1, ...data.map((d) => d.value));
  const barAreaHeight = height - 16;

  return (
    <View style={[styles.container, { height: height + 24 }]}>
      {data.map((bar, i) => (
        <View key={i} style={styles.column}>
          <View style={[styles.track, { height }]}>
            <AppText
              variant="caption"
              style={styles.value}
              color={bar.value > 0 ? tint : colors.textMuted}
              numberOfLines={1}
            >
              {bar.value}
            </AppText>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(2, (bar.value / max) * barAreaHeight),
                  backgroundColor: bar.value > 0 ? tint : colors.surfaceAlt,
                },
              ]}
            />
          </View>
          <AppText variant="caption" style={styles.label} numberOfLines={1}>
            {bar.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 4,
    },
    column: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    track: {
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: 2,
    },
    bar: {
      width: '70%',
      borderRadius: radius.sm,
    },
    value: {
      fontSize: 10,
    },
    label: {
      fontSize: 10,
    },
  });
}
