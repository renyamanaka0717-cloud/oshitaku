// Mochiy Pop One (bouncy, high-personality) carries headings and big
// numbers; Zen Maru Gothic's heavy weights carry everything else. Both
// are rounded Japanese-friendly Google Fonts loaded via expo-font.
export const fonts = {
  display: 'MochiyPopOne_400Regular',
  bodyBold: 'ZenMaruGothic_700Bold',
  bodyBlack: 'ZenMaruGothic_900Black',
};

export const typography = {
  hero: { fontSize: 30, fontFamily: fonts.display },
  title: { fontSize: 21, fontFamily: fonts.display },
  subtitle: { fontSize: 17, fontFamily: fonts.bodyBlack },
  body: { fontSize: 16, fontFamily: fonts.bodyBold },
  caption: { fontSize: 13, fontFamily: fonts.bodyBold },
  countdown: { fontSize: 52, fontFamily: fonts.display },
};

export const mutedVariants = new Set(['caption']);
