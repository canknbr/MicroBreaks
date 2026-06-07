/**
 * useTimer Hook
 * Bridges the timer store and service, manages tick lifecycle and phase transitions
 */

import { useEffect, useRef, useCallback } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  useTimerSession,
  useTimerActions,
  useTimerProgress,
  useTimerStats,
  useTimerPreferences,
} from '@/store/timerStore';
import { useHapticsEnabled } from '@/store/settingsStore';
import { startTicking, stopTicking } from '@/services/timerService';
import { PHASE_COLORS, PHASE_ICONS, TIMER_PRESETS } from '@/constants/timer';
import type { TimerPhase } from '@/constants/timer';

export function useTimer() {
  const session = useTimerSession();
  const actions = useTimerActions();
  const progress = useTimerProgress();
  const stats = useTimerStats();
  const preferences = useTimerPreferences();
  const hapticsEnabled = useHapticsEnabled();
  const prevPhaseRef = useRef<TimerPhase>(session.phase);

  // Manage tick interval based on session state
  useEffect(() => {
    if (session.isActive && !session.isPaused) {
      startTicking();
    } else {
      stopTicking();
    }

    return () => {
      // Don't stop ticking on unmount if still active — AppState handler manages background
    };
  }, [session.isActive, session.isPaused]);

  // Detect phase transitions for side effects
  useEffect(() => {
    if (prevPhaseRef.current !== session.phase) {
      const prevPhase = prevPhaseRef.current;
      prevPhaseRef.current = session.phase;

      // Haptic feedback on phase change
      if (hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // If work phase just completed and we moved to break, suggest exercise
      if (prevPhase === 'work' && (session.phase === 'break' || session.phase === 'longBreak')) {
        // Break started — could navigate to break-session
      }
    }
  }, [session.phase, hapticsEnabled]);

  const start = useCallback(() => {
    actions.startWorkSession();
  }, [actions]);

  const pause = useCallback(() => {
    actions.pause();
  }, [actions]);

  const resume = useCallback(() => {
    actions.resume();
  }, [actions]);

  const skip = useCallback(() => {
    actions.skip();
  }, [actions]);

  const reset = useCallback(() => {
    stopTicking();
    actions.reset();
  }, [actions]);

  const startBreakExercise = useCallback(() => {
    router.push('/break-session');
  }, []);

  // Format remaining time as mm:ss
  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const formattedTime = formatTime(session.remainingSeconds);

  const activePreset = TIMER_PRESETS.find((p) => p.id === preferences.selectedPresetId) ?? TIMER_PRESETS[0];

  const phaseColor = PHASE_COLORS[session.phase];
  const phaseIcon = PHASE_ICONS[session.phase];
  const phaseLabel =
    session.phase === 'work'
      ? 'Focus'
      : session.phase === 'break'
        ? 'Break'
        : 'Long Break';

  return {
    // State
    session,
    stats,
    preferences,
    progress,
    formattedTime,
    phaseColor,
    phaseIcon,
    phaseLabel,
    activePreset,

    // Actions
    start,
    pause,
    resume,
    skip,
    reset,
    startBreakExercise,
    setPreset: actions.setPreset,
    setCustomDurations: actions.setCustomDurations,
    toggleAutoStartBreak: actions.toggleAutoStartBreak,
    toggleAutoStartWork: actions.toggleAutoStartWork,
  };
}
