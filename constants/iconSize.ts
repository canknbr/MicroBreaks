/**
 * Standard icon size scale for the app.
 *
 * Use these tokens instead of inline sizes so iconography stays visually
 * consistent across screens and screen densities. Pair with the Ionicons
 * library — that is the chosen primary vector source for the project.
 */
export const IconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

export type IconSizeKey = keyof typeof IconSize;
