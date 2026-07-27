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
const INK = '#2B1B14';

export const lightColors: ColorPalette = {
  background: '#FFF3E1',
  surface: '#FFFFFF',
  surfaceAlt: '#FFEAD2',

  primary: '#FF7A5C',
  primaryDark: '#E3573B',
  secondary: '#2FD9C4',
  secondaryDark: '#17B39F',
  accent: '#FFC94A',
  accentDark: '#E8A61E',

  pink: '#FF8FC4',
  purple: '#B49CFF',
  blue: '#6FB4FF',
  green: '#8DDB6E',
  yellow: '#FFDD6B',

  text: '#3A2A1F',
  textMuted: '#8C7A6E',
  textOnPrimary: '#FFFFFF',

  border: '#F0E2D0',

  success: '#3DC47E',
  warning: '#FFB43D',
  danger: '#FF5C5C',

  // school countdown traffic light
  timeSafe: '#3DC47E',
  timeWarn: '#FFB43D',
  timeDanger: '#FF5C5C',

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
  secondary: '#2FD9C4',
  secondaryDark: '#17B39F',
  accent: '#FFC94A',
  accentDark: '#E8A61E',

  pink: '#FF8FC4',
  purple: '#B49CFF',
  blue: '#6FB4FF',
  green: '#8DDB6E',
  yellow: '#FFDD6B',

  text: '#F3E9DE',
  textMuted: '#B5A395',
  textOnPrimary: '#FFFFFF',

  border: '#332720',

  success: '#3DC47E',
  warning: '#FFB43D',
  danger: '#FF5C5C',

  timeSafe: '#3DC47E',
  timeWarn: '#FFB43D',
  timeDanger: '#FF5C5C',

  shadow: '#000000',

  white: '#FFFFFF',
  black: INK,
};

// Backwards-compatible static export (light palette) for call sites that
// have not been migrated to useTheme() yet.
export const colors = lightColors;

export const subjectPalette = [
  '#FF8FC4',
  '#6FB4FF',
  '#8DDB6E',
  '#FFDD6B',
  '#B49CFF',
  '#2FD9C4',
  '#FF7A5C',
  '#FFC94A',
];
