// src/styles/theme.js
// Modern, curated design system for GOTask

export const lightTheme = {
  mode: 'light',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  surfaceElevated: '#FFFFFF',

  // Brand colors
  primary: '#2563EB', // Royal Blue
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  secondary: '#7C3AED', // Electric Violet
  secondaryLight: '#F5F3FF',

  // Status & Priority
  danger: '#EF4444', // High priority / Delete
  dangerLight: '#FEF2F2',
  warning: '#F59E0B', // Medium priority
  warningLight: '#FFFBEB',
  success: '#10B981', // Low priority / Completed
  successLight: '#ECFDF5',
  info: '#06B6D4',
  infoLight: '#ECFEFF',

  // Typography colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Borders & Dividers
  border: '#E2E8F0',
  borderFocus: '#2563EB',
  divider: '#F1F5F9',

  // Shadows
  shadowColor: '#0F172A',
  cardShadow: {
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  glowShadow: {
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
};

export const darkTheme = {
  mode: 'dark',
  background: '#0B0F19',
  surface: '#131B2E',
  surfaceSecondary: '#1E293B',
  surfaceElevated: '#1E293B',

  // Brand colors
  primary: '#3B82F6',
  primaryLight: 'rgba(59, 130, 246, 0.15)',
  primaryDark: '#60A5FA',
  secondary: '#8B5CF6',
  secondaryLight: 'rgba(139, 92, 246, 0.15)',

  // Status & Priority
  danger: '#F87171',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  warning: '#FBBF24',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  success: '#34D399',
  successLight: 'rgba(16, 185, 129, 0.15)',
  info: '#38BDF8',
  infoLight: 'rgba(56, 189, 248, 0.15)',

  // Typography colors
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Borders & Dividers
  border: '#1E293B',
  borderFocus: '#3B82F6',
  divider: '#1E293B',

  // Shadows
  shadowColor: '#000000',
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  glowShadow: {
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
};

export const categoryMeta = {
  All: {
    name: 'All',
    color: '#2563EB',
    bgColor: '#EFF6FF',
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
    color: '#10B981',
    bgColor: '#ECFDF5',
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
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    icon: 'dollar-sign',
  },
};

export const priorityMeta = {
  high: {
    label: 'High',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    dotColor: '#DC2626',
  },
  medium: {
    label: 'Medium',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    dotColor: '#D97706',
  },
  low: {
    label: 'Low',
    color: '#10B981',
    bgColor: '#ECFDF5',
    dotColor: '#059669',
  },
};
