import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';

type Props = {
  avatarImageUri?: string | null;
  avatarEmoji: string;
  avatarColor: string;
  size?: number;
};

export function ChildAvatar({ avatarImageUri, avatarEmoji, avatarColor, size = 64 }: Props) {
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (avatarImageUri) {
    return (
      <Image source={{ uri: avatarImageUri }} style={dimension} resizeMode="cover" fadeDuration={0} />
    );
  }

  return (
    <View style={[styles.emojiCircle, dimension, { backgroundColor: avatarColor }]}>
      <AppText style={{ fontSize: size * 0.5 }}>{avatarEmoji}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
