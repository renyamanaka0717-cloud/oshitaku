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
  accentPink: string;
  purple: string;
  purpleDark: string;
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
// pop-art component style (Button, Card, chips). Kept as a warm charcoal
// instead of true black or a muddy brown, so outlines read as crisp rather
// than heavy.
const INK = '#756B65';

export const lightColors: ColorPalette = {
  background: '#FFF9ED',
  surface: '#FFFFFF',
  surfaceAlt: '#FFEFE3',

  primary: '#FF6B55',
  primaryDark: '#E8503A',
  secondary: '#7FCFC2',
  secondaryDark: '#4FA396',
  accent: '#E7BE7A',
  accentDark: '#C99A4E',

  pink: '#FFAB91',
  accentPink: '#FF4F81',
  purple: '#C9B8FF',
  purpleDark: '#7C6CE0',
  blue: '#9AC7EE',
  green: '#91E47A',
  yellow: '#FFD84D',
  cream: '#FFF7D6',
  mint: '#E8FFF2',

  text: '#34313F',
  textMuted: '#8B8894',
  textOnPrimary: '#FFFFFF',

  border: '#F3E7D6',

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

// Backwards-compatible static export for call sites that have not been
// migrated to useTheme() yet. The app is light-mode only.
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
