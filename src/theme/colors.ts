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

export const lightColors: ColorPalette = {
  background: '#FFF6E9',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF0DD',

  primary: '#FF9F6B',
  primaryDark: '#F5794A',
  secondary: '#7FD8C6',
  secondaryDark: '#4FC3AC',
  accent: '#FFD166',
  accentDark: '#F0B429',

  pink: '#FFB6C9',
  purple: '#C6B8FF',
  blue: '#9AD1FF',
  green: '#B7E8A8',
  yellow: '#FFE38A',

  text: '#5A4A42',
  textMuted: '#9C8A80',
  textOnPrimary: '#FFFFFF',

  border: '#F0E2D0',

  success: '#6FCF97',
  warning: '#FFC24B',
  danger: '#FF6F6F',

  // school countdown traffic light
  timeSafe: '#6FCF97',
  timeWarn: '#FFC24B',
  timeDanger: '#FF6F6F',

  shadow: '#D9A066',

  white: '#FFFFFF',
  black: '#3A2E28',
};

export const darkColors: ColorPalette = {
  background: '#221A17',
  surface: '#2E2420',
  surfaceAlt: '#3A2E28',

  primary: '#FFA97A',
  primaryDark: '#FF8A50',
  secondary: '#7FD8C6',
  secondaryDark: '#5CC9B4',
  accent: '#FFD166',
  accentDark: '#FFC24B',

  pink: '#E8A2B8',
  purple: '#B3A2E8',
  blue: '#8FC2EE',
  green: '#9ED690',
  yellow: '#F0D172',

  text: '#F5E9E0',
  textMuted: '#B8A79C',
  textOnPrimary: '#2B1E18',

  border: '#4A3B34',

  success: '#6FCF97',
  warning: '#FFC24B',
  danger: '#FF7F7F',

  timeSafe: '#6FCF97',
  timeWarn: '#FFC24B',
  timeDanger: '#FF7F7F',

  shadow: '#000000',

  white: '#FFFFFF',
  black: '#120D0B',
};

// Backwards-compatible static export (light palette) for call sites that
// have not been migrated to useTheme() yet.
export const colors = lightColors;

export const subjectPalette = [
  '#FFB6C9',
  '#9AD1FF',
  '#B7E8A8',
  '#FFE38A',
  '#C6B8FF',
  '#7FD8C6',
  '#FF9F6B',
  '#FFD166',
];
