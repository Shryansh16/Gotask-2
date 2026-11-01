// src/design-system/theme.js
import {createTheme} from '@shopify/restyle';
import {palette, spacing, borderRadii, breakpoints} from './tokens';
import {fontFamily} from '../common/fonts';

export const lightTheme = createTheme({
  colors: {
    mainBackground: palette.backgroundLight,
    surface: palette.surfaceLight,
    surfaceSecondary: palette.surfaceSecondaryLight,
    border: palette.borderLight,

    primary: palette.primaryLightMode,
    primarySubtle: palette.primaryLightModeSubtle,
    accent: palette.accentCoral,
    amber: palette.accentAmber,
    emerald: palette.accentEmerald,

    textPrimary: palette.inkBlack,
    textSecondary: palette.textSecondaryLight,
    textMuted: palette.textMutedLight,
    textInverse: '#FFFFFF',

    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
    info: palette.info,
  },
  spacing,
  borderRadii,
  breakpoints,
  textVariants: {
    hero: {
      fontFamily: fontFamily.bold,
      fontSize: 26,
      lineHeight: 32,
      color: 'textPrimary',
      letterSpacing: -0.5,
    },
    display: {
      fontFamily: fontFamily.bold,
      fontSize: 22,
      lineHeight: 28,
      color: 'textPrimary',
      letterSpacing: -0.4,
    },
    title: {
      fontFamily: fontFamily.bold,
      fontSize: 18,
      lineHeight: 24,
      color: 'textPrimary',
      letterSpacing: -0.3,
    },
    headline: {
      fontFamily: fontFamily.semiBold,
      fontSize: 16,
      lineHeight: 22,
      color: 'textPrimary',
    },
    body: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: 'textPrimary',
    },
    caption: {
      fontFamily: fontFamily.regular,
      fontSize: 12,
      lineHeight: 16,
      color: 'textSecondary',
    },
    label: {
      fontFamily: fontFamily.medium,
      fontSize: 11,
      lineHeight: 14,
      color: 'textMuted',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    defaults: {
      fontFamily: fontFamily.regular,
      fontSize: 14,
      color: 'textPrimary',
    },
  },
  cardVariants: {
    defaults: {
      backgroundColor: 'surface',
      borderRadius: 'm',
      padding: 'md',
    },
    elevated: {
      backgroundColor: 'surface',
      borderRadius: 'l',
      padding: 'md',
      shadowColor: 'textPrimary',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    hero: {
      backgroundColor: 'primary',
      borderRadius: 'l',
      padding: 'md',
      shadowColor: 'primary',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 5,
    },
  },
});

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    mainBackground: palette.backgroundDark,
    surface: palette.surfaceDark,
    surfaceSecondary: palette.surfaceSecondaryDark,
    border: palette.borderDark,

    primary: palette.primaryDarkMode,
    primarySubtle: palette.primaryDarkModeSubtle,

    textPrimary: palette.textPrimaryDark,
    textSecondary: palette.textSecondaryDark,
    textMuted: palette.textMutedDark,
    textInverse: palette.backgroundDark,
  },
};

export default {lightTheme, darkTheme};
