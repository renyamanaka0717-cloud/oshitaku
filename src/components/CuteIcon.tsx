import { ReactNode } from 'react';
import { Image } from 'react-native';
import { CUTE_ICON_SOURCES, CuteIconKey } from '@/theme/cuteIcons';

type Props = {
  iconKey?: CuteIconKey;
  size?: number;
  // What to render until this key has a registered Icons8 Cute Color
  // image — the current emoji or vector <Icon>, so nothing changes
  // visually until real artwork is dropped in.
  fallback: ReactNode;
};

export function CuteIcon({ iconKey, size = 40, fallback }: Props) {
  const source = iconKey ? CUTE_ICON_SOURCES[iconKey] : undefined;
  if (!source) return <>{fallback}</>;
  return <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />;
}
