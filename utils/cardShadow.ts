import type { ViewStyle } from 'react-native';

/**
 * Build the app's standard card drop-shadow.
 *
 * Every card surface repeated the same block: a black shadow whose opacity and
 * Android elevation collapse to 0 in dark mode (cards read flat on dark
 * backgrounds), while color/offset/radius stay fixed. This centralizes that
 * `isDark ? 0 : x` rule so the ~15 call sites can't drift apart.
 */
export function cardShadow(
  isDark: boolean,
  spec: { height: number; opacity: number; radius: number; elevation: number }
): ViewStyle {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: spec.height },
    shadowOpacity: isDark ? 0 : spec.opacity,
    shadowRadius: spec.radius,
    elevation: isDark ? 0 : spec.elevation,
  };
}
