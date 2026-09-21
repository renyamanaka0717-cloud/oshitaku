// Shape language: soft, floaty "native app / kids game" cards instead of
// thick comic-ink borders. Hierarchy comes from background color, soft
// drop shadows, and a hairline highlight border — not heavy outlines.

// A very thin, barely-there border some white cards keep for definition
// against light backgrounds (paired with a soft shadow, not a colored
// outline).
export const hairline = 1;

// Soft, diffuse shadow for big surface cards (hero cards, panels).
export const cardShadow = {
  shadowColor: '#4B3F73',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 5,
};

// Lighter shadow for small chips/tiles/nav icons.
export const smallShadow = {
  shadowColor: '#4B3F73',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 2,
};

// How far a "puffy" button's darker base layer peeks out below its top
// face — the depth a button sinks by when pressed.
export const buttonDepth = 5;

// Kept for the handful of small bespoke chip buttons (e.g. header "＋
//追加" pills) that still use a border ledge rather than the soft-shadow
// system above; new UI should prefer cardShadow/smallShadow/buttonDepth.
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
