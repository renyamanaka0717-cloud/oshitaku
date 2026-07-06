import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

type Props = {
  label: string;
  icon?: string;
  checked: boolean;
  onToggle: () => void;
};

export function ChecklistItem({ label, icon, checked, onToggle }: Props) {
  const scale = useRef(new Animated.Value(checked ? 1 : 0.8)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: checked ? 1 : 0.8,
      useNativeDriver: true,
      speed: 30,
      bounciness: 12,
    }).start();
  }, [checked, scale]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onToggle();
  };

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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
