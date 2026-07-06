import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { StampDef } from '@/db/stampCatalog';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  def: StampDef;
  count: number;
};

export function StampBookEntry({ def, count }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const owned = count > 0;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          def.kind === 'rare' ? styles.rare : null,
          def.kind === 'special' ? styles.special : null,
          !owned ? styles.unowned : null,
        ]}
      >
        <AppText style={styles.emoji}>{owned ? def.emoji : '？'}</AppText>
        {owned && count > 1 ? (
          <View style={styles.countBadge}>
            <AppText variant="caption" color={colors.white} style={styles.countText}>
              ×{count}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption" color={owned ? colors.text : colors.textMuted} style={styles.label}>
        {owned ? def.label : '？？？'}
      </AppText>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: {
      width: 78,
      alignItems: 'center',
      gap: 2,
    },
    badge: {
      width: 64,
      height: 64,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rare: {
      backgroundColor: colors.accent,
    },
    special: {
      backgroundColor: colors.purple,
    },
    unowned: {
      backgroundColor: colors.surfaceAlt,
      opacity: 0.6,
    },
    emoji: {
      fontSize: 30,
    },
    countBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: colors.primaryDark,
      borderRadius: radius.round,
      paddingHorizontal: 6,
      paddingVertical: 1,
    },
    countText: {
      fontSize: 11,
    },
    label: {
      textAlign: 'center',
    },
  });
}
