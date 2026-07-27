import { useMemo } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { Icon, IconName } from '@/theme/icons';
import { ColorPalette, outlineWidth, useTheme, usePressLedge } from '@/theme';

type Props = {
  icon: IconName;
  label: string;
  tint: string;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NavIconLink({ icon, label, tint, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { pressIn, pressOut, translate, ledge, scale } = usePressLedge(outlineWidth - 1, 3);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.item, { transform: [{ translateX: translate }, { translateY: translate }, { scale }] }]}
    >
      <Animated.View
        style={[
          styles.circle,
          { backgroundColor: tint, borderBottomWidth: ledge, borderRightWidth: ledge },
        ]}
      >
        <Icon name={icon} size={28} />
      </Animated.View>
      <AppText variant="caption" style={styles.cap}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    item: {
      alignItems: 'center',
      gap: 5,
    },
    circle: {
      width: 52,
      height: 52,
      borderRadius: 999,
      borderWidth: outlineWidth - 1,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cap: {
      fontSize: 10.5,
    },
  });
}
