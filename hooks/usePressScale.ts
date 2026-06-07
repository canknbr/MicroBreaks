/**
 * usePressScale
 *
 * Standard "tap feels good" micro-interaction used across the app.
 * Returns a press-in/press-out pair plus an animated style that scales
 * a view down to ~0.96 and lowers opacity to 0.85 while held — the
 * exact press feel Calm/Forest/Headspace ship.
 *
 * Respects Reduce Motion: with the system preference on, the scale is
 * skipped (opacity dim still applies so the user knows the tap
 * registered).
 *
 * Pair this with `useHapticChoreography().tapBack()` on press to make
 * every Pressable feel signed.
 *
 * Example:
 *   const { handlers, style } = usePressScale();
 *   return (
 *     <Animated.View style={style}>
 *       <Pressable {...handlers} onPress={onPress}>
 *         ...
 *       </Pressable>
 *     </Animated.View>
 *   );
 */

import { useCallback, useMemo } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '@/hooks/useReduceMotion';

interface UsePressScaleOptions {
  /** Target scale while pressed (default 0.96). */
  pressedScale?: number;
  /** Opacity while pressed (default 0.85). */
  pressedOpacity?: number;
}

export function usePressScale({
  pressedScale = 0.96,
  pressedOpacity = 0.85,
}: UsePressScaleOptions = {}) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (!reduceMotion) {
      scale.value = withSpring(pressedScale, { damping: 18, stiffness: 320, mass: 0.4 });
    }
    opacity.value = withTiming(pressedOpacity, { duration: 80 });
  }, [opacity, pressedOpacity, pressedScale, reduceMotion, scale]);

  const onPressOut = useCallback(() => {
    if (!reduceMotion) {
      scale.value = withSpring(1, { damping: 14, stiffness: 240, mass: 0.5 });
    }
    opacity.value = withTiming(1, { duration: 120 });
  }, [opacity, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlers = useMemo(() => ({ onPressIn, onPressOut }), [onPressIn, onPressOut]);

  return { handlers, style };
}

export default usePressScale;
