import { useMemo } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { CuteIcon } from '@/components/CuteIcon';
import { Reward } from '@/db/models';
import { cuteIconKeyForEmoji } from '@/theme/cuteIcons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  reward: Reward;
  onPress: () => void;
  pending?: boolean;
};

export function RewardCard({ reward, onPress, pending }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Card style={[styles.card, pending ? styles.cardPending : null]}>
        <View style={styles.imageBox}>
          {reward.imageUri ? (
            <Image source={{ uri: reward.imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <CuteIcon iconKey={cuteIconKeyForEmoji(reward.icon)} size={32} fallback={<AppText style={styles.icon}>{reward.icon}</AppText>} />
          )}
        </View>

        <AppText variant="subtitle" style={styles.name} numberOfLines={1}>
          {reward.name}
        </AppText>

        {pending ? (
          <View style={styles.pendingBadge}>
            <AppText variant="caption" color={colors.textMuted}>
              申請中
            </AppText>
          </View>
        ) : (
          <View style={styles.costBadge}>
            <CuteIcon iconKey="points" size={14} fallback={<AppText style={styles.pointEmoji}>⭐</AppText>} />
            <AppText variant="caption" color={colors.primaryDark}>
              {reward.pointCost}pt
            </AppText>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    pressable: {
      width: '47%',
    },
    card: {
      gap: spacing.xs,
      alignItems: 'center',
      padding: spacing.sm,
    },
    cardPending: {
      opacity: 0.6,
    },
    pendingBadge: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
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
    costBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      paddingVertical: 2,
      paddingHorizontal: spacing.sm,
    },
    pointEmoji: {
      fontSize: 14,
    },
  });
}
