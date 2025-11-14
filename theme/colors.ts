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
      primary: '#ECEDEE',
      secondary: '#BDC3C7',
      tertiary: '#95A5A6',
      inverse: ColorPalette.neutral.dark,
      link: '#5DADE2',
      error: '#EC7063',
      success: '#82E0AA',
      warning: '#F8C471',
    },

    // Background
    background: {
      primary: '#151718',
      secondary: '#1E2124',
      tertiary: '#2C2F33',
      inverse: ColorPalette.neutral.white,
      surface: '#1E2124',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },

    // Brand
    brand: {
      primary: '#5DADE2',
      secondary: '#82E0AA',
      accent: '#A569BD',
      highlight: '#F8C471',
    },

    // Interactive Elements
    interactive: {
      primary: '#5DADE2',
      primaryHover: '#6DC0F0',
      primaryActive: '#4A9AD0',
      primaryDisabled: '#2E5C78',
      secondary: '#82E0AA',
      secondaryHover: '#92EAB8',
      secondaryActive: '#72D09A',
      secondaryDisabled: '#3E6850',
    },

    // Status Colors
    status: {
      error: '#EC7063',
      errorLight: '#641E16',
      warning: '#F8C471',
      warningLight: '#7D6608',
      success: '#82E0AA',
      successLight: '#145A32',
      info: '#5DADE2',
      infoLight: '#154360',
    },

    // Border & Divider
    border: {
      default: '#2C2F33',
      light: '#1E2124',
      dark: '#36393F',
      focus: '#5DADE2',
      error: '#EC7063',
    },

    // Icon
    icon: {
      primary: '#ECEDEE',
      secondary: '#BDC3C7',
      tertiary: '#7F8C8D',
      inverse: ColorPalette.neutral.dark,
      brand: '#5DADE2',
    },

    // Tab Navigation
    tab: {
      iconDefault: '#BDC3C7',
      iconSelected: '#5DADE2',
      background: '#151718',
      activeIndicator: '#5DADE2',
    },

    // Card
    card: {
      background: '#1E2124',
      border: '#2C2F33',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },

    // Input
    input: {
      background: '#2C2F33',
      border: '#36393F',
      borderFocus: '#5DADE2',
      borderError: '#EC7063',
      placeholder: '#7F8C8D',
      text: '#ECEDEE',
      disabled: '#1E2124',
    },

    // Progress & Loading
    progress: {
      background: '#2C2F33',
      fill: '#5DADE2',
      success: '#82E0AA',
    },
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
