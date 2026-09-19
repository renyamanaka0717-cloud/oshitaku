import { PropsWithChildren } from 'react';
import { ColorPalette, lightColors } from './colors';

type ThemeContextValue = {
  colors: ColorPalette;
};

const value: ThemeContextValue = { colors: lightColors };

// The app is light-mode only: no theme switching, so this stays a plain
// pass-through instead of a real context provider.
export function ThemeProvider({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export function useTheme(): ThemeContextValue {
  return value;
}
