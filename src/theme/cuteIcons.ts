import { ImageSourcePropType } from 'react-native';

// Icons8 "Cute Color" icon keys (https://icons8.com/icons/dusk--author-made-by-made).
// Task icons (rendered on task cards/checklists) and menu icons (rendered
// on nav links/section headers) share one registry so both can be swapped
// in incrementally as real PNGs are dropped into assets/icons/cute/.
export type CuteIconKey =
  // task icons
  | 'washFace'
  | 'toothbrush'
  | 'breakfast'
  | 'getDressed'
  | 'schoolBag'
  | 'shoes'
  | 'toilet'
  | 'pajamas'
  | 'homework'
  | 'waterBottle'
  | 'handkerchief'
  | 'tomorrowClothes'
  | 'bath'
  | 'hairDryer'
  // menu icons
  | 'morningPrep'
  | 'eveningPrep'
  | 'chores'
  | 'rewards'
  | 'calendar'
  | 'points'
  | 'home'
  | 'stats'
  | 'settings'
  | 'schoolBuilding'
  | 'schoolItem'
  // avatar icons
  | 'avatarChick'
  | 'avatarBear'
  | 'avatarRabbit'
  | 'avatarCat'
  | 'avatarFox'
  | 'avatarDog'
  | 'avatarPanda'
  | 'avatarLion';

// One `require()` line per icon that has an actual file yet — Metro needs
// a static require for bundling, so this can't be built from a filename
// string at runtime. Add a line here (see assets/icons/cute/README.md)
// whenever a new Cute Color PNG is dropped in; every call site already
// renders through <CuteIcon>, so nothing else needs to change.
export const CUTE_ICON_SOURCES: Partial<Record<CuteIconKey, ImageSourcePropType>> = {
  washFace: require('@/assets/icons/cute/wash-face.png'),
  toothbrush: require('@/assets/icons/cute/toothbrush.png'),
  breakfast: require('@/assets/icons/cute/breakfast.png'),
  getDressed: require('@/assets/icons/cute/get-dressed.png'),
  schoolBag: require('@/assets/icons/cute/school-bag.png'),
  shoes: require('@/assets/icons/cute/shoes.png'),
  toilet: require('@/assets/icons/cute/toilet.png'),
  pajamas: require('@/assets/icons/cute/pajamas.png'),
  homework: require('@/assets/icons/cute/homework.png'),
  waterBottle: require('@/assets/icons/cute/water-bottle.png'),
  handkerchief: require('@/assets/icons/cute/handkerchief.png'),
  tomorrowClothes: require('@/assets/icons/cute/tomorrow-clothes.png'),
  bath: require('@/assets/icons/cute/bath.png'),
  hairDryer: require('@/assets/icons/cute/hair-dryer.png'),
  morningPrep: require('@/assets/icons/cute/morning-prep.png'),
  eveningPrep: require('@/assets/icons/cute/evening-prep.png'),
  chores: require('@/assets/icons/cute/chores.png'),
  rewards: require('@/assets/icons/cute/rewards.png'),
  calendar: require('@/assets/icons/cute/calendar.png'),
  points: require('@/assets/icons/cute/points.png'),
  home: require('@/assets/icons/cute/home.png'),
  stats: require('@/assets/icons/cute/stats.png'),
  settings: require('@/assets/icons/cute/settings.png'),
  schoolBuilding: require('@/assets/icons/cute/school-building.png'),
  schoolItem: require('@/assets/icons/cute/school-item.png'),
  avatarChick: require('@/assets/icons/cute/avatar-chick.png'),
  avatarBear: require('@/assets/icons/cute/avatar-bear.png'),
  avatarRabbit: require('@/assets/icons/cute/avatar-rabbit.png'),
  avatarCat: require('@/assets/icons/cute/avatar-cat.png'),
  avatarFox: require('@/assets/icons/cute/avatar-fox.png'),
  avatarDog: require('@/assets/icons/cute/avatar-dog.png'),
  avatarPanda: require('@/assets/icons/cute/avatar-panda.png'),
  avatarLion: require('@/assets/icons/cute/avatar-lion.png'),
};

// Best-effort bridge from the free-text emoji stored on existing morning/
// evening tasks (see taskRepository.DEFAULT_MORNING_TASKS/DEFAULT_EVENING_TASKS)
// to a Cute Color key, so tasks created before this system existed pick up
// the new icon automatically once it's registered above.
export const TASK_ICON_KEY_BY_EMOJI: Record<string, CuteIconKey> = {
  '🧼': 'washFace',
  '🪥': 'toothbrush',
  '🍞': 'breakfast',
  '👕': 'getDressed',
  '🎒': 'schoolBag',
  '✏️': 'homework',
  '🧴': 'waterBottle',
  '🧻': 'handkerchief',
  '👚': 'tomorrowClothes',
  '🩱': 'pajamas',
  '🛁': 'bath',
  '💨': 'hairDryer',
  '👟': 'shoes',
  '🚽': 'toilet',
};

// Same idea for persistent items (itemRepository's default new-item emoji).
export const ITEM_ICON_KEY_BY_EMOJI: Record<string, CuteIconKey> = {
  '📦': 'schoolItem',
};

// Menu/nav icon concepts (rendered via a fixed cuteKey prop at each call
// site, not stored as free-text emoji) still need a representative emoji so
// they can appear as icon-picker options and be recognized if a task/item
// ends up using one.
export const MENU_ICON_KEY_BY_EMOJI: Record<string, CuteIconKey> = {
  '☀️': 'morningPrep',
  '🌙': 'eveningPrep',
  '🧹': 'chores',
  '🎁': 'rewards',
  '📅': 'calendar',
  '🪙': 'points',
  '🏠': 'home',
  '📊': 'stats',
  '⚙️': 'settings',
  '🏫': 'schoolBuilding',
};

// Same idea for the fixed avatar picker (features/child/avatars.ts).
export const AVATAR_ICON_KEY_BY_EMOJI: Record<string, CuteIconKey> = {
  '🐣': 'avatarChick',
  '🐻': 'avatarBear',
  '🐰': 'avatarRabbit',
  '🐱': 'avatarCat',
  '🦊': 'avatarFox',
  '🐶': 'avatarDog',
  '🐼': 'avatarPanda',
  '🦁': 'avatarLion',
};

export function cuteIconKeyForAvatarEmoji(emoji: string | undefined | null): CuteIconKey | undefined {
  if (!emoji) return undefined;
  return AVATAR_ICON_KEY_BY_EMOJI[emoji];
}

// Every registered icon's emoji → key, merged from every domain above — the
// full set a task or item can be given, so the icon picker offers everything
// that's been made, not just each domain's "own" icons.
export const ALL_ICON_KEY_BY_EMOJI: Record<string, CuteIconKey> = {
  ...TASK_ICON_KEY_BY_EMOJI,
  ...ITEM_ICON_KEY_BY_EMOJI,
  ...MENU_ICON_KEY_BY_EMOJI,
  ...AVATAR_ICON_KEY_BY_EMOJI,
};

export function cuteIconKeyForEmoji(emoji: string | undefined | null): CuteIconKey | undefined {
  if (!emoji) return undefined;
  return ALL_ICON_KEY_BY_EMOJI[emoji];
}

export function cuteIconKeyForTaskEmoji(emoji: string | undefined | null): CuteIconKey | undefined {
  return cuteIconKeyForEmoji(emoji);
}

export function cuteIconKeyForItemEmoji(emoji: string | undefined | null): CuteIconKey | undefined {
  return cuteIconKeyForEmoji(emoji);
}

// Picker options for task/item icon-selection UI (parent-mode editing) — the
// full registered set, in the same order as ALL_ICON_KEY_BY_EMOJI above.
export const ALL_ICON_OPTIONS: Array<{ emoji: string; key: CuteIconKey }> = Object.entries(
  ALL_ICON_KEY_BY_EMOJI,
).map(([emoji, key]) => ({ emoji, key }));
