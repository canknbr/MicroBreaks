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
    main: '#06FFA5',
    light: '#5FFFC4',
    dark: '#00CC84',
    glow: 'rgba(6, 255, 165, 0.15)',
    glowStrong: 'rgba(6, 255, 165, 0.3)',
  },

  // Secondary - Calm Purple (represents mindfulness)
  secondary: {
    main: '#B47EFF',
    light: '#D4B3FF',
    dark: '#9055E8',
    glow: 'rgba(180, 126, 255, 0.12)',
  },

  // Accent - Warm Gold (represents energy, achievement)
  accent: {
    main: '#FFD166',
    light: '#FFE099',
    dark: '#FFBE33',
    glow: 'rgba(255, 209, 102, 0.15)',
  },

  // Semantic Colors
  success: '#06FFA5',
  warning: '#FFD166',
  error: '#FF6B6B',
  info: '#00E5FF',

  // Background Layers (pure black base)
  background: {
    pure: '#000000',
    elevated: '#0A0A0F',
    card: '#12121A',
    cardHover: '#1A1A24',
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
    focus: '#06FFA5',
  },

  // Ambient Gradients (for background effects)
  ambient: {
    teal: ['rgba(6, 255, 165, 0.08)', 'transparent'],
    purple: ['rgba(180, 126, 255, 0.06)', 'transparent'],
    warm: ['rgba(255, 209, 102, 0.05)', 'transparent'],
  },
} as const;

// ==================== TYPOGRAPHY ====================
export const ZenTypography = {
  // Display - For hero text, numbers
  display: {
    large: {
      fontSize: 56,
      lineHeight: 64,
      fontWeight: '200' as const,
      letterSpacing: -1,
    },
    medium: {
      fontSize: 44,
      lineHeight: 52,
      fontWeight: '200' as const,
      letterSpacing: -0.5,
    },
    small: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '300' as const,
      letterSpacing: 0,
    },
  },

  // Headline - For section titles
  headline: {
    large: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '600' as const,
      letterSpacing: -0.3,
    },
    medium: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
    },
    small: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
  },

  // Title - For card titles
  title: {
    large: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    medium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
  },

  // Body - For content
  body: {
    large: {
      fontSize: 17,
      lineHeight: 26,
      fontWeight: '400' as const,
      letterSpacing: 0.2,
    },
    medium: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
      letterSpacing: 0.1,
    },
    small: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400' as const,
      letterSpacing: 0.1,
    },
  },

  // Label - For buttons, tags
  label: {
    large: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
    medium: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
  },

  // Caption - For hints, meta
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
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
    default: ['#000000', '#050510', '#0A0A18'],
    elevated: ['#0A0A0F', '#12121A'],
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
    teal: [ZenColors.primary.main, '#00E5FF', ZenColors.primary.dark],
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
