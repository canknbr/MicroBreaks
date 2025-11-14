/**
 * Typography Design Tokens
 *
 * Based on the MicroBreaks Design System
 * Uses Inter font family with system fallbacks
 */

import { Platform } from 'react-native';

// Font Families
export const FontFamily = Platform.select({
  ios: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    // System fallbacks
    systemRegular: 'System',
    systemMedium: 'System',
    systemSemiBold: 'System',
    systemBold: 'System',
  },
  android: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    // System fallbacks
    systemRegular: 'sans-serif',
    systemMedium: 'sans-serif-medium',
    systemSemiBold: 'sans-serif-medium',
    systemBold: 'sans-serif',
  },
  default: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    systemRegular: 'System',
    systemMedium: 'System',
    systemSemiBold: 'System',
    systemBold: 'System',
  },
  web: {
    regular:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    medium:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    semiBold:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    bold: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    systemRegular: 'system-ui, sans-serif',
    systemMedium: 'system-ui, sans-serif',
    systemSemiBold: 'system-ui, sans-serif',
    systemBold: 'system-ui, sans-serif',
  },
}) as const;

// Font Weights
export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
} as const;

// Font Sizes (following PRD specifications)
export const FontSize = {
  // Display
  display: {
    large: 48,
    medium: 40,
    small: 36,
  },

  // Headlines
  headline: {
    large: 32, // Headlines
    medium: 28,
    small: 24,
  },

  // Title
  title: {
    large: 22,
    medium: 20,
    small: 18,
  },

  // Body
  body: {
    large: 16, // Body text
    medium: 14,
    small: 12, // Captions
  },

  // Label
  label: {
    large: 14,
    medium: 12,
    small: 10,
  },

  // Button
  button: {
    large: 18,
    medium: 16, // Standard button
    small: 14,
  },
} as const;

// Line Heights (1.5 ratio for body text, tighter for headlines)
export const LineHeight = {
  // Display
  display: {
    large: 56,
    medium: 48,
    small: 42,
  },

  // Headlines
  headline: {
    large: 40,
    medium: 36,
    small: 32,
  },

  // Title
  title: {
    large: 28,
    medium: 26,
    small: 24,
  },

  // Body
  body: {
    large: 24,
    medium: 21,
    small: 18,
  },

  // Label
  label: {
    large: 20,
    medium: 18,
    small: 16,
  },

  // Button
  button: {
    large: 24,
    medium: 24,
    small: 20,
  },
} as const;

// Letter Spacing
export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

// Typography Presets
export const Typography = {
  // Display Styles
  displayLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display.large,
    lineHeight: LineHeight.display.large,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
  },
  displayMedium: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display.medium,
    lineHeight: LineHeight.display.medium,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
  },
  displaySmall: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display.small,
    lineHeight: LineHeight.display.small,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.normal,
  },

  // Headline Styles (24-32px)
  headlineLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.headline.large,
    lineHeight: LineHeight.headline.large,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.normal,
  },
  headlineMedium: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.headline.medium,
    lineHeight: LineHeight.headline.medium,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.normal,
  },
  headlineSmall: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.headline.small,
    lineHeight: LineHeight.headline.small,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.normal,
  },

  // Title Styles
  titleLarge: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.title.large,
    lineHeight: LineHeight.title.large,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  titleMedium: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.title.medium,
    lineHeight: LineHeight.title.medium,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  titleSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.title.small,
    lineHeight: LineHeight.title.small,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },

  // Body Styles (14-16px)
  bodyLarge: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body.large,
    lineHeight: LineHeight.body.large,
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.normal,
  },
  bodyMedium: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body.medium,
    lineHeight: LineHeight.body.medium,
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.normal,
  },
  bodySmall: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.body.small,
    lineHeight: LineHeight.body.small,
    fontWeight: FontWeight.regular,
    letterSpacing: LetterSpacing.normal,
  },

  // Body Bold Styles
  bodyLargeBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.body.large,
    lineHeight: LineHeight.body.large,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  bodyMediumBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.body.medium,
    lineHeight: LineHeight.body.medium,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },

  // Label Styles
  labelLarge: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.label.large,
    lineHeight: LineHeight.label.large,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
  },
  labelMedium: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.label.medium,
    lineHeight: LineHeight.label.medium,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.wide,
  },
  labelSmall: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.label.small,
    lineHeight: LineHeight.label.small,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.wider,
  },

  // Button Styles (16px SemiBold)
  buttonLarge: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.button.large,
    lineHeight: LineHeight.button.large,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  buttonMedium: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.button.medium,
    lineHeight: LineHeight.button.medium,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  buttonSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.button.small,
    lineHeight: LineHeight.button.small,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },

  // Caption Style (12px Medium)
  caption: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.body.small,
    lineHeight: LineHeight.body.small,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
  },

  // Overline Style
  overline: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.label.small,
    lineHeight: LineHeight.label.small,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
} as const;

// Text Alignment
export const TextAlign = {
  left: 'left' as const,
  center: 'center' as const,
  right: 'right' as const,
  justify: 'justify' as const,
} as const;

// Text Transform
export const TextTransform = {
  none: 'none' as const,
  uppercase: 'uppercase' as const,
  lowercase: 'lowercase' as const,
  capitalize: 'capitalize' as const,
} as const;

// Text Decoration
export const TextDecoration = {
  none: 'none' as const,
  underline: 'underline' as const,
  lineThrough: 'line-through' as const,
  underlineLineThrough: 'underline line-through' as const,
} as const;

// Maximum line length for readability (in characters)
export const MaxLineLength = {
  body: 100, // As per .cursorrules
  code: 100,
} as const;

// Accessibility
export const TypographyAccessibility = {
  minimumFontSize: 12, // Minimum readable size
  minimumTouchTarget: 44, // iOS HIG minimum
  recommendedLineHeight: 1.5, // WCAG recommendation
} as const;

export type TypographyPreset = keyof typeof Typography;
