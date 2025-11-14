/**
 * MicroBreaks Design System
 *
 * Central export for all theme tokens and design primitives
 * Import from here to access all design system elements
 *
 * @example
 * ```typescript
 * import { Colors, Typography, Spacing } from '@/theme';
 * ```
 */

// Core Design Tokens
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './animations';

// Re-export commonly used types
export type {
  ThemeMode,
  ColorScheme,
  TypographyPreset,
  SpacingValue,
  BorderRadiusValue,
  IconSizeValue,
  ShadowLevel,
  ComponentShadowType,
  DurationValue,
  EasingValue,
  TransitionType,
} from './colors';

export type { ShadowStyle } from './shadows';

// Theme configuration
import { Colors, ColorPalette } from './colors';
import { Typography, FontFamily, FontSize, LineHeight } from './typography';
import { Spacing, BorderRadius, IconSize, ComponentSpacing } from './spacing';
import { Shadows, ComponentShadows } from './shadows';
import { Duration, Easing, Transition } from './animations';

/**
 * Main theme object combining all design tokens
 * Use this for comprehensive theme access
 */
export const Theme = {
  colors: Colors,
  palette: ColorPalette,
  typography: Typography,
  fonts: FontFamily,
  fontSize: FontSize,
  lineHeight: LineHeight,
  spacing: Spacing,
  componentSpacing: ComponentSpacing,
  borderRadius: BorderRadius,
  iconSize: IconSize,
  shadows: Shadows,
  componentShadows: ComponentShadows,
  duration: Duration,
  easing: Easing,
  transition: Transition,
} as const;

/**
 * Get theme based on mode (light/dark)
 */
export function getTheme(mode: 'light' | 'dark') {
  return {
    ...Theme,
    colors: Colors[mode],
    mode,
  };
}

/**
 * Default theme (light mode)
 */
export const defaultTheme = getTheme('light');

/**
 * Dark theme
 */
export const darkTheme = getTheme('dark');

// Type for the complete theme object
export type ThemeType = typeof Theme;
export type ThemedColors = typeof Colors.light;

// Export default theme
export default Theme;
