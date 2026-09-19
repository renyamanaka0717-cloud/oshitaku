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
// pop-art component style (Button, Card, chips).
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
  purple: '#C5B5F0',
  purpleDark: '#7C6FC4',
  blue: '#9AC7EE',
  green: '#8DDB6E',
  yellow: '#F8CC55',
  cream: '#FFF7D6',
  mint: '#E8FFF2',

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
