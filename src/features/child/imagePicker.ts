import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export async function pickChildAvatarImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];

  // expo-file-system's persistent storage API isn't available on web; the
  // picked asset URI (a blob/data URL) is already usable directly there.
  if (Platform.OS === 'web') return asset.uri;

  const { Directory, File, Paths } = await import('expo-file-system');
  const avatarsDir = new Directory(Paths.document, 'avatars');
  avatarsDir.create({ intermediates: true, idempotent: true });

  const ext = asset.uri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const sourceFile = new File(asset.uri);
  const destFile = new File(avatarsDir, `avatar-${Date.now()}.${ext}`);
  await sourceFile.copy(destFile);
  return destFile.uri;
}
