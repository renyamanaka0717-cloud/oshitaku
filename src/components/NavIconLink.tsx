import { useMemo } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { Icon, IconName } from '@/theme/icons';
import { smallShadow, usePressLedge } from '@/theme';

type Props = {
  icon: IconName;
  label: string;
  tint: string;
  active?: boolean;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NavIconLink({ icon, label, tint, active, onPress }: Props) {
  const styles = useMemo(() => createStyles(), []);
  const { pressIn, pressOut, translate, scale } = usePressLedge(2);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.item, { transform: [{ translateY: translate }, { scale }] }]}
    >
      <Animated.View style={[styles.circle, { backgroundColor: tint }]}>
        <Icon name={icon} size={28} />
      </Animated.View>
      <AppText variant="caption" color={active ? tint : undefined} style={[styles.cap, active ? styles.capActive : null]}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

function createStyles() {
  return StyleSheet.create({
    item: {
      alignItems: 'center',
      gap: 5,
    },
    circle: {
      width: 52,
      height: 52,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      ...smallShadow,
    },
    cap: {
      fontSize: 10.5,
    },
    capActive: {
      fontWeight: '700',
    },
  });
}
