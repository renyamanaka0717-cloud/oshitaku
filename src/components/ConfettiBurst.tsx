import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
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
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      progress.setValue(0);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      delay: particle.delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [active, particle.delay, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.cos(particle.angle) * particle.distance],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.sin(particle.angle) * particle.distance],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [1, 1, 0],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${particle.rotation}deg`],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 3,
        backgroundColor: particle.color,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
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
