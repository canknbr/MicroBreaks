/**
 * Color Design Tokens — "Outsiders" redesign
 *
 * Single editorial DARK theme. Warm near-black canvas, hot-pink brand accent,
 * and a rigorous semantic accent palette (blue / green / red / orange / yellow
 * / purple / mint) reused across states and data. `Colors.light` is an alias
 * of `Colors.dark` so the app is effectively dark-only while every existing
 * `Colors.light.*` / `Colors[mode].*` consumer keeps resolving to dark.
 */

export const ColorPalette = {
  // Brand + semantic accents
  brand: {
    pink: '#FF2472', // primary brand
    pinkSoft: '#FF5B93',
    blue: '#21A3E6',
    sky: '#54C4E8',
    green: '#5BC741',
    greenPure: '#00BC00',
    red: '#EB3E38',
    orange: '#EF8633',
    yellow: '#FAE34B',
    purple: '#BC26F4',
    mint: '#6CE9CC',
    // Legacy aliases — kept so any older references resolve to the new palette
    teal: '#6CE9CC',
    coral: '#FF2472',
    lavender: '#BC26F4',
    lightBlue: '#54C4E8',
  },

  // Warm-dark neutral scale
  neutral: {
    black: '#000000',
    canvas: '#0C0B0F', // app base
    surface: '#1C1922', // card
    elevated: '#26222E',
    chip: '#322D3A',
    darkGray: '#141218',
    mediumGray: '#26222E',
    gray: '#6B6975',
    lightGray: '#9A98A3',
    silver: '#C4C2CB',
    white: '#FFFFFF',
  },

  // Emotion mapping (vestigial — repointed to the new accents to stay safe)
  emotions: {
    energized: '#FAE34B',
    cheerful: '#FAE34B',
    playful: '#FF2472',
    eager: '#EF8633',
    productive: '#21A3E6',
    calm: '#6CE9CC',
    peaceful: '#6CE9CC',
    relaxed: '#5BC741',
    atEase: '#5BC741',
    stressed: '#EB3E38',
    anxious: '#EB3E38',
    restless: '#FF2472',
    tense: '#EF8633',
    sad: '#21A3E6',
    tired: '#54C4E8',
    bored: '#54C4E8',
    lonely: '#BC26F4',
  },

  // UI element colors
  ui: {
    border: 'rgba(255, 255, 255, 0.10)',
    divider: 'rgba(255, 255, 255, 0.07)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    backdrop: 'rgba(0, 0, 0, 0.55)',
    cardBackground: '#1C1922',
    inputBackground: '#26222E',
  },
} as const;

// The single "Outsiders" dark scheme.
const darkScheme = {
  // Text
  text: {
    primary: ColorPalette.neutral.white,
    secondary: ColorPalette.neutral.lightGray,
    tertiary: ColorPalette.neutral.gray,
    inverse: ColorPalette.neutral.canvas,
    link: ColorPalette.brand.pink,
    error: ColorPalette.brand.red,
    success: ColorPalette.brand.green,
    warning: ColorPalette.brand.orange,
  },

  // Background
  background: {
    primary: ColorPalette.neutral.canvas,
    secondary: ColorPalette.neutral.darkGray,
    tertiary: ColorPalette.neutral.surface,
    inverse: ColorPalette.neutral.white,
    surface: ColorPalette.neutral.surface,
    overlay: ColorPalette.ui.overlay,
  },

  // Brand
  brand: {
    primary: ColorPalette.brand.pink,
    secondary: ColorPalette.brand.blue,
    accent: ColorPalette.brand.purple,
    highlight: ColorPalette.brand.pinkSoft,
  },

  // Interactive elements — pink pill CTAs
  interactive: {
    primary: ColorPalette.brand.pink,
    primaryHover: '#FF4586',
    primaryActive: '#E01560',
    primaryDisabled: ColorPalette.neutral.elevated,
    secondary: ColorPalette.neutral.elevated,
    secondaryHover: ColorPalette.neutral.chip,
    secondaryActive: '#3C3746',
    secondaryDisabled: ColorPalette.neutral.darkGray,
  },

  // Status colors — `*Background` = muted dark surface variant
  status: {
    error: ColorPalette.brand.red,
    errorBackground: 'rgba(235, 62, 56, 0.14)',
    warning: ColorPalette.brand.orange,
    warningBackground: 'rgba(239, 134, 51, 0.14)',
    success: ColorPalette.brand.green,
    successBackground: 'rgba(91, 199, 65, 0.14)',
    info: ColorPalette.brand.blue,
    infoBackground: 'rgba(33, 163, 230, 0.14)',
  },

  // Border & divider
  border: {
    default: ColorPalette.ui.border,
    light: ColorPalette.ui.divider,
    dark: 'rgba(255, 255, 255, 0.16)',
    focus: ColorPalette.brand.pink,
    error: ColorPalette.brand.red,
  },

  // Icon
  icon: {
    primary: ColorPalette.neutral.white,
    secondary: ColorPalette.neutral.lightGray,
    tertiary: ColorPalette.neutral.gray,
    inverse: ColorPalette.neutral.canvas,
    brand: ColorPalette.brand.pink,
  },

  // Tab navigation (floating pill)
  tab: {
    iconDefault: ColorPalette.neutral.lightGray,
    iconSelected: ColorPalette.brand.pink,
    background: ColorPalette.neutral.surface,
    activeIndicator: ColorPalette.brand.pink,
  },

  // Card — flat, hairline, no heavy shadow
  card: {
    background: ColorPalette.neutral.surface,
    border: ColorPalette.ui.border,
    shadow: 'rgba(0, 0, 0, 0.5)',
  },

  // Input — borderless / underline
  input: {
    background: ColorPalette.neutral.elevated,
    border: ColorPalette.ui.border,
    borderFocus: ColorPalette.brand.pink,
    borderError: ColorPalette.brand.red,
    placeholder: ColorPalette.neutral.gray,
    text: ColorPalette.neutral.white,
    disabled: ColorPalette.neutral.darkGray,
  },

  // Progress & loading
  progress: {
    background: 'rgba(255, 255, 255, 0.10)',
    fill: ColorPalette.brand.pink,
    success: ColorPalette.brand.green,
  },
} as const;

export const Colors = {
  // Dark-only: both schemes point at the same dark palette.
  light: darkScheme,
  dark: darkScheme,
} as const;

// Gradient definitions — the reference's signature per-section color washes.
export const Gradients = {
  // Per-section washes: a saturated tint at the top fading to the canvas.
  wash: {
    today: ['#16394D', '#0C0B0F'],
    progress: ['#123B5C', '#0C0B0F'],
    sleep: ['#2A1650', '#0C0B0F'],
    readiness: ['#123D1E', '#0C0B0F'],
    cardio: ['#4A1420', '#0C0B0F'],
    endurance: ['#3A3410', '#0C0B0F'],
    focus: ['#4A2E10', '#0C0B0F'],
    brand: ['#4A0E2A', '#0C0B0F'],
  },

  // Brand gradient (pink)
  brand: {
    pink: ['#FF2472', '#FF5B93'],
    pinkDeep: ['#E01560', '#FF2472'],
  },

  // Background gradients
  background: {
    pure: ['#0C0B0F', '#0C0B0F'],
    subtle: ['#0C0B0F', '#141218'],
    dark: ['#0C0B0F', '#1C1922'],
    card: ['#1C1922', '#26222E'],
  },

  // Emotion-based (repointed to the new accents)
  emotions: {
    energized: ['#FAE34B', '#EF8633'],
    calm: ['#6CE9CC', '#21A3E6'],
    happy: ['#FF2472', '#FAE34B'],
    stressed: ['#EB3E38', '#FF2472'],
    peaceful: ['#6CE9CC', '#BC26F4'],
    rainbow: ['#6CE9CC', '#21A3E6', '#5BC741', '#FAE34B', '#EF8633', '#EB3E38', '#BC26F4'],
  },

  // Special effect gradients
  special: {
    aurora: ['#6CE9CC', '#21A3E6', '#BC26F4'],
    sunset: ['#FAE34B', '#EF8633', '#FF2472'],
    ocean: ['#6CE9CC', '#21A3E6', '#BC26F4'],
    fire: ['#FAE34B', '#EF8633', '#EB3E38'],
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
  touchTargetMinSize: 44,
} as const;

/**
 * WCAG-compliant text colors
 */
export const AccessibleText = {
  onDark: {
    primary: 'rgba(255, 255, 255, 1)',
    secondary: 'rgba(255, 255, 255, 0.85)',
    tertiary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.6)',
    disabled: 'rgba(255, 255, 255, 0.45)',
  },
  onLight: {
    primary: 'rgba(0, 0, 0, 1)',
    secondary: 'rgba(0, 0, 0, 0.85)',
    tertiary: 'rgba(0, 0, 0, 0.7)',
    muted: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.45)',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ColorScheme = typeof Colors.light;
