/**
 * useHaptics Hook
 * Provides haptic feedback that respects user settings
 */

import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

export function useHaptics() {
  const hapticsEnabled = useSettingsStore((state) => state.settings.hapticsEnabled);

  // Light impact - for subtle interactions (button taps, selections)
  const light = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [hapticsEnabled]);

  // Medium impact - for more significant actions (toggling, confirming)
  const medium = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [hapticsEnabled]);

  // Heavy impact - for important actions (completing breaks, achievements)
  const heavy = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [hapticsEnabled]);

  // Success notification - for positive outcomes (goal reached, achievement unlocked)
  const success = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [hapticsEnabled]);

  // Warning notification - for caution situations (sign out, delete)
  const warning = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [hapticsEnabled]);

  // Error notification - for failures or issues
  const error = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [hapticsEnabled]);

  // Selection feedback - for pickers and selections
  const selection = useCallback(() => {
    if (hapticsEnabled) {
      Haptics.selectionAsync();
    }
  }, [hapticsEnabled]);

  // Generic impact with style parameter
  const impact = useCallback((style: HapticStyle = 'light') => {
    if (!hapticsEnabled) return;

    switch (style) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
    }
  }, [hapticsEnabled]);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
    impact,
    isEnabled: hapticsEnabled,
  };
}

export default useHaptics;
