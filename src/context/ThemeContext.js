// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../styles/theme';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = '@gotask_theme_mode';

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState('system'); // 'light' | 'dark' | 'system'
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        setThemeModeState(saved);
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (e) {
      // Ignore
    }
  };

  const toggleTheme = () => {
    const isCurrentlyDark =
      themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');
    setThemeMode(isCurrentlyDark ? 'light' : 'dark');
  };

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: lightTheme,
      isDark: false,
      themeMode: 'light',
      toggleTheme: () => {},
      setThemeMode: () => {},
    };
  }
  return context;
};

export default ThemeContext;
