/**
 * Color Design Tokens
 *
 * Based on the MicroBreaks Design System
 * All colors support both light and dark mode
 */

export const ColorPalette = {
  // Primary Colors
  primary: {
    calmBlue: '#4A90E2',
    energyGreen: '#7ED321',
  },

  // Secondary Colors
  secondary: {
    softPurple: '#9013FE',
    warmOrange: '#F5A623',
  },

  // Neutral Colors
  neutral: {
    dark: '#2C3E50',
    medium: '#7F8C8D',
    light: '#ECF0F1',
    white: '#FFFFFF',
    black: '#000000',
  },

  // Semantic Colors
  semantic: {
    error: '#E74C3C',
    warning: '#F39C12',
    info: '#3498DB',
    success: '#7ED321',
  },

  // UI Element Colors
  ui: {
    border: '#E0E0E0',
    divider: '#BDBDBD',
    overlay: 'rgba(0, 0, 0, 0.5)',
    backdrop: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

export const Colors = {
  light: {
    // Text
    text: {
      primary: ColorPalette.neutral.dark,
      secondary: ColorPalette.neutral.medium,
      tertiary: '#95A5A6',
      inverse: ColorPalette.neutral.white,
      link: ColorPalette.primary.calmBlue,
      error: ColorPalette.semantic.error,
      success: ColorPalette.semantic.success,
      warning: ColorPalette.semantic.warning,
    },

    // Background
    background: {
      primary: ColorPalette.neutral.white,
      secondary: ColorPalette.neutral.light,
      tertiary: '#F8F9FA',
      inverse: ColorPalette.neutral.dark,
      surface: ColorPalette.neutral.white,
      overlay: ColorPalette.ui.overlay,
    },

    // Brand
    brand: {
      primary: ColorPalette.primary.calmBlue,
      secondary: ColorPalette.primary.energyGreen,
      accent: ColorPalette.secondary.softPurple,
      highlight: ColorPalette.secondary.warmOrange,
    },

    // Interactive Elements
    interactive: {
      primary: ColorPalette.primary.calmBlue,
      primaryHover: '#3A7BC8',
      primaryActive: '#2A6BB8',
      primaryDisabled: '#B8D4EE',
      secondary: ColorPalette.primary.energyGreen,
      secondaryHover: '#6BC31E',
      secondaryActive: '#5BB31E',
      secondaryDisabled: '#C5E9A8',
    },

    // Status Colors
    status: {
      error: ColorPalette.semantic.error,
      errorLight: '#FADBD8',
      warning: ColorPalette.semantic.warning,
      warningLight: '#FCF3CF',
      success: ColorPalette.semantic.success,
      successLight: '#D5F4E6',
      info: ColorPalette.semantic.info,
      infoLight: '#D6EAF8',
    },

    // Border & Divider
    border: {
      default: ColorPalette.ui.border,
      light: '#F0F0F0',
      dark: ColorPalette.ui.divider,
      focus: ColorPalette.primary.calmBlue,
      error: ColorPalette.semantic.error,
    },

    // Icon
    icon: {
      primary: ColorPalette.neutral.dark,
      secondary: ColorPalette.neutral.medium,
      tertiary: '#BDC3C7',
      inverse: ColorPalette.neutral.white,
      brand: ColorPalette.primary.calmBlue,
    },

    // Tab Navigation
    tab: {
      iconDefault: ColorPalette.neutral.medium,
      iconSelected: ColorPalette.primary.calmBlue,
      background: ColorPalette.neutral.white,
      activeIndicator: ColorPalette.primary.calmBlue,
    },

    // Card
    card: {
      background: ColorPalette.neutral.white,
      border: ColorPalette.ui.border,
      shadow: 'rgba(0, 0, 0, 0.1)',
    },

    // Input
    input: {
      background: ColorPalette.neutral.white,
      border: ColorPalette.ui.border,
      borderFocus: ColorPalette.primary.calmBlue,
      borderError: ColorPalette.semantic.error,
      placeholder: ColorPalette.neutral.medium,
      text: ColorPalette.neutral.dark,
      disabled: ColorPalette.neutral.light,
    },

    // Progress & Loading
    progress: {
      background: ColorPalette.neutral.light,
      fill: ColorPalette.primary.calmBlue,
      success: ColorPalette.semantic.success,
    },
  },

  dark: {
    // Text
    text: {
      primary: '#FFFFFF',
      secondary: '#B4B4B4',
      tertiary: '#808080',
      inverse: '#000000',
      link: '#00D9FF',
      error: '#FF6B6B',
      success: '#00FF94',
      warning: '#FFB800',
    },

    // Background
    background: {
      primary: '#000000',
      secondary: '#0A0A0A',
      tertiary: '#141414',
      inverse: ColorPalette.neutral.white,
      surface: '#0F0F0F',
      overlay: 'rgba(0, 0, 0, 0.85)',
    },

    // Brand
    brand: {
      primary: '#00D9FF',
      secondary: '#00FF94',
      accent: '#B47EFF',
      highlight: '#FF3D71',
    },

    // Interactive Elements
    interactive: {
      primary: '#00D9FF',
      primaryHover: '#33E1FF',
      primaryActive: '#00B8D9',
      primaryDisabled: '#1A3D47',
      secondary: '#00FF94',
      secondaryHover: '#33FFA8',
      secondaryActive: '#00D97A',
      secondaryDisabled: '#1A4733',
    },

    // Status Colors
    status: {
      error: '#FF6B6B',
      errorLight: '#331515',
      warning: '#FFB800',
      warningLight: '#332500',
      success: '#00FF94',
      successLight: '#00331D',
      info: '#00D9FF',
      infoLight: '#002B33',
    },

    // Border & Divider
    border: {
      default: '#1F1F1F',
      light: '#141414',
      dark: '#2A2A2A',
      focus: '#00D9FF',
      error: '#FF6B6B',
    },

    // Icon
    icon: {
      primary: '#FFFFFF',
      secondary: '#B4B4B4',
      tertiary: '#666666',
      inverse: '#000000',
      brand: '#00D9FF',
    },

    // Tab Navigation
    tab: {
      iconDefault: '#808080',
      iconSelected: '#00D9FF',
      background: '#000000',
      activeIndicator: '#00D9FF',
    },

    // Card
    card: {
      background: '#0F0F0F',
      border: '#1F1F1F',
      shadow: 'rgba(0, 0, 0, 0.6)',
    },

    // Input
    input: {
      background: '#141414',
      border: '#2A2A2A',
      borderFocus: '#00D9FF',
      borderError: '#FF6B6B',
      placeholder: '#666666',
      text: '#FFFFFF',
      disabled: '#0A0A0A',
    },

    // Progress & Loading
    progress: {
      background: '#1F1F1F',
      fill: '#00D9FF',
      success: '#00FF94',
    },
  },
} as const;

// Gradient definitions for modern black-themed UI
export const Gradients = {
  // Primary gradients
  primary: {
    cyan: ['#00D9FF', '#0099CC'],
    cyanVertical: ['#00D9FF', '#006B8F'],
    green: ['#00FF94', '#00CC75'],
    purple: ['#B47EFF', '#8B5FD9'],
    red: ['#FF3D71', '#CC1447'],
  },

  // Background gradients
  background: {
    dark: ['#000000', '#0A0A0A', '#141414'],
    darkVertical: ['#0A0A0A', '#000000'],
    subtle: ['#0F0F0F', '#1A1A1A'],
    card: ['#0F0F0F', '#141414', '#0A0A0A'],
  },

  // Special effect gradients
  special: {
    aurora: ['#00D9FF', '#B47EFF', '#FF3D71'],
    neon: ['#00FF94', '#00D9FF', '#B47EFF'],
    sunset: ['#FF3D71', '#FFB800', '#FF3D71'],
    midnight: ['#000000', '#0F0F0F', '#1A1A1A', '#000000'],
  },

  // Overlay gradients
  overlay: {
    top: ['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0)'],
    bottom: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)'],
    radial: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.9)'],
  },
} as const;

// Opacity levels for consistent transparency
export const Opacity = {
  disabled: 0.38,
  inactive: 0.6,
  hover: 0.08,
  active: 0.12,
  focus: 0.12,
  selected: 0.16,
  overlay: {
    light: 0.5,
    medium: 0.7,
    dark: 0.85,
  },
} as const;

// Helper function to add alpha channel to hex color
export function addAlpha(hexColor: string, alpha: number): string {
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${alphaHex}`;
}

// Color accessibility helpers
export const ColorAccessibility = {
  minContrastRatio: {
    normalText: 4.5,
    largeText: 3,
    uiComponents: 3,
  },
  touchTargetMinSize: 44, // iOS HIG minimum
} as const;

export type ThemeMode = 'light' | 'dark';
export type ColorScheme = typeof Colors.light;
