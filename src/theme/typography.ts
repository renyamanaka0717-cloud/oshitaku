import { colors } from './colors';

export const typography = {
  hero: { fontSize: 34, fontWeight: '800' as const, color: colors.text },
  title: { fontSize: 24, fontWeight: '800' as const, color: colors.text },
  subtitle: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '500' as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
  countdown: { fontSize: 56, fontWeight: '900' as const },
};
