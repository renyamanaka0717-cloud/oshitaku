import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { PopScale } from './animations/PopScale';
import { CardFlash } from './animations/CardFlash';
import { FlyingStar } from './animations/FlyingStar';
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
  const [justChecked, setJustChecked] = useState(false);
  const wasChecked = useRef(checked);

  useEffect(() => {
    const becameChecked = checked && !wasChecked.current;
    wasChecked.current = checked;
    if (becameChecked) {
      setJustChecked(true);
      const timer = setTimeout(() => setJustChecked(false), 550);
      return () => clearTimeout(timer);
    }
  }, [checked]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (!checked) playSound('check').catch(() => {});
    onToggle();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.row, checked ? styles.rowChecked : null]}
    >
      <CardFlash trigger={justChecked} flashColor={colors.success} style={styles.flashLayer} />
      {icon ? <AppText style={styles.icon}>{icon}</AppText> : null}
      <AppText variant="subtitle" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.checkbox}>
        <PopScale
          trigger={justChecked}
          restScale={checked ? 1 : 0.8}
          style={[styles.checkboxInner, checked ? styles.checkboxChecked : null]}
        >
          {checked ? <AppText style={styles.check}>✓</AppText> : null}
        </PopScale>
        <FlyingStar trigger={justChecked} emoji="✨" />
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
      overflow: 'hidden',
    },
    rowChecked: {
      backgroundColor: colors.green,
    },
    flashLayer: {
      borderRadius: radius.md,
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
}
