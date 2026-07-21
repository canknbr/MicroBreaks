/**
 * Typography Design Tokens — "Outsiders" redesign
 *
 * Primary UI face: **General Sans** (bold neo-grotesque) — used for headings
 * AND body, differentiated by weight, matching the reference's single-family
 * system. Numeric / data face: **JetBrains Mono** (tabular) for the
 * "instrument dashboard" numerals (timers, %, counts, stat values).
 *
 * Fonts are registered at runtime in `app/_layout.tsx` via `expo-font`; the
 * family names below MUST match the keys passed to `useFonts()`.
 */

import { Platform } from 'react-native';

const sansStack =
  "'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const monoStack =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

// Font Families
export const FontFamily = Platform.select({
  ios: {
    regular: 'GeneralSans-Regular',
    medium: 'GeneralSans-Medium',
    semiBold: 'GeneralSans-Semibold',
    bold: 'GeneralSans-Bold',
    // Headings share the sans family at heavy weight. Kept under the legacy
    // `serif*` keys so existing display presets/consumers keep working.
    serifRegular: 'GeneralSans-Semibold',
    serifBold: 'GeneralSans-Bold',
    // Monospaced numeric / data face
    monoRegular: 'JetBrainsMono-Regular',
    mono: 'JetBrainsMono-Medium',
    monoBold: 'JetBrainsMono-Bold',
    // System fallbacks
    systemRegular: 'System',
    systemMedium: 'System',
    systemSemiBold: 'System',
    systemBold: 'System',
  },
  android: {
    regular: 'GeneralSans-Regular',
    medium: 'GeneralSans-Medium',
    semiBold: 'GeneralSans-Semibold',
    bold: 'GeneralSans-Bold',
    serifRegular: 'GeneralSans-Semibold',
    serifBold: 'GeneralSans-Bold',
    monoRegular: 'JetBrainsMono-Regular',
    mono: 'JetBrainsMono-Medium',
    monoBold: 'JetBrainsMono-Bold',
    systemRegular: 'sans-serif',
    systemMedium: 'sans-serif-medium',
    systemSemiBold: 'sans-serif-medium',
    systemBold: 'sans-serif',
  },
  default: {
    regular: 'GeneralSans-Regular',
    medium: 'GeneralSans-Medium',
    semiBold: 'GeneralSans-Semibold',
    bold: 'GeneralSans-Bold',
    serifRegular: 'GeneralSans-Semibold',
    serifBold: 'GeneralSans-Bold',
    monoRegular: 'JetBrainsMono-Regular',
    mono: 'JetBrainsMono-Medium',
    monoBold: 'JetBrainsMono-Bold',
    systemRegular: 'System',
    systemMedium: 'System',
    systemSemiBold: 'System',
    systemBold: 'System',
  },
  web: {
    regular: sansStack,
    medium: sansStack,
    semiBold: sansStack,
    bold: sansStack,
    serifRegular: sansStack,
    serifBold: sansStack,
    monoRegular: monoStack,
    mono: monoStack,
    monoBold: monoStack,
    systemRegular: 'system-ui, sans-serif',
    systemMedium: 'system-ui, sans-serif',
    systemSemiBold: 'system-ui, sans-serif',
    systemBold: 'system-ui, sans-serif',
  },
});

// Font Weights
export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
} as const;

// Font Sizes
export const FontSize = {
  // Display — big editorial headlines
  display: {
    large: 48,
    medium: 40,
    small: 34,
  },
  // Headlines
  headline: {
    large: 30,
    medium: 26,
    small: 22,
  },
  // Title
  title: {
    large: 20,
    medium: 18,
    small: 16,
  },
  // Body
  body: {
    large: 16,
    medium: 15,
    small: 13,
  },
  // Label
  label: {
    large: 14,
    medium: 12,
    small: 11,
  },
  // Button
  button: {
    large: 18,
    medium: 16,
    small: 14,
  },
  // Numeric / data (instrument readouts)
  numeric: {
    hero: 56,
    large: 40,
    medium: 24,
    small: 15,
  },
} as const;

// Line Heights
export const LineHeight = {
  display: {
    large: 52,
    medium: 44,
    small: 38,
  },
  headline: {
    large: 36,
    medium: 32,
    small: 28,
  },
  title: {
    large: 26,
    medium: 24,
    small: 22,
  },
  body: {
    large: 24,
    medium: 22,
    small: 18,
  },
  label: {
    large: 20,
    medium: 16,
    small: 14,
  },
  button: {
    large: 24,
    medium: 22,
    small: 20,
  },
  numeric: {
    hero: 58,
    large: 42,
    medium: 26,
    small: 18,
  },
} as const;

// Letter Spacing — the reference tracks headings tight, labels wide
export const LetterSpacing = {
  tighter: -1,
  tight: -0.4,
  normal: 0,
  wide: 0.6,
  wider: 1.2,
  widest: 1.6,
} as const;

// Typography Presets
export const Typography = {
  // Display — heavy General Sans, tight tracking (editorial hero)
  displayLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display.large,
    lineHeight: LineHeight.display.large,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tighter,
  },
  displayMedium: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display.medium,
    lineHeight: LineHeight.display.medium,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tighter,
  },
  displaySmall: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display.small,
    lineHeight: LineHeight.display.small,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
  },

  // Headline — bold, tight
  headlineLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.headline.large,
    lineHeight: LineHeight.headline.large,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
  },
  headlineMedium: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.headline.medium,
    lineHeight: LineHeight.headline.medium,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
  },
  headlineSmall: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.headline.small,
    lineHeight: LineHeight.headline.small,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
  },

  // Title — semibold
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

  // Body
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

  // Body Bold
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

  // Label
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
    letterSpacing: LetterSpacing.wide,
  },

  // Section label / eyebrow — small-caps, letter-spaced, muted (color by consumer)
  // Matches the reference's "4-WEEK OVERVIEW", "GENERAL", "BODY METRICS" headers.
  sectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.label.medium,
    lineHeight: LineHeight.label.medium,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },

  // Button (pill CTAs) — bold
  buttonLarge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.button.large,
    lineHeight: LineHeight.button.large,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.normal,
  },
  buttonMedium: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.button.medium,
    lineHeight: LineHeight.button.medium,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.normal,
  },
  buttonSmall: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.button.small,
    lineHeight: LineHeight.button.small,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.normal,
  },

  // Numeric / data readouts — JetBrains Mono, tabular ("instrument dashboard")
  numericHero: {
    fontFamily: FontFamily.monoBold,
    fontSize: FontSize.numeric.hero,
    lineHeight: LineHeight.numeric.hero,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
    fontVariant: ['tabular-nums'] as const,
  },
  numericLarge: {
    fontFamily: FontFamily.monoBold,
    fontSize: FontSize.numeric.large,
    lineHeight: LineHeight.numeric.large,
    fontWeight: FontWeight.bold,
    letterSpacing: LetterSpacing.tight,
    fontVariant: ['tabular-nums'] as const,
  },
  numericMedium: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.numeric.medium,
    lineHeight: LineHeight.numeric.medium,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
    fontVariant: ['tabular-nums'] as const,
  },
  numericSmall: {
    fontFamily: FontFamily.mono,
    fontSize: FontSize.numeric.small,
    lineHeight: LineHeight.numeric.small,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
    fontVariant: ['tabular-nums'] as const,
  },

  // Caption
  caption: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.body.small,
    lineHeight: LineHeight.body.small,
    fontWeight: FontWeight.medium,
    letterSpacing: LetterSpacing.normal,
  },

  // Overline
  overline: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.label.small,
    lineHeight: LineHeight.label.small,
    fontWeight: FontWeight.semiBold,
    letterSpacing: LetterSpacing.widest,
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
  body: 100,
  code: 100,
} as const;

// Accessibility
export const TypographyAccessibility = {
  minimumFontSize: 12,
  minimumTouchTarget: 44,
  recommendedLineHeight: 1.5,
} as const;

export type TypographyPreset = keyof typeof Typography;
