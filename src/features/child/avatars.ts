import { IconName } from '@/theme/icons';

export const AVATAR_OPTIONS: { emoji: string; icon: IconName }[] = [
  { emoji: '🐣', icon: 'chick' },
  { emoji: '🐻', icon: 'bear' },
  { emoji: '🐰', icon: 'rabbit' },
  { emoji: '🐱', icon: 'cat' },
  { emoji: '🦊', icon: 'fox' },
  { emoji: '🐶', icon: 'dog' },
  { emoji: '🐼', icon: 'panda' },
  { emoji: '🦁', icon: 'lion' },
];

export const AVATAR_EMOJIS = AVATAR_OPTIONS.map((a) => a.emoji);

const AVATAR_ICON_MAP: Record<string, IconName> = Object.fromEntries(
  AVATAR_OPTIONS.map((a) => [a.emoji, a.icon])
);

export function avatarIconFor(emoji: string): IconName | undefined {
  return AVATAR_ICON_MAP[emoji];
}
