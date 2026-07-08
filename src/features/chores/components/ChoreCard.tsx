import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Chore } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  chore: Chore;
  onPress: () => void;
};

export function ChoreCard({ chore, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.iconBox}>
          <AppText style={styles.icon}>{chore.icon}</AppText>
        </View>

        <AppText variant="subtitle" style={styles.name} numberOfLines={1}>
          {chore.name}
        </AppText>

        <View style={styles.pointBadge}>
          <AppText variant="caption" color={colors.primaryDark}>
            ⭐ +{chore.pointValue}pt
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.sm,
    },
    iconBox: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
      backgroundColor: colors.green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 32,
    },
    name: {
      flex: 1,
    },
    pointBadge: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      paddingVertical: 4,
      paddingHorizontal: spacing.sm,
    },
  });
}
