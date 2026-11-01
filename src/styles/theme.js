// src/styles/theme.js
// Vibrant, Joyful, Elevate-Grade Design System for GoTASK

export const lightTheme = {
  mode: 'light',
  background: '#F8FAFC', // Crisp, clean slate-50 background
  surface: '#FFFFFF', // Pristine white card surface
  surfaceSecondary: '#F1F5F9', // Soft subtle slate-100
  surfaceElevated: '#FFFFFF',

  // Brand colors: Electric Indigo / Modern Violet (Elevate style)
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  primaryDark: '#3730A3',
  elevateBlue: '#00A3FF',
  elevateBlueDark: '#0082CC',
  bevelColor: '#CBD5E1',
  activeMint: '#DCFCE7',
  activeMintBorder: '#22C55E',
  iceBlue: '#F0F9FF',
  iceBlueBorder: '#BAE6FD',
  secondary: '#64748B',
  secondaryLight: '#F1F5F9',

  // Vibrant Accents & Status (Elevate energetic palette)
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  success: '#10B981',
  successLight: '#ECFDF5',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  accent: '#EC4899',

  // Typography
  textPrimary: '#0F172A', // Slate-900 (ultra sharp & readable)
  textSecondary: '#475569', // Slate-600
  textMuted: '#94A3B8', // Slate-400
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0', // Clean Slate-200
  borderFocus: '#4F46E5',
  divider: '#F1F5F9',

  // Soft, Tactile Elevate Shadows
  shadowColor: '#0F172A',
  cardShadow: {
    shadowColor: '#475569',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  glowShadow: {
    shadowColor: '#4F46E5',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const darkTheme = {
  mode: 'dark',
  background: '#0B0F19', // Deep luxurious midnight
  surface: '#151D2F', // Elevated dark navy surface
  surfaceSecondary: '#1E293B', // Slate-800
  surfaceElevated: '#222F46',

  // Brand colors in Dark Mode
  primary: '#818CF8', // Bright glowing indigo
  primaryLight: '#1E1B4B',
  primaryDark: '#6366F1',
  elevateBlue: '#38BDF8',
  elevateBlueDark: '#0284C7',
  bevelColor: '#0F172A',
  activeMint: '#064E3B',
  activeMintBorder: '#10B981',
  iceBlue: '#0C4A6E',
  iceBlueBorder: '#0284C7',
  secondary: '#94A3B8',
  secondaryLight: '#1E293B',

  // Status & Accents
  danger: '#F87171',
  dangerLight: '#2C1515',
  warning: '#FBBF24',
  warningLight: '#2D2305',
  success: '#34D399',
  successLight: '#0E2E20',
  info: '#60A5FA',
  infoLight: '#172554',
  accent: '#F472B6',

  // Typography
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0B0F19',

  // Borders & Dividers
  border: '#1E293B',
  borderFocus: '#818CF8',
  divider: '#1E293B',

  // Shadows
  shadowColor: '#000000',
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  glowShadow: {
    shadowColor: '#818CF8',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
};

export const categoryMeta = {
  All: {
    name: 'All',
    label: 'All',
    icon: 'layers',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
  },
  Work: {
    name: 'Work',
    label: 'Work',
    icon: 'briefcase',
    color: '#8B5CF6', // Vibrant Purple
    bgColor: '#F5F3FF',
  },
  Personal: {
    name: 'Personal',
    label: 'Personal',
    icon: 'user',
    color: '#3B82F6', // Cobalt Blue
    bgColor: '#EFF6FF',
  },
  Shopping: {
    name: 'Shopping',
    label: 'Shopping',
    icon: 'shopping-bag',
    color: '#F97316', // Vibrant Orange
    bgColor: '#FFF7ED',
  },
  Health: {
    name: 'Health',
    label: 'Health',
    icon: 'activity',
    color: '#10B981', // Fresh Emerald
    bgColor: '#ECFDF5',
  },
  Study: {
    name: 'Study',
    label: 'Study',
    icon: 'book-open',
    color: '#EC4899', // Bright Pink
    bgColor: '#FDF2F8',
  },
  Finance: {
    name: 'Finance',
    label: 'Finance',
    icon: 'dollar-sign',
    color: '#F59E0B', // Golden Amber
    bgColor: '#FFFBEB',
  },
  Ideas: {
    name: 'Ideas',
    label: 'Ideas',
    icon: 'compass',
    color: '#06B6D4', // Vibrant Cyan
    bgColor: '#ECFEFF',
  },
};

export const priorityMeta = {
  high: {
    label: 'High',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    dotColor: '#EF4444',
  },
  medium: {
    label: 'Medium',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    dotColor: '#F59E0B',
  },
  low: {
    label: 'Low',
    color: '#10B981',
    bgColor: '#D1FAE5',
    dotColor: '#10B981',
  },
};

export default {lightTheme, darkTheme, categoryMeta, priorityMeta};
