// src/styles/theme.js
// Modern, curated design system for GOTask aligned with docs/Design.md Section 4.1

export const lightTheme = {
  mode: 'light',
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F2F5',
  surfaceElevated: '#FFFFFF',

  // Brand colors (docs/Design.md Section 4.1 calm muted teal)
  primary: '#286B68',
  primaryLight: '#E6F2F0',
  primaryDark: '#1E5250',
  secondary: '#626B78',
  secondaryLight: '#F0F2F5',

  // Status & Priority
  danger: '#B83B40',
  dangerLight: '#FEF2F2',
  warning: '#94651B',
  warningLight: '#FEF9EE',
  success: '#28734D',
  successLight: '#EFF8F3',
  info: '#286B68',
  infoLight: '#E6F2F0',

  // Typography colors
  textPrimary: '#20262E',
  textSecondary: '#626B78',
  textMuted: '#7B8490',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E1E5EA',
  borderFocus: '#286B68',
  divider: '#E1E5EA',

  // Shadows
  shadowColor: '#20262E',
  cardShadow: {
    shadowColor: '#20262E',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  glowShadow: {
    shadowColor: '#286B68',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
};

export const darkTheme = {
  mode: 'dark',
  background: '#121518',
  surface: '#1B2025',
  surfaceSecondary: '#242B31',
  surfaceElevated: '#242B31',

  // Brand colors (docs/Design.md Section 4.1 soft muted teal)
  primary: '#78B8B0',
  primaryLight: '#223C3A',
  primaryDark: '#5E9992',
  secondary: '#B0BAC4',
  secondaryLight: '#242B31',

  // Status & Priority
  danger: '#F08D91',
  dangerLight: '#321D1F',
  warning: '#E7BE78',
  warningLight: '#322918',
  success: '#86C9A1',
  successLight: '#1A2E23',
  info: '#78B8B0',
  infoLight: '#223C3A',

  // Typography colors
  textPrimary: '#EDF1F4',
  textSecondary: '#B0BAC4',
  textMuted: '#9AA5B0',
  textInverse: '#121518',

  // Borders & Dividers
  border: '#303940',
  borderFocus: '#78B8B0',
  divider: '#303940',

  // Shadows
  shadowColor: '#000000',
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  glowShadow: {
    shadowColor: '#78B8B0',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const categoryMeta = {
  All: {
    name: 'All',
    color: '#286B68',
    bgColor: '#E6F2F0',
    icon: 'folder-open',
  },
  Work: {
    name: 'Work',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    icon: 'briefcase',
  },
  Personal: {
    name: 'Personal',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    icon: 'user',
  },
  Shopping: {
    name: 'Shopping',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    icon: 'shopping-cart',
  },
  Health: {
    name: 'Health',
    color: '#28734D',
    bgColor: '#EFF8F3',
    icon: 'heartbeat',
  },
  Study: {
    name: 'Study',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    icon: 'book',
  },
  Finance: {
    name: 'Finance',
    color: '#94651B',
    bgColor: '#FFFBEB',
    icon: 'dollar-sign',
  },
};

export const priorityMeta = {
  high: {
    label: 'High',
    color: '#B83B40',
    bgColor: '#FEF2F2',
    dotColor: '#B83B40',
  },
  medium: {
    label: 'Medium',
    color: '#94651B',
    bgColor: '#FFFBEB',
    dotColor: '#94651B',
  },
  low: {
    label: 'Low',
    color: '#28734D',
    bgColor: '#ECFDF5',
    dotColor: '#28734D',
  },
};
