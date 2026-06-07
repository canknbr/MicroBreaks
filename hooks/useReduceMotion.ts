/**
 * useReduceMotion Hook
 *
 * Reads the platform-level "Reduce Motion" accessibility setting and stays
 * in sync as the user toggles it from system settings. Use this to skip or
 * shorten non-essential animations so users with vestibular disorders or
 * motion sensitivity get a calmer experience.
 *
 * Example:
 *   const reduceMotion = useReduceMotion();
 *   const duration = reduceMotion ? 0 : 300;
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceMotion(enabled);
        }
      })
      .catch(() => {
        // Some platforms (web) may not implement this; default to off.
      });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        setReduceMotion(enabled);
      }
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}

export default useReduceMotion;
