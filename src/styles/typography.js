// src/styles/typography.js
import {textScale} from './responsiveStyles';
import {fontFamily} from '../common/fonts';

export const fontNames = {
  FONT_FAMILY_LIGHT: fontFamily.light,
  FONT_FAMILY_REGULAR: fontFamily.regular,
  FONT_FAMILY_BOLD: fontFamily.bold,
  FONT_FAMILY_EXTRA_BOLD: fontFamily.extraBold,
  FONT_FAMILY_BLACK: fontFamily.black,
};

export const typography = {
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(28),
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(22),
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(16),
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(14),
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
  },
  caption: {
    fontFamily: fontFamily.light,
    fontSize: textScale(11),
  },
  button: {
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
  },

  // Legacy compatibility sizes
  FONT_SIZE_24: textScale(24),
  FONT_SIZE_22: textScale(22),
  FONT_SIZE_20: textScale(20),
  FONT_SIZE_18: textScale(18),
  FONT_SIZE_16: textScale(16),
  FONT_SIZE_14: textScale(14),
  FONT_SIZE_12: textScale(12),
  FONT_SIZE_40: textScale(40),
};

export default typography;
