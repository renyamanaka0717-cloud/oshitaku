import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';
import { playSound } from '@/features/sound/soundService';

type Props = {
  label: string;
  icon?: string;
  checked: boolean;
  onToggle: () => void;
};

export function ChecklistItem({ label, icon, checked, onToggle }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const scale = useRef(new Animated.Value(checked ? 1 : 0.8)).current;
  const sparkle = useRef(new Animated.Value(0)).current;
  const [showSparkle, setShowSparkle] = useState(false);
  const wasChecked = useRef(checked);

  useEffect(() => {
    const justChecked = checked && !wasChecked.current;
    wasChecked.current = checked;

    if (justChecked) {
      // Pop past 1.0 then settle, for a bouncier checkmark.
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 120, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 14 }),
      ]).start();

      setShowSparkle(true);
      sparkle.setValue(0);
      Animated.timing(sparkle, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
        setShowSparkle(false);
      });
    } else {
      Animated.spring(scale, {
        toValue: checked ? 1 : 0.8,
        useNativeDriver: true,
        speed: 30,
        bounciness: 12,
      }).start();
    }
  }, [checked, scale, sparkle]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (!checked) playSound('check').catch(() => {});
    onToggle();
  };

  const sparkleScale = sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.6] });
  const sparkleOpacity = sparkle.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] });

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.row, checked ? styles.rowChecked : null]}
    >
      {icon ? <AppText style={styles.icon}>{icon}</AppText> : null}
      <AppText variant="subtitle" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.checkbox}>
        <Animated.View
          style={[
            styles.checkboxInner,
            checked ? styles.checkboxChecked : null,
            { transform: [{ scale }] },
          ]}
        >
          {checked ? <AppText style={styles.check}>✓</AppText> : null}
        </Animated.View>
        {showSparkle ? (
          <Animated.Text
            style={[
              styles.sparkle,
              { opacity: sparkleOpacity, transform: [{ scale: sparkleScale }] },
            ]}
          >
            ✨
          </Animated.Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    rowChecked: {
      backgroundColor: colors.green,
    },
    icon: {
      fontSize: 28,
    },
    label: {
      flex: 1,
    },
    checkbox: {
      width: 36,
      height: 36,
      borderRadius: radius.round,
      borderWidth: 3,
      borderColor: colors.white,
      backgroundColor: 'rgba(255,255,255,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxInner: {
      width: 30,
      height: 30,
      borderRadius: radius.round,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.success,
    },
    check: {
      color: colors.white,
      fontSize: 18,
      fontWeight: '900',
    },
    sparkle: {
      position: 'absolute',
      fontSize: 22,
      top: -10,
      right: -10,
    },
  });
}
