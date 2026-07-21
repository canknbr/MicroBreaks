/**
 * Premium Zen Master Design System
 *
 * Inspired by:
 * - Calm App's breathing animations
 * - How We Feel's emotional colors
 * - Apple Watch's activity rings
 * - Japanese zen minimalism
 */

// ==================== COLOR PALETTE ====================
export const ZenColors = {
  // Primary - Healing Teal (represents growth, wellness)
  primary: {
    main: '#FF2472',
    light: '#FF5B93',
    dark: '#E01560',
    glow: 'rgba(255, 36, 114, 0.16)',
    glowStrong: 'rgba(255, 36, 114, 0.3)',
  },

  // Secondary - Calm Purple (represents mindfulness)
  secondary: {
    main: '#BC26F4',
    light: '#D4B3FF',
    dark: '#BC26F4',
    glow: 'rgba(180, 126, 255, 0.12)',
  },

  // Accent - Warm Gold (represents energy, achievement)
  accent: {
    main: '#FAE34B',
    light: '#FFE099',
    dark: '#FAE34B',
    glow: 'rgba(255, 209, 102, 0.15)',
  },

  // Semantic Colors
  success: '#FF2472',
  warning: '#FAE34B',
  error: '#EB3E38',
  info: '#FF2472',

  // Background Layers (pure black base)
  background: {
    pure: '#0C0B0F',
    elevated: '#141218',
    card: '#1C1922',
    cardHover: '#26222E',
  },

  // Text Hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    tertiary: 'rgba(255, 255, 255, 0.5)',
    muted: 'rgba(255, 255, 255, 0.35)',
    inverse: '#000000',
  },

  // Border Colors
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    default: 'rgba(255, 255, 255, 0.12)',
    strong: 'rgba(255, 255, 255, 0.2)',
    focus: '#FF2472',
  },

  // Ambient Gradients (for background effects)
  ambient: {
    teal: ['rgba(255, 36, 114, 0.10)', 'transparent'],
    purple: ['rgba(188, 38, 244, 0.07)', 'transparent'],
    warm: ['rgba(250, 227, 75, 0.05)', 'transparent'],
  },
} as const;

// ==================== TYPOGRAPHY ====================
// Uses General Sans (bold neo-grotesque) across the onboarding, matching the
// rest of the app. Display/headline are heavy + tight (editorial); body is
// regular General Sans.
export const ZenTypography = {
  // Display - For hero text
  display: {
    large: {
      fontFamily: 'GeneralSans-Bold',
      fontSize: 44,
      lineHeight: 48,
      fontWeight: '700' as const,
      letterSpacing: -1.2,
    },
    medium: {
      fontFamily: 'GeneralSans-Bold',
      fontSize: 38,
      lineHeight: 42,
      fontWeight: '700' as const,
      letterSpacing: -1,
    },
    small: {
      fontFamily: 'GeneralSans-Bold',
      fontSize: 32,
      lineHeight: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.6,
    },
  },

  // Headline - For section titles
  headline: {
    large: {
      fontFamily: 'GeneralSans-Bold',
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    medium: {
      fontFamily: 'GeneralSans-Bold',
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '700' as const,
      letterSpacing: -0.4,
    },
    small: {
      fontFamily: 'GeneralSans-Bold',
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '700' as const,
      letterSpacing: -0.2,
    },
  },

  // Title - For card titles
  title: {
    large: {
      fontFamily: 'GeneralSans-Semibold',
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    medium: {
      fontFamily: 'GeneralSans-Semibold',
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
  },

  // Body - For content
  body: {
    large: {
      fontFamily: 'GeneralSans-Regular',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    medium: {
      fontFamily: 'GeneralSans-Regular',
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    small: {
      fontFamily: 'GeneralSans-Regular',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
  },

  // Label - For buttons, tags
  label: {
    large: {
      fontFamily: 'GeneralSans-Bold',
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '700' as const,
      letterSpacing: 0,
    },
    medium: {
      fontFamily: 'GeneralSans-Semibold',
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
    },
    small: {
      fontFamily: 'GeneralSans-Semibold',
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600' as const,
      letterSpacing: 1.4,
      textTransform: 'uppercase' as const,
    },
  },

  // Caption - For hints, meta
  caption: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
} as const;

// ==================== SPACING ====================
export const ZenSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ==================== BORDER RADIUS ====================
export const ZenRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

// ==================== SHADOWS ====================
export const ZenShadows = {
  glow: {
    primary: {
      shadowColor: ZenColors.primary.main,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 10,
    },
    secondary: {
      shadowColor: ZenColors.secondary.main,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    subtle: {
      shadowColor: '#FFFFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ==================== ANIMATIONS ====================
export const ZenAnimations = {
  // Durations
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
    breathing: 4000, // For breathing animations
  },

  // Spring configs for Reanimated
  spring: {
    gentle: { damping: 20, stiffness: 80 },
    default: { damping: 15, stiffness: 100 },
    bouncy: { damping: 12, stiffness: 150 },
    snappy: { damping: 18, stiffness: 200 },
  },

  // Easing presets
  easing: {
    smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
  },
} as const;

// ==================== COMPONENT SIZES ====================
export const ZenSizes = {
  button: {
    height: 56,
    minWidth: 120,
    iconSize: 20,
  },
  card: {
    minHeight: 72,
    padding: ZenSpacing.md,
  },
  input: {
    height: 52,
    padding: ZenSpacing.md,
  },
  checkbox: {
    size: 24,
    iconSize: 14,
  },
  progressBar: {
    height: 3,
  },
  iconButton: {
    size: 44,
    iconSize: 24,
  },
} as const;

// ==================== GRADIENTS ====================
export const ZenGradients = {
  // Background gradients
  background: {
    default: ['#0C0B0F', '#0C0B0F', '#141218'],
    elevated: ['#141218', '#1C1922'],
  },

  // Button gradients
  button: {
    primary: [ZenColors.primary.main, ZenColors.primary.dark],
    secondary: [ZenColors.secondary.main, ZenColors.secondary.dark],
    accent: [ZenColors.accent.main, ZenColors.accent.dark],
  },

  // Ambient glow gradients
  glow: {
    teal: ['rgba(6, 255, 165, 0.2)', 'rgba(6, 255, 165, 0)'],
    purple: ['rgba(180, 126, 255, 0.15)', 'rgba(180, 126, 255, 0)'],
    gold: ['rgba(255, 209, 102, 0.12)', 'rgba(255, 209, 102, 0)'],
  },

  // Progress/ring gradients
  ring: {
    teal: [ZenColors.primary.main, '#FF2472', ZenColors.primary.dark],
    purple: [ZenColors.secondary.light, ZenColors.secondary.main, ZenColors.secondary.dark],
    gold: [ZenColors.accent.light, ZenColors.accent.main, ZenColors.accent.dark],
  },
} as const;

// ==================== HAPTICS ====================
export const ZenHaptics = {
  selection: 'selection' as const,
  light: 'light' as const,
  medium: 'medium' as const,
  heavy: 'heavy' as const,
  success: 'success' as const,
  warning: 'warning' as const,
  error: 'error' as const,
} as const;

// ==================== EXPORT ALL ====================
export const ZenTheme = {
  colors: ZenColors,
  typography: ZenTypography,
  spacing: ZenSpacing,
  radius: ZenRadius,
  shadows: ZenShadows,
  animations: ZenAnimations,
  sizes: ZenSizes,
  gradients: ZenGradients,
  haptics: ZenHaptics,
} as const;

export default ZenTheme;
