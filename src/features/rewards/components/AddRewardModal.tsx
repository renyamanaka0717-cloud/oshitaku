import { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { pickRewardImage } from '@/features/rewards/imagePicker';
import { ColorPalette, radius, spacing, useTheme } from '@/theme';

type Props = {
  visible: boolean;
  onSave: (input: {
    name: string;
    icon: string;
    description: string;
    pointCost: number;
    imageUri: string | null;
  }) => void;
  onClose: () => void;
};

export function AddRewardModal({ visible, onSave, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎁');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('50');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName('');
      setIcon('🎁');
      setDescription('');
      setCost('50');
      setImageUri(null);
    }
  }, [visible]);

  const handlePickImage = async () => {
    const uri = await pickRewardImage();
    if (uri) setImageUri(uri);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      icon,
      description: description.trim(),
      pointCost: Number(cost) || 0,
      imageUri,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <AppText variant="subtitle" style={styles.title}>
            新しいごほうびを追加
          </AppText>

          <View style={styles.row}>
            <Pressable onPress={handlePickImage} style={styles.imageBox}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              ) : (
                <AppText style={styles.imagePlaceholder}>{icon}</AppText>
              )}
            </Pressable>
            <TextInput value={icon} onChangeText={setIcon} maxLength={2} style={styles.iconInput} />
          </View>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="ごほうびの名前"
            placeholderTextColor={colors.textMuted}
            style={styles.fullInput}
            autoFocus
          />

          <View style={styles.costRow}>
            <TextInput
              value={cost}
              onChangeText={setCost}
              keyboardType="number-pad"
              style={styles.costInput}
            />
            <AppText variant="body" color={colors.textMuted}>
              ポイントで交換
            </AppText>
          </View>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="説明（任意）"
            placeholderTextColor={colors.textMuted}
            style={styles.fullInput}
          />

          <Button label="追加する" onPress={handleSave} disabled={!name.trim()} />
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
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.md,
      overflow: 'hidden',
    },
    title: {
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    imageBox: {
      width: 56,
      height: 56,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imagePlaceholder: {
      fontSize: 24,
    },
    iconInput: {
      width: 56,
      height: 56,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      fontSize: 24,
      color: colors.text,
    },
    fullInput: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
    costRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    costInput: {
      width: 64,
      textAlign: 'center',
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.sm,
      fontSize: 16,
      color: colors.text,
    },
  });
}
