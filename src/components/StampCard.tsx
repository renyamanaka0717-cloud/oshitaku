import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { ColorPalette, radius, useTheme } from '@/theme';

type Props = {
  emoji: string;
  rare?: boolean;
  size?: number;
};

export function StampCard({ emoji, rare, size = 56 }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.stamp, { width: size, height: size }, rare ? styles.rare : styles.normal]}>
      <AppText style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</AppText>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    stamp: {
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    normal: {
      backgroundColor: colors.surfaceAlt,
    },
    rare: {
      backgroundColor: colors.accent,
    },
    emoji: {},
  });
}
