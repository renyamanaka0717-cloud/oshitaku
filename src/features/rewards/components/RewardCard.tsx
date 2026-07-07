import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Reward } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  reward: Reward;
  currentPoints: number;
  onExchange: () => void;
};

export function RewardCard({ reward, currentPoints, onExchange }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const canAfford = currentPoints >= reward.pointCost;

  return (
    <Card style={styles.card}>
      <View style={styles.imageBox}>
        {reward.imageUri ? (
          <Image source={{ uri: reward.imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <AppText style={styles.icon}>{reward.icon}</AppText>
        )}
      </View>

      <AppText variant="subtitle" style={styles.name} numberOfLines={1}>
        {reward.name}
      </AppText>
      {reward.description ? (
        <AppText variant="caption" color={colors.textMuted} numberOfLines={2} style={styles.description}>
          {reward.description}
        </AppText>
      ) : null}

      <View style={styles.costBadge}>
        <AppText variant="caption" color={colors.primaryDark}>
          ⭐ {reward.pointCost}pt
        </AppText>
      </View>

      <Button
        label="こうかん"
        onPress={onExchange}
        disabled={!canAfford}
        variant={canAfford ? 'secondary' : 'ghost'}
        style={styles.button}
      />
    </Card>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    card: {
      width: '47%',
      gap: spacing.xs,
      alignItems: 'center',
      padding: spacing.sm,
    },
    imageBox: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    icon: {
      fontSize: 32,
    },
    name: {
      alignSelf: 'stretch',
    },
    description: {
      alignSelf: 'stretch',
    },
    costBadge: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
    },
    button: {
      alignSelf: 'stretch',
      marginTop: spacing.xs,
    },
  });
}
