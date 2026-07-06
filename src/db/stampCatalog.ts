import { StampKind } from './models';

export type StampDef = {
  id: string;
  emoji: string;
  label: string;
  kind: StampKind;
};

export const STAMP_CATALOG: StampDef[] = [
  // normal — awarded for completing morning or evening prep
  { id: 'star', emoji: '⭐', label: 'ほし', kind: 'normal' },
  { id: 'flower', emoji: '🌸', label: 'はな', kind: 'normal' },
  { id: 'sun', emoji: '☀️', label: 'たいよう', kind: 'normal' },
  { id: 'moon', emoji: '🌙', label: 'つき', kind: 'normal' },
  { id: 'leaf', emoji: '🍀', label: 'クローバー', kind: 'normal' },
  { id: 'backpack', emoji: '🎒', label: 'ランドセル', kind: 'normal' },

  // rare — awarded for finishing before the parent-set deadline
  { id: 'rainbow', emoji: '🌈', label: 'にじ', kind: 'rare' },
  { id: 'crown', emoji: '👑', label: 'おうかん', kind: 'rare' },
  { id: 'diamond', emoji: '💎', label: 'ほうせき', kind: 'rare' },
  { id: 'party', emoji: '🎉', label: 'クラッカー', kind: 'rare' },
  { id: 'trophy', emoji: '🏆', label: 'トロフィー', kind: 'rare' },

  // special — awarded for whole-day achievements
  { id: 'perfect', emoji: '✨', label: 'パーフェクト', kind: 'special' },
  { id: 'streak', emoji: '🌟', label: 'れんぞくたっせい', kind: 'special' },
  { id: 'ontime_crown', emoji: '👑', label: 'じかんないたっせい', kind: 'special' },
];

export const STAMP_CATALOG_BY_ID: Record<string, StampDef> = Object.fromEntries(
  STAMP_CATALOG.map((s) => [s.id, s])
);

export const NORMAL_STAMP_TYPES = STAMP_CATALOG.filter((s) => s.kind === 'normal').map((s) => s.id);
export const RARE_STAMP_TYPES = STAMP_CATALOG.filter((s) => s.kind === 'rare').map((s) => s.id);
export const SPECIAL_STAMP_TYPES = STAMP_CATALOG.filter((s) => s.kind === 'special').map((s) => s.id);

export function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}
