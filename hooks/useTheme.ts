/**
 * Theme Hook
 * Provides theme colors based on user preference
 */

import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store';

export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    card: string;
    elevated: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };

  // Border colors
  border: {
    subtle: string;
    medium: string;
    strong: string;
  };

  // Accent colors (same for both themes)
  accent: {
    primary: string;    // Teal/Green
    secondary: string;  // Cyan
    tertiary: string;   // Purple
    warning: string;    // Yellow/Gold
    error: string;      // Red
    success: string;    // Green
  };

  // Status bar style
  statusBar: 'light' | 'dark';

  // Is dark mode
  isDark: boolean;
}

// Dark theme colors
const darkColors: ThemeColors = {
  background: {
    primary: '#000000',
    secondary: '#0A0A0F',
    card: 'rgba(25, 25, 35, 0.9)',
    elevated: 'rgba(40, 40, 50, 0.9)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.5)',
    inverse: '#000000',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.15)',
    strong: 'rgba(255, 255, 255, 0.25)',
  },
  accent: {
    primary: '#06FFA5',
    secondary: '#00E5FF',
    tertiary: '#B47EFF',
    warning: '#FFD166',
    error: '#FF6B6B',
    success: '#06FFA5',
  },
  statusBar: 'light',
  isDark: true,
};

// Light theme - Soft gray background, white cards
const lightColors: ThemeColors = {
  background: {
    primary: '#F2F2F7',      // iOS system gray background
    secondary: '#E5E5EA',    // Slightly darker sections
    card: '#FFFFFF',         // White cards float on gray
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#000000',      // Pure black
    secondary: '#000000',    // Black
    muted: '#666666',        // Dark gray
    inverse: '#FFFFFF',
  },
  border: {
    subtle: 'rgba(0, 0, 0, 0.06)',
    medium: 'rgba(0, 0, 0, 0.10)',
    strong: 'rgba(0, 0, 0, 0.15)',
  },
  accent: {
    primary: '#34C759',      // Apple green
    secondary: '#007AFF',    // Apple blue
    tertiary: '#AF52DE',     // Apple purple
    warning: '#FF9500',      // Apple orange
    error: '#FF3B30',        // Apple red
    success: '#34C759',
  },
  statusBar: 'dark',
  isDark: false,
};

export function useTheme(): ThemeColors {
  const systemColorScheme = useColorScheme();
  const themeSetting = useSettingsStore((state) => state.settings.theme);

  const colors = useMemo(() => {
    if (themeSetting === 'system') {
      return systemColorScheme === 'light' ? lightColors : darkColors;
    }
    return themeSetting === 'light' ? lightColors : darkColors;
  }, [themeSetting, systemColorScheme]);

  return colors;
}

// Get effective theme (resolves 'system' to actual theme)
export function useEffectiveTheme(): 'dark' | 'light' {
  const systemColorScheme = useColorScheme();
  const themeSetting = useSettingsStore((state) => state.settings.theme);

  if (themeSetting === 'system') {
    return systemColorScheme === 'light' ? 'light' : 'dark';
  }
  return themeSetting;
}

// Check if dark mode
export function useIsDarkMode(): boolean {
  const theme = useEffectiveTheme();
  return theme === 'dark';
}

export default useTheme;
