import { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ColorPalette, radius, useTheme } from '@/theme';

type Props = {
  progress: number; // 0..1
  color?: string;
  height?: number;
};

export function ProgressBar({ progress, color, height = 16 }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tint = color ?? colors.primary;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress, anim]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          { width, height, borderRadius: height / 2, backgroundColor: tint },
        ]}
      />
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    track: {
      width: '100%',
      backgroundColor: colors.surfaceAlt,
      overflow: 'hidden',
    },
    fill: {
      borderRadius: radius.round,
    },
  });
}
