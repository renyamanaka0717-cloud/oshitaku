import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppText } from './AppText';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Mode = 'morning' | 'evening';

type Props = {
  active: Mode;
};

export function ModeSwitch({ active }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const goTo = (mode: Mode) => {
    if (mode === active) return;
    router.replace(mode === 'morning' ? '/child/morning' : '/child/evening');
  };

  return (
    <View style={styles.pill}>
      <Pressable
        style={[styles.option, active === 'morning' ? styles.optionActive : null]}
        onPress={() => goTo('morning')}
        hitSlop={6}
      >
        <AppText style={styles.icon}>☀️</AppText>
      </Pressable>
      <Pressable
        style={[styles.option, active === 'evening' ? styles.optionActive : null]}
        onPress={() => goTo('evening')}
        hitSlop={6}
      >
        <AppText style={styles.icon}>🌙</AppText>
      </Pressable>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    pill: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      padding: 3,
      gap: 2,
    },
    option: {
      width: 34,
      height: 34,
      borderRadius: radius.round,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionActive: {
      backgroundColor: colors.surface,
    },
    icon: {
      fontSize: 16,
    },
  });
}
