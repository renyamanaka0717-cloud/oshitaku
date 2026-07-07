import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Reward } from '@/db/models';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  reward: Reward | null;
  currentPoints: number;
  onExchange: () => void;
  onClose: () => void;
};

export function RewardDetailModal({ visible, reward, currentPoints, onExchange, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) setConfirming(false);
  }, [visible, reward?.id]);

  const handleClose = () => {
    setConfirming(false);
    onClose();
  };

  if (!reward) return null;
  const canAfford = currentPoints >= reward.pointCost;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {confirming ? (
            <>
              <AppText variant="subtitle" style={styles.center}>
                {reward.pointCost}ポイントで交換する？
              </AppText>
              <View style={styles.confirmRow}>
                <Button
                  label="やめる"
                  variant="ghost"
                  onPress={() => setConfirming(false)}
                  style={styles.confirmButton}
                />
                <Button
                  label="こうかん"
                  onPress={() => {
                    onExchange();
                    handleClose();
                  }}
                  style={styles.confirmButton}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.imageBox}>
                {reward.imageUri ? (
                  <Image source={{ uri: reward.imageUri }} style={styles.image} resizeMode="cover" />
                ) : (
                  <AppText style={styles.icon}>{reward.icon}</AppText>
                )}
              </View>
              <AppText variant="title" style={styles.center}>
                {reward.name}
              </AppText>
              {reward.description ? (
                <AppText variant="body" color={colors.textMuted} style={styles.center}>
                  {reward.description}
                </AppText>
              ) : null}
              <View style={styles.costBadge}>
                <AppText variant="subtitle" color={colors.primaryDark}>
                  ⭐ {reward.pointCost}pt
                </AppText>
              </View>
              {!canAfford ? (
                <AppText variant="caption" color={colors.danger} style={styles.center}>
                  ポイントが足りません
                </AppText>
              ) : null}
              <Button
                label="こうかん"
                onPress={() => setConfirming(true)}
                disabled={!canAfford}
                variant={canAfford ? 'secondary' : 'ghost'}
                style={styles.fullButton}
              />
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      alignItems: 'center',
    },
    imageBox: {
      width: 160,
      height: 160,
      borderRadius: radius.lg,
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
      fontSize: 64,
    },
    center: {
      textAlign: 'center',
    },
    costBadge: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    fullButton: {
      alignSelf: 'stretch',
    },
    confirmRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignSelf: 'stretch',
    },
    confirmButton: {
      flex: 1,
    },
  });
}
