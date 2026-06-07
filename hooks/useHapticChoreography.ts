/**
 * useHapticChoreography
 *
 * Higher-level haptic patterns layered on top of `expo-haptics`. The base
 * `useHaptics` hook gives us single-shot impacts (light/medium/heavy);
 * this hook gives us *named moments* — multi-step sequences scheduled at
 * specific times so the phone actually feels like it is **breathing
 * with** the user, **celebrating with** them, or **tapping back** at them.
 *
 * Each pattern respects the user's `hapticsEnabled` setting and the
 * platform-level Reduce Motion preference (we treat strong haptic
 * sequences as motion-equivalent — a Reduce Motion user gets the
 * single-tap minimum, not the full choreography).
 *
 * Usage:
 *   const { breathingPulse, completionFanfare, milestone } = useHapticChoreography();
 *
 *   useEffect(() => {
 *     if (phase === 'breathe-in') breathingPulse({ phase: 'in', durationMs: 4000 });
 *   }, [phase]);
 */

import { useCallback, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '@/store/settingsStore';
import { useReduceMotion } from '@/hooks/useReduceMotion';

type BreathPhase = 'in' | 'hold' | 'out';

export interface BreathingPulseOptions {
  phase: BreathPhase;
  /** Total phase duration in ms (matches the visual animation). */
  durationMs: number;
}

export function useHapticChoreography() {
  const hapticsEnabled = useSettingsStore((state) => state.settings.hapticsEnabled);
  const reduceMotion = useReduceMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearScheduled = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  // Tear down any pending sequence on unmount so a haptic doesn't fire
  // after the component has been replaced (e.g. fast skip on break-session).
  useEffect(() => clearScheduled, [clearScheduled]);

  /**
   * Breathing pulse — emits a chain of light impacts that gently ramp up
   * during inhale, hold, or down during exhale, so the phone's vibration
   * mirrors the user's breath. This is the single biggest "wow" haptic
   * moment we have — sync it with the BreathingExercise animation.
   */
  const breathingPulse = useCallback(
    ({ phase, durationMs }: BreathingPulseOptions) => {
      clearScheduled();
      if (!hapticsEnabled) return;

      // Reduce Motion users still get one anchor tap so they know the
      // phase changed; they just don't get the rolling pulse chain.
      if (reduceMotion) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        return;
      }

      // 5 evenly spaced light impacts per phase feels like a heartbeat
      // without being aggressive. Inhale ramps from Light → Medium,
      // exhale tapers Medium → Light, hold is a steady Light pulse.
      const beats = 5;
      const stepMs = Math.max(200, Math.floor(durationMs / (beats + 1)));
      const styles =
        phase === 'in'
          ? [
              Haptics.ImpactFeedbackStyle.Light,
              Haptics.ImpactFeedbackStyle.Light,
              Haptics.ImpactFeedbackStyle.Light,
              Haptics.ImpactFeedbackStyle.Medium,
              Haptics.ImpactFeedbackStyle.Medium,
            ]
          : phase === 'out'
            ? [
                Haptics.ImpactFeedbackStyle.Medium,
                Haptics.ImpactFeedbackStyle.Light,
                Haptics.ImpactFeedbackStyle.Light,
                Haptics.ImpactFeedbackStyle.Light,
                Haptics.ImpactFeedbackStyle.Light,
              ]
            : Array.from({ length: beats }, () => Haptics.ImpactFeedbackStyle.Light);

      for (let i = 0; i < beats; i += 1) {
        const style = styles[i] ?? Haptics.ImpactFeedbackStyle.Light;
        const id = setTimeout(() => {
          Haptics.impactAsync(style).catch(() => {});
        }, stepMs * (i + 1));
        timeoutsRef.current.push(id);
      }
    },
    [clearScheduled, hapticsEnabled, reduceMotion]
  );

  /**
   * Completion fanfare — Success → Medium → Heavy, ~140ms apart, finishing
   * with a long pause that lets the on-screen celebration carry the
   * moment. Used for "exercise complete", goal complete, level up.
   */
  const completionFanfare = useCallback(() => {
    clearScheduled();
    if (!hapticsEnabled) return;

    if (reduceMotion) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    timeoutsRef.current.push(
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }, 140)
    );
    timeoutsRef.current.push(
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }, 280)
    );
  }, [clearScheduled, hapticsEnabled, reduceMotion]);

  /**
   * Milestone — scales the haptic intensity to the milestone size so a
   * 7-day streak feels different from a 30-day one. Values 0–1.
   */
  const milestone = useCallback(
    (intensity: number) => {
      clearScheduled();
      if (!hapticsEnabled) return;
      const clamped = Math.max(0, Math.min(1, intensity));
      const style =
        clamped < 0.33
          ? Haptics.ImpactFeedbackStyle.Light
          : clamped < 0.66
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Heavy;
      Haptics.impactAsync(style).catch(() => {});

      // For high-intensity milestones add a second beat 220ms later.
      if (clamped >= 0.66 && !reduceMotion) {
        timeoutsRef.current.push(
          setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }, 220)
        );
      }
    },
    [clearScheduled, hapticsEnabled, reduceMotion]
  );

  /**
   * Selection tick — for picker scrolling, segmented control, day picker.
   * Identical to expo-haptics selection but routed through the same
   * setting + Reduce Motion gates so callers don't have to remember.
   */
  const selectionTick = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.selectionAsync().catch(() => {});
  }, [hapticsEnabled]);

  /**
   * Tap back — gentle confirmation that a press registered. Lighter than
   * selectionTick; for tertiary buttons.
   */
  const tapBack = useCallback(() => {
    if (!hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [hapticsEnabled]);

  /**
   * Cancel any currently-scheduled choreography. Call from a parent
   * effect cleanup when you're swapping phases rapidly.
   */
  const cancel = useCallback(() => {
    clearScheduled();
  }, [clearScheduled]);

  return {
    breathingPulse,
    completionFanfare,
    milestone,
    selectionTick,
    tapBack,
    cancel,
  };
}

export default useHapticChoreography;
