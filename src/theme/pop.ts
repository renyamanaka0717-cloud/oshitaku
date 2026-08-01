// Shape language for the bold-outline / sticker-shadow visual style:
// thick comic ink borders, hard (non-blurred) offset shadows, and a
// bottom "bevel" ledge on buttons for a chunky, pressable feel.
export const outlineWidth = 2;

export const hardShadow = {
  offset: 3,
  offsetSm: 2,
};

// Darkens a hex color by mixing it toward black, used to derive a
// button's bevel/pressed-shadow shade from its own fill color instead of
// hand-picking a "deep" variant for every accent.
export function darken(hex: string, amount = 0.22): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c * (1 - amount));
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}
