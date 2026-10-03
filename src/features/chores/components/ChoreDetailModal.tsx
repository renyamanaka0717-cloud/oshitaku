import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { CuteIcon } from '@/components/CuteIcon';
import { Chore } from '@/db/models';
import { cuteIconKeyForEmoji } from '@/theme/cuteIcons';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  chore: Chore | null;
  pending?: boolean;
  onComplete: () => void;
  onClose: () => void;
};

export function ChoreDetailModal({ visible, chore, pending, onComplete, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (visible) setConfirming(false);
  }, [visible, chore?.id]);

  const handleClose = () => {
    setConfirming(false);
    onClose();
  };

  if (!chore) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {confirming ? (
            <>
              <AppText variant="subtitle" style={styles.center}>
                {pending ? `「${chore.name}」をもういちどおねがいする？` : `「${chore.name}」をしんせいする？`}
              </AppText>
              <View style={styles.confirmRow}>
                <View style={styles.confirmButtonWrap}>
                  <Button label="やめる" variant="ghost" onPress={() => setConfirming(false)} />
                </View>
                <View style={styles.confirmButtonWrap}>
                  <Button
                    label={pending ? 'おねがいする' : 'しんせいする'}
                    onPress={() => {
                      onComplete();
                      handleClose();
                    }}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.iconBox}>
                <CuteIcon iconKey={cuteIconKeyForEmoji(chore.icon)} size={64} fallback={<AppText style={styles.icon}>{chore.icon}</AppText>} />
              </View>
              <AppText variant="title" style={styles.center}>
                {chore.name}
              </AppText>
              <View style={styles.pointBadge}>
                <CuteIcon iconKey="points" size={18} fallback={<AppText style={styles.pointEmoji}>⭐</AppText>} />
                <AppText variant="subtitle" color={colors.primaryDark}>
                  +{chore.pointValue}pt
                </AppText>
              </View>
              {pending ? (
                <AppText variant="caption" color={colors.textMuted} style={styles.center}>
                  すでにしんせいちゅうだよ。おうちの人をまだまってるなら、もういちどおねがいできるよ
                </AppText>
              ) : null}
              <View style={styles.fullButtonWrap}>
                <Button label={pending ? 'もういちどおねがいする' : 'しんせいする'} onPress={() => setConfirming(true)} />
              </View>
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    sheet: {
      width: '100%',
      maxWidth: 320,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      alignItems: 'center',
    },
    iconBox: {
      width: 160,
      height: 160,
      borderRadius: radius.lg,
      backgroundColor: colors.green,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 64,
    },
    center: {
      textAlign: 'center',
    },
    pointBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.round,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
    },
    pointEmoji: {
      fontSize: 18,
    },
    fullButtonWrap: {
      alignSelf: 'stretch',
    },
    confirmRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignSelf: 'stretch',
    },
    confirmButtonWrap: {
      flex: 1,
    },
  });
}
