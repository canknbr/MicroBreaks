/**
 * Color Design Tokens
 *
 * Based on the MicroBreaks Design System
 * All colors support both light and dark mode
 */

export const ColorPalette = {
  // Core Brand Colors - Inspired by "How We Feel" design
  brand: {
    yellow: '#FFD166',
    orange: '#FF9F1C',
    coral: '#EF476F',
    red: '#E63946',
    teal: '#06FFA5',
    green: '#4ECDC4',
    blue: '#118AB2',
    lightBlue: '#82C3EC',
    purple: '#7B68EE',
    lavender: '#B47EFF',
  },

  // Neutral Colors
  neutral: {
    black: '#000000',
    darkGray: '#1A1A1A',
    mediumGray: '#2A2A2A',
    gray: '#4A4A4A',
    lightGray: '#9CA3AF',
    silver: '#C4C4C4',
    white: '#FFFFFF',
  },

  // Emotion Color Mapping
  emotions: {
    // Positive/High Energy
    energized: '#FFD166',
    cheerful: '#FFD166',
    playful: '#FFD166',
    eager: '#FF9F1C',
    productive: '#FF9F1C',

    // Positive/Low Energy
    calm: '#4ECDC4',
    peaceful: '#4ECDC4',
    relaxed: '#06FFA5',
    atEase: '#06FFA5',

    // Negative/High Energy
    stressed: '#E63946',
    anxious: '#E63946',
    restless: '#EF476F',
    tense: '#EF476F',

    // Negative/Low Energy
    sad: '#118AB2',
    tired: '#82C3EC',
    bored: '#82C3EC',
    lonely: '#7B68EE',
  },

  // UI Element Colors
  ui: {
    border: '#2A2A2A',
    divider: '#1A1A1A',
    overlay: 'rgba(0, 0, 0, 0.85)',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    cardBackground: '#1A1A1A',
    inputBackground: '#2A2A2A',
  },
} as const;

export const Colors = {
  light: {
    // Text
    text: {
      primary: ColorPalette.neutral.black,
      secondary: ColorPalette.neutral.gray,
      tertiary: ColorPalette.neutral.lightGray,
      inverse: ColorPalette.neutral.white,
      link: ColorPalette.brand.blue,
      error: ColorPalette.brand.red,
      success: ColorPalette.brand.teal,
      warning: ColorPalette.brand.orange,
    },

    // Background
    background: {
      primary: ColorPalette.neutral.white,
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      inverse: ColorPalette.neutral.black,
      surface: ColorPalette.neutral.white,
      overlay: ColorPalette.ui.overlay,
    },

    // Brand
    brand: {
      primary: ColorPalette.brand.teal,
      secondary: ColorPalette.brand.yellow,
      accent: ColorPalette.brand.purple,
      highlight: ColorPalette.brand.coral,
    },

    // Interactive Elements
    interactive: {
      primary: ColorPalette.brand.teal,
      primaryHover: '#05E094',
      primaryActive: '#05CC84',
      primaryDisabled: ColorPalette.neutral.lightGray,
      secondary: ColorPalette.brand.yellow,
      secondaryHover: '#FFC94D',
      secondaryActive: '#FFB733',
      secondaryDisabled: ColorPalette.neutral.silver,
    },

    // Status Colors
    status: {
      error: ColorPalette.brand.red,
      errorLight: '#FEE2E2',
      warning: ColorPalette.brand.orange,
      warningLight: '#FEF3C7',
      success: ColorPalette.brand.teal,
      successLight: '#D1FAE5',
      info: ColorPalette.brand.blue,
      infoLight: '#DBEAFE',
    },

    // Border & Divider
    border: {
      default: '#E5E7EB',
      light: '#F3F4F6',
      dark: '#D1D5DB',
      focus: ColorPalette.brand.teal,
      error: ColorPalette.brand.red,
    },

    // Icon
    icon: {
      primary: ColorPalette.neutral.black,
      secondary: ColorPalette.neutral.gray,
      tertiary: ColorPalette.neutral.lightGray,
      inverse: ColorPalette.neutral.white,
      brand: ColorPalette.brand.teal,
    },

    // Tab Navigation
    tab: {
      iconDefault: ColorPalette.neutral.gray,
      iconSelected: ColorPalette.brand.teal,
      background: ColorPalette.neutral.white,
      activeIndicator: ColorPalette.brand.teal,
    },

    // Card
    card: {
      background: ColorPalette.neutral.white,
      border: '#E5E7EB',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },

    // Input
    input: {
      background: ColorPalette.neutral.white,
      border: '#E5E7EB',
      borderFocus: ColorPalette.brand.teal,
      borderError: ColorPalette.brand.red,
      placeholder: ColorPalette.neutral.lightGray,
      text: ColorPalette.neutral.black,
      disabled: '#F3F4F6',
    },

    // Progress & Loading
    progress: {
      background: '#E5E7EB',
      fill: ColorPalette.brand.teal,
      success: ColorPalette.brand.teal,
    },
  },

  dark: {
    // Text - Pure black background with white text
    text: {
      primary: ColorPalette.neutral.white,
      secondary: ColorPalette.neutral.lightGray,
      tertiary: ColorPalette.neutral.gray,
      inverse: ColorPalette.neutral.black,
      link: ColorPalette.brand.teal,
      error: ColorPalette.brand.coral,
      success: ColorPalette.brand.teal,
      warning: ColorPalette.brand.orange,
    },

    // Background - Pure black like "How We Feel"
    background: {
      primary: ColorPalette.neutral.black,
      secondary: ColorPalette.neutral.darkGray,
      tertiary: ColorPalette.neutral.mediumGray,
      inverse: ColorPalette.neutral.white,
      surface: ColorPalette.ui.cardBackground,
      overlay: ColorPalette.ui.overlay,
    },

    // Brand
    brand: {
      primary: ColorPalette.brand.teal,
      secondary: ColorPalette.brand.yellow,
      accent: ColorPalette.brand.lavender,
      highlight: ColorPalette.brand.coral,
    },

    // Interactive Elements - White buttons with black text
    interactive: {
      primary: ColorPalette.neutral.white,
      primaryHover: ColorPalette.neutral.silver,
      primaryActive: '#E0E0E0',
      primaryDisabled: ColorPalette.neutral.gray,
      secondary: ColorPalette.neutral.mediumGray,
      secondaryHover: ColorPalette.neutral.gray,
      secondaryActive: '#5A5A5A',
      secondaryDisabled: ColorPalette.neutral.darkGray,
    },

    // Status Colors
    status: {
      error: ColorPalette.brand.coral,
      errorLight: ColorPalette.neutral.darkGray,
      warning: ColorPalette.brand.orange,
      warningLight: ColorPalette.neutral.darkGray,
      success: ColorPalette.brand.teal,
      successLight: ColorPalette.neutral.darkGray,
      info: ColorPalette.brand.lightBlue,
      infoLight: ColorPalette.neutral.darkGray,
    },

    // Border & Divider
    border: {
      default: ColorPalette.ui.border,
      light: ColorPalette.neutral.darkGray,
      dark: ColorPalette.neutral.mediumGray,
      focus: ColorPalette.brand.teal,
      error: ColorPalette.brand.coral,
    },

    // Icon
    icon: {
      primary: ColorPalette.neutral.white,
      secondary: ColorPalette.neutral.lightGray,
      tertiary: ColorPalette.neutral.gray,
      inverse: ColorPalette.neutral.black,
      brand: ColorPalette.brand.teal,
    },

    // Tab Navigation
    tab: {
      iconDefault: ColorPalette.neutral.gray,
      iconSelected: ColorPalette.brand.teal,
      background: ColorPalette.neutral.black,
      activeIndicator: ColorPalette.brand.teal,
    },

    // Card
    card: {
      background: ColorPalette.ui.cardBackground,
      border: ColorPalette.ui.border,
      shadow: 'rgba(0, 0, 0, 0.8)',
    },

    // Input
    input: {
      background: ColorPalette.ui.inputBackground,
      border: ColorPalette.ui.border,
      borderFocus: ColorPalette.brand.teal,
      borderError: ColorPalette.brand.coral,
      placeholder: ColorPalette.neutral.gray,
      text: ColorPalette.neutral.white,
      disabled: ColorPalette.neutral.darkGray,
    },

    // Progress & Loading
    progress: {
      background: ColorPalette.neutral.mediumGray,
      fill: ColorPalette.brand.teal,
      success: ColorPalette.brand.teal,
    },
  },
} as const;

// Gradient definitions inspired by "How We Feel" colorful emotion design
export const Gradients = {
  // Emotion-based gradients
  emotions: {
    energized: ['#FFD166', '#FF9F1C'],
    calm: ['#4ECDC4', '#06FFA5'],
    happy: ['#FFD166', '#06FFA5'],
    stressed: ['#EF476F', '#E63946'],
    peaceful: ['#4ECDC4', '#7B68EE'],
    rainbow: ['#06FFA5', '#4ECDC4', '#118AB2', '#7B68EE', '#FFD166', '#FF9F1C', '#EF476F'],
  },

  // Background gradients
  background: {
    pure: ['#000000', '#000000'],
    subtle: ['#000000', '#0A0A0A'],
    dark: ['#000000', '#1A1A1A'],
    card: ['#1A1A1A', '#2A2A2A'],
  },

  // Special effect gradients
  special: {
    aurora: ['#06FFA5', '#7B68EE', '#EF476F'],
    sunset: ['#FFD166', '#FF9F1C', '#EF476F'],
    ocean: ['#4ECDC4', '#118AB2', '#7B68EE'],
    fire: ['#FFD166', '#FF9F1C', '#E63946'],
  },

  // Overlay gradients
  overlay: {
    top: ['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0)'],
    bottom: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.9)'],
    radial: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.95)'],
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

/**
 * WCAG-compliant text colors
 * All colors meet WCAG AA contrast ratio requirements
 */
export const AccessibleText = {
  // For dark backgrounds (e.g., black #000000)
  onDark: {
    primary: 'rgba(255, 255, 255, 1)', // White - 21:1 ratio
    secondary: 'rgba(255, 255, 255, 0.85)', // ~14:1 ratio - replaces 0.7
    tertiary: 'rgba(255, 255, 255, 0.7)', // ~9:1 ratio - replaces 0.5
    muted: 'rgba(255, 255, 255, 0.6)', // ~5:1 ratio - replaces 0.4, meets AA for normal text
    disabled: 'rgba(255, 255, 255, 0.45)', // ~3.3:1 ratio - AA for large text/decorative
  },
  // For light backgrounds (e.g., white #FFFFFF)
  onLight: {
    primary: 'rgba(0, 0, 0, 1)', // Black - 21:1 ratio
    secondary: 'rgba(0, 0, 0, 0.85)', // ~14:1 ratio
    tertiary: 'rgba(0, 0, 0, 0.7)', // ~9:1 ratio
    muted: 'rgba(0, 0, 0, 0.6)', // ~5:1 ratio
    disabled: 'rgba(0, 0, 0, 0.45)', // ~3.3:1 ratio
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ColorScheme = typeof Colors.light;
