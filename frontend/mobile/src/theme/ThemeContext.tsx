import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, BorderRadius, Shadows } from './constants';
import { DarkColors, DarkSpacing, DarkBorderRadius } from './dark';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  themeColors: typeof Colors;
  themeSpacing: typeof Spacing;
  themeBorderRadius: typeof BorderRadius;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
      }
    } catch (error) {
      console.log('Failed to load theme');
    }
  };

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.log('Failed to save theme');
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    const newMode = mode === 'dark';
    setIsDark(newMode);
    try {
      await AsyncStorage.setItem('theme', mode);
    } catch (error) {
      console.log('Failed to save theme');
    }
  };

  const value: ThemeContextType = {
    isDark,
    toggleTheme,
    setTheme,
    themeColors: isDark ? DarkColors : Colors,
    themeSpacing: isDark ? DarkSpacing : Spacing,
    themeBorderRadius: isDark ? DarkBorderRadius : BorderRadius,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};