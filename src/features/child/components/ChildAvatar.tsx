import { Image, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Icon } from '@/theme/icons';
import { avatarIconFor } from '@/features/child/avatars';
import { useTheme } from '@/theme';

type Props = {
  avatarImageUri?: string | null;
  avatarEmoji: string;
  avatarColor: string;
  size?: number;
};

export function ChildAvatar({ avatarImageUri, avatarEmoji, avatarColor, size = 64 }: Props) {
  const { colors } = useTheme();
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (avatarImageUri) {
    return (
      <Image
        source={{ uri: avatarImageUri }}
        style={[dimension, styles.outline, { borderColor: colors.black }]}
        resizeMode="cover"
        fadeDuration={0}
      />
    );
  }

  const iconName = avatarIconFor(avatarEmoji);

  return (
    <View
      style={[
        styles.emojiCircle,
        dimension,
        styles.outline,
        { backgroundColor: avatarColor, borderColor: colors.black },
      ]}
    >
      {iconName ? (
        <Icon name={iconName} size={size * 0.56} />
      ) : (
        <AppText style={{ fontSize: size * 0.5 }}>{avatarEmoji}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  emojiCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    borderWidth: 2.5,
  },
});
