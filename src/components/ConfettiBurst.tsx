import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

type Props = {
  active: boolean;
  count?: number;
};

type Particle = {
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  rotation: number;
};

function buildParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }).map((_, i) => ({
    angle: (Math.PI * 2 * i) / count + Math.random() * 0.6,
    distance: 90 + Math.random() * 70,
    size: 6 + Math.random() * 6,
    color: colors[i % colors.length],
    delay: Math.random() * 120,
    rotation: Math.random() * 360,
  }));
}

function ConfettiPiece({ particle, active }: { particle: Particle; active: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
  }, [active, particle.delay, progress]);

  const style = useAnimatedStyle(() => {
    const translateX = progress.value * Math.cos(particle.angle) * particle.distance;
    const translateY = progress.value * Math.sin(particle.angle) * particle.distance;
    const opacity = progress.value < 0.7 ? 1 : 1 - (progress.value - 0.7) / 0.3;
    const rotate = `${progress.value * particle.rotation}deg`;
    return {
      opacity,
      transform: [{ translateX }, { translateY }, { rotate }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 3,
          backgroundColor: particle.color,
        },
        style,
      ]}
    />
  );
}

export function ConfettiBurst({ active, count = 18 }: Props) {
  const { colors } = useTheme();
  const palette = useMemo(
    () => [colors.primary, colors.secondary, colors.accent, colors.pink, colors.purple, colors.green],
    [colors]
  );
  const particles = useMemo(() => buildParticles(count, palette), [count, palette]);

  return (
    <View style={styles.container}>
      {particles.map((particle, i) => (
        <ConfettiPiece key={i} particle={particle} active={active} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
});
