/**
 * __tests__/Theme-test.tsx
 * Unit test suite verifying Design System tokens, Theme Context, and Accessibility policies
 * Aligned with docs/Design.md Sections 4, 5, 6
 */

import 'react-native';
import React from 'react';
import {Text, View} from 'react-native';
import renderer, {act} from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  lightTheme,
  darkTheme,
  categoryMeta,
  priorityMeta,
} from '../src/styles/theme';
import {ThemeProvider, useTheme} from '../src/context/ThemeContext';
import {A11Y_POLICIES, getTextA11yProps} from '../src/utility/accessibility';

describe('Design System Tokens (docs/Design.md Section 4.1)', () => {
  it('defines calm muted teal and neutral tokens for light theme', () => {
    expect(lightTheme.mode).toBe('light');
    expect(lightTheme.primary).toBe('#286B68');
    expect(lightTheme.background).toBe('#F7F8FA');
    expect(lightTheme.surface).toBe('#FFFFFF');
    expect(lightTheme.border).toBe('#E1E5EA');
    expect(lightTheme.textPrimary).toBe('#20262E');
    expect(lightTheme.success).toBe('#28734D');
    expect(lightTheme.danger).toBe('#B83B40');
    expect(lightTheme.warning).toBe('#94651B');
  });

  it('defines soft muted teal and dark neutral tokens for dark theme', () => {
    expect(darkTheme.mode).toBe('dark');
    expect(darkTheme.primary).toBe('#78B8B0');
    expect(darkTheme.background).toBe('#121518');
    expect(darkTheme.surface).toBe('#1B2025');
    expect(darkTheme.border).toBe('#303940');
    expect(darkTheme.textPrimary).toBe('#EDF1F4');
    expect(darkTheme.success).toBe('#86C9A1');
    expect(darkTheme.danger).toBe('#F08D91');
    expect(darkTheme.warning).toBe('#E7BE78');
  });

  it('provides complete category metadata mapping', () => {
    const requiredCategories = [
      'All',
      'Work',
      'Personal',
      'Shopping',
      'Health',
      'Study',
      'Finance',
    ];
    requiredCategories.forEach(cat => {
      expect(categoryMeta[cat]).toBeDefined();
      expect(categoryMeta[cat].name).toBe(cat);
      expect(categoryMeta[cat].color).toBeTruthy();
      expect(categoryMeta[cat].bgColor).toBeTruthy();
      expect(categoryMeta[cat].icon).toBeTruthy();
    });
  });

  it('provides complete priority metadata mapping', () => {
    expect(priorityMeta.high.label).toBe('High');
    expect(priorityMeta.medium.label).toBe('Medium');
    expect(priorityMeta.low.label).toBe('Low');
    expect(priorityMeta.high.color).toBe('#B83B40');
    expect(priorityMeta.medium.color).toBe('#94651B');
    expect(priorityMeta.low.color).toBe('#28734D');
  });
});

describe('Theme Context and Mode Resolution (GT-203)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('provides theme state and allows toggling between light and dark', async () => {
    let contextValue: any = null;

    const TestConsumer = () => {
      contextValue = useTheme();
      return (
        <View>
          <Text testID="theme-mode">{contextValue.theme.mode}</Text>
        </View>
      );
    };

    await act(async () => {
      renderer.create(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );
    });

    expect(contextValue).not.toBeNull();
    expect(contextValue.themeMode).toBe('system');

    // Toggle theme to dark
    await act(async () => {
      contextValue.setThemeMode('dark');
    });

    expect(contextValue.themeMode).toBe('dark');
    expect(contextValue.isDark).toBe(true);
    expect(contextValue.theme.primary).toBe(darkTheme.primary);

    // Toggle back to light
    await act(async () => {
      contextValue.setThemeMode('light');
    });

    expect(contextValue.themeMode).toBe('light');
    expect(contextValue.isDark).toBe(false);
    expect(contextValue.theme.primary).toBe(lightTheme.primary);
  });

  it('persists theme preference to AsyncStorage', async () => {
    let contextValue: any = null;

    const TestConsumer = () => {
      contextValue = useTheme();
      return <View />;
    };

    await act(async () => {
      renderer.create(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );
    });

    await act(async () => {
      contextValue.setThemeMode('dark');
    });

    const stored = await AsyncStorage.getItem('@gotask_theme_mode');
    expect(stored).toBe('dark');
  });
});

describe('Accessibility & Text Scaling Policies (GT-204)', () => {
  it('enforces maximum font size multiplier bounds to prevent UI clipping', () => {
    expect(A11Y_POLICIES.MAX_FONT_SIZE_MULTIPLIER).toBe(1.5);
    expect(A11Y_POLICIES.HEADER_MAX_MULTIPLIER).toBe(1.3);
    expect(A11Y_POLICIES.BADGE_MAX_MULTIPLIER).toBe(1.2);
  });

  it('generates compliant accessibility text properties', () => {
    const defaultProps = getTextA11yProps();
    expect(defaultProps.allowFontScaling).toBe(true);
    expect(defaultProps.maxFontSizeMultiplier).toBe(1.5);

    const headerProps = getTextA11yProps(A11Y_POLICIES.HEADER_MAX_MULTIPLIER);
    expect(headerProps.allowFontScaling).toBe(true);
    expect(headerProps.maxFontSizeMultiplier).toBe(1.3);
  });
});
