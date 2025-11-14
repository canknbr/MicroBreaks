/**
 * Spacing Design Tokens
 *
 * Based on 8px grid system from MicroBreaks Design System
 * Provides consistent spacing throughout the application
 */

// Base unit for spacing calculations
const BASE_UNIT = 8;

// Spacing Scale (8px grid system)
export const Spacing = {
  none: 0,
  xxs: BASE_UNIT * 0.5, // 4px
  xs: BASE_UNIT, // 8px
  sm: BASE_UNIT * 2, // 16px
  md: BASE_UNIT * 3, // 24px
  lg: BASE_UNIT * 4, // 32px
  xl: BASE_UNIT * 5, // 40px
  xxl: BASE_UNIT * 6, // 48px
  xxxl: BASE_UNIT * 8, // 64px

  // Semantic spacing names
  tiny: BASE_UNIT * 0.5, // 4px
  small: BASE_UNIT, // 8px
  medium: BASE_UNIT * 2, // 16px
  large: BASE_UNIT * 3, // 24px
  xlarge: BASE_UNIT * 4, // 32px
  xxlarge: BASE_UNIT * 6, // 48px
} as const;

// Component-specific spacing
export const ComponentSpacing = {
  // Container padding
  container: {
    horizontal: Spacing.sm, // 16px
    vertical: Spacing.md, // 24px
  },

  // Card spacing
  card: {
    padding: Spacing.sm, // 16px
    paddingLarge: Spacing.md, // 24px
    gap: Spacing.xs, // 8px
    margin: Spacing.sm, // 16px
  },

  // List spacing
  list: {
    itemGap: Spacing.xs, // 8px
    sectionGap: Spacing.md, // 24px
    padding: Spacing.sm, // 16px
  },

  // Button spacing
  button: {
    paddingHorizontal: Spacing.md, // 24px
    paddingVertical: Spacing.xs, // 8px
    paddingSmall: Spacing.xxs, // 4px
    gap: Spacing.xxs, // 4px (icon + text gap)
  },

  // Input spacing
  input: {
    padding: Spacing.xs, // 8px
    paddingHorizontal: Spacing.sm, // 16px
    marginBottom: Spacing.sm, // 16px
  },

  // Form spacing
  form: {
    fieldGap: Spacing.sm, // 16px
    sectionGap: Spacing.md, // 24px
    labelMargin: Spacing.xxs, // 4px
  },

  // Header/Navigation spacing
  header: {
    height: 56, // Standard header height
    paddingHorizontal: Spacing.sm, // 16px
  },

  // Tab bar spacing
  tabBar: {
    height: 64, // Standard tab bar height
    iconSize: 24,
    labelGap: Spacing.xxs, // 4px
    paddingVertical: Spacing.xs, // 8px
  },

  // Modal spacing
  modal: {
    padding: Spacing.md, // 24px
    gap: Spacing.sm, // 16px
    marginTop: Spacing.xl, // 40px
  },

  // Screen padding
  screen: {
    horizontal: Spacing.sm, // 16px
    vertical: Spacing.md, // 24px
    safeArea: Spacing.sm, // 16px
  },

  // Timer specific
  timer: {
    circleSize: 280,
    textPadding: Spacing.md, // 24px
    buttonMargin: Spacing.lg, // 32px
  },

  // Break card spacing
  breakCard: {
    padding: Spacing.sm, // 16px
    imageHeight: 200,
    contentGap: Spacing.xs, // 8px
  },

  // Exercise viewer
  exercise: {
    padding: Spacing.md, // 24px
    stepGap: Spacing.sm, // 16px
    controlsMargin: Spacing.lg, // 32px
  },
} as const;

// Border Radius
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999, // For pills/circular elements

  // Semantic names
  button: 8,
  card: 12,
  input: 8,
  modal: 16,
  avatar: 9999,
  badge: 9999,
} as const;

// Icon Sizes
export const IconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,

  // Semantic sizes
  tiny: 16,
  small: 20,
  medium: 24,
  large: 32,
  xlarge: 48,
} as const;

// Avatar Sizes
export const AvatarSize = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
  xxl: 96,
} as const;

// Touch Target Sizes
export const TouchTarget = {
  minimum: 44, // iOS HIG and Android Material Design minimum
  comfortable: 48, // Recommended size
  large: 56, // For primary actions
} as const;

// Layout breakpoints for responsive design
export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

// Z-Index layering
export const ZIndex = {
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
  tooltip: 1600,
} as const;

// Gap utilities (for Flexbox/Grid gap)
export const Gap = {
  none: 0,
  xs: Spacing.xs, // 8px
  sm: Spacing.sm, // 16px
  md: Spacing.md, // 24px
  lg: Spacing.lg, // 32px
  xl: Spacing.xl, // 40px
} as const;

// Maximum widths for content
export const MaxWidth = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
  full: '100%',
  content: 640, // For readable text content
} as const;

// Aspect Ratios
export const AspectRatio = {
  square: 1,
  video: 16 / 9,
  landscape: 4 / 3,
  portrait: 3 / 4,
  ultraWide: 21 / 9,
} as const;

// Helper function to calculate spacing multiples
export function spacing(multiplier: number): number {
  return BASE_UNIT * multiplier;
}

// Inset padding (for ScrollView contentInset, etc.)
export const Inset = {
  horizontal: {
    paddingHorizontal: Spacing.sm,
  },
  vertical: {
    paddingVertical: Spacing.md,
  },
  all: {
    padding: Spacing.sm,
  },
  none: {
    padding: 0,
  },
} as const;

// Grid system
export const Grid = {
  columns: 12,
  gutter: Spacing.sm, // 16px
  margin: Spacing.sm, // 16px
} as const;

export type SpacingValue = (typeof Spacing)[keyof typeof Spacing];
export type BorderRadiusValue = (typeof BorderRadius)[keyof typeof BorderRadius];
export type IconSizeValue = (typeof IconSize)[keyof typeof IconSize];
