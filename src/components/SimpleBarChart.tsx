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

  return (
    <View style={[styles.container, { height: height + 24 }]}>
      {data.map((bar, i) => (
        <View key={i} style={styles.column}>
          <View style={[styles.track, { height }]}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(2, (bar.value / max) * height),
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
    },
    bar: {
      width: '70%',
      borderRadius: radius.sm,
    },
    label: {
      fontSize: 10,
    },
  });
}
