export type ColorPalette = {
  background: string;
  surface: string;
  surfaceAlt: string;

  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: string;
  accentDark: string;

  pink: string;
  purple: string;
  blue: string;
  green: string;
  yellow: string;
  cream: string;
  mint: string;

  text: string;
  textMuted: string;
  textOnPrimary: string;

  border: string;

  success: string;
  warning: string;
  danger: string;

  timeSafe: string;
  timeWarn: string;
  timeDanger: string;

  shadow: string;

  white: string;
  black: string;
};

// "black" doubles as the bold comic-outline / hard-shadow ink used by the
// pop-art component style (Button, Card, chips). It intentionally stays
// the same near-black in both themes — the vivid accent colors it outlines
// don't invert either, so the ink needs to keep working against both.
const INK = '#8A6A55';

export const lightColors: ColorPalette = {
  background: '#FFF8EA',
  surface: '#FFFFFF',
  surfaceAlt: '#FFEAD2',

  primary: '#FF7A5C',
  primaryDark: '#E3573B',
  secondary: '#7FCFC2',
  secondaryDark: '#4FA396',
  accent: '#E7BE7A',
  accentDark: '#C99A4E',

  pink: '#FFAB91',
  purple: '#D6CBF2',
  blue: '#9AC7EE',
  green: '#8DDB6E',
  yellow: '#F6C445',
  cream: '#F7E8C4',
  mint: '#D9F0E3',

  text: '#4B443D',
  textMuted: '#8F8880',
  textOnPrimary: '#FFFFFF',

  border: '#F0E2D0',

  success: '#3DC47E',
  warning: '#FFB43D',
  danger: '#E8613B',

  // school countdown traffic light
  timeSafe: '#3DC47E',
  timeWarn: '#FFB43D',
  timeDanger: '#E8613B',

  shadow: '#D9A066',

  white: '#FFFFFF',
  black: INK,
};

export const darkColors: ColorPalette = {
  background: '#191410',
  surface: '#241C16',
  surfaceAlt: '#332720',

  primary: '#FF8B70',
  primaryDark: '#FF6A4D',
  secondary: '#7FCFC2',
  secondaryDark: '#4FA396',
  accent: '#E7BE7A',
  accentDark: '#C99A4E',

  pink: '#FFAB91',
  purple: '#D6CBF2',
  blue: '#9AC7EE',
  green: '#8DDB6E',
  yellow: '#F6C445',
  cream: '#F7E8C4',
  mint: '#D9F0E3',

  text: '#F3E9DE',
  textMuted: '#B5A395',
  textOnPrimary: '#FFFFFF',

  border: '#332720',

  success: '#3DC47E',
  warning: '#FFB43D',
  danger: '#E8613B',

  timeSafe: '#3DC47E',
  timeWarn: '#FFB43D',
  timeDanger: '#E8613B',

  shadow: '#000000',

  white: '#FFFFFF',
  black: INK,
};

// Backwards-compatible static export (light palette) for call sites that
// have not been migrated to useTheme() yet.
export const colors = lightColors;

export const subjectPalette = [
  '#FFAB91',
  '#9AC7EE',
  '#8DDB6E',
  '#FFDD6B',
  '#C7BCE6',
  '#7FCFC2',
  '#FF7A5C',
  '#E7BE7A',
];
