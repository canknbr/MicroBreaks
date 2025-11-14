/**
 * Shadow Design Tokens
 *
 * Elevation system for creating depth and hierarchy
 * Supports both iOS and Android shadow styles
 */

import { Platform, ViewStyle } from 'react-native';

// Shadow configuration type
export interface ShadowStyle {
  shadowColor?: string;
  shadowOffset?: {
    width: number;
    height: number;
  };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number; // Android specific
}

// iOS shadow styles
const iosShadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
} as const;

// Android elevation values
const androidElevations = {
  none: 0,
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 16,
  xxl: 24,
} as const;

// Combined shadow styles (works for both platforms)
export const Shadows = Platform.select({
  ios: {
    none: iosShadows.none,
    xs: iosShadows.xs,
    sm: iosShadows.sm,
    md: iosShadows.md,
    lg: iosShadows.lg,
    xl: iosShadows.xl,
    xxl: iosShadows.xxl,
  },
  android: {
    none: { elevation: androidElevations.none },
    xs: { elevation: androidElevations.xs },
    sm: { elevation: androidElevations.sm },
    md: { elevation: androidElevations.md },
    lg: { elevation: androidElevations.lg },
    xl: { elevation: androidElevations.xl },
    xxl: { elevation: androidElevations.xxl },
  },
  default: iosShadows,
}) as Record<keyof typeof iosShadows, ShadowStyle>;

// Component-specific shadows
export const ComponentShadows = {
  card: Shadows.sm,
  cardHover: Shadows.md,
  button: Shadows.xs,
  buttonPressed: Shadows.none,
  modal: Shadows.xxl,
  dropdown: Shadows.lg,
  floatingAction: Shadows.lg,
  bottomSheet: Shadows.xl,
  header: Shadows.xs,
  tooltip: Shadows.md,
} as const;

// Colored shadows for specific use cases
export const ColoredShadows = {
  primary: Platform.select({
    ios: {
      shadowColor: '#4A90E2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#4A90E2',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
  }),
  success: Platform.select({
    ios: {
      shadowColor: '#7ED321',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#7ED321',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
  }),
  error: Platform.select({
    ios: {
      shadowColor: '#E74C3C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: '#E74C3C',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
  }),
} as const;

// Inner shadows (requires custom implementation with gradients)
export const InnerShadows = {
  inset: {
    description: 'Use gradient overlay to simulate inner shadow',
    colors: ['rgba(0,0,0,0.05)', 'transparent'],
  },
} as const;

// Helper function to create custom shadow
export function createShadow(
  height: number,
  opacity: number,
  radius: number,
  color: string = '#000'
): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation: height * 2,
    },
    default: {
      shadowColor: color,
      shadowOffset: { width: 0, height },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
  }) as ViewStyle;
}

export type ShadowLevel = keyof typeof Shadows;
export type ComponentShadowType = keyof typeof ComponentShadows;
