/**
 * Theme Hook — "Outsiders" redesign
 *
 * The app now ships a single, editorial **dark** theme (dark-only, matching
 * the reference). `useTheme()` always returns the dark palette; the light
 * variant is kept as an alias so any legacy consumer resolves to dark.
 */

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

  // Accent colors
  accent: {
    primary: string; // Brand pink
    secondary: string; // Blue
    tertiary: string; // Purple
    warning: string; // Orange
    error: string; // Red
    success: string; // Green
  };

  // Status bar style
  statusBar: 'light' | 'dark';

  // Is dark mode
  isDark: boolean;
}

// The single "Outsiders" dark theme.
const darkColors: ThemeColors = {
  background: {
    primary: '#0C0B0F', // near-black canvas (warm undertone)
    secondary: '#141218', // lifted section
    card: '#1C1922', // elevated card / surface
    elevated: '#26222E', // higher elevation / chips
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9A98A3', // muted grey (≈ reference #97969D)
    muted: '#6B6975',
    inverse: '#0C0B0F',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.14)',
    strong: 'rgba(255, 255, 255, 0.22)',
  },
  accent: {
    primary: '#FF2472', // brand pink — CTAs, active states
    secondary: '#21A3E6', // blue
    tertiary: '#BC26F4', // purple
    warning: '#EF8633', // orange
    error: '#EB3E38', // red
    success: '#5BC741', // green
  },
  statusBar: 'light',
  isDark: true,
};

// Dark-only: the light theme resolves to the same palette.
const lightColors: ThemeColors = darkColors;

export function useTheme(): ThemeColors {
  return darkColors;
}

// Resolves to the effective theme. The app is dark-only.
export function useEffectiveTheme(): 'dark' | 'light' {
  return 'dark';
}

// Check if dark mode (always true in the current design).
export function useIsDarkMode(): boolean {
  return true;
}

export { lightColors, darkColors };
export default useTheme;
