/**
 * Timer Store
 * Manages Pomodoro/focus timer state with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TimerPhase } from '@/constants/timer';
import { TIMER_PRESETS, DEFAULT_PRESET_ID } from '@/constants/timer';

interface TimerSession {
  isActive: boolean;
  isPaused: boolean;
  phase: TimerPhase;
  remainingSeconds: number;
  phaseDurationSeconds: number;
  currentSession: number; // which work session we're on (1-indexed)
  phaseStartedAt: number | null; // timestamp for background recovery
  pausedAt: number | null; // timestamp when paused
}

interface TimerStats {
  todayFocusMinutes: number;
  totalFocusMinutes: number;
  todaySessionsCompleted: number;
  lastResetDate: string; // YYYY-MM-DD for daily reset
}

interface TimerPreferences {
  selectedPresetId: string;
  customWorkMinutes: number;
  customBreakMinutes: number;
  customLongBreakMinutes: number;
  customSessionsUntilLongBreak: number;
  autoStartBreak: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface TimerState {
  session: TimerSession;
  stats: TimerStats;
  preferences: TimerPreferences;

  // Session actions
  startWorkSession: () => void;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  completePhase: () => void;
  skip: () => void;
  reset: () => void;

  // Background recovery
  handleForegroundResume: () => void;

  // Preference actions
  setPreset: (presetId: string) => void;
  setCustomDurations: (work: number, breakMins: number, longBreak: number, sessions: number) => void;
  toggleAutoStartBreak: () => void;
  toggleAutoStartWork: () => void;
  toggleTimerSound: () => void;
  toggleTimerVibration: () => void;
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getActivePreset(preferences: TimerPreferences) {
  if (preferences.selectedPresetId === 'custom') {
    return {
      workMinutes: preferences.customWorkMinutes,
      breakMinutes: preferences.customBreakMinutes,
      longBreakMinutes: preferences.customLongBreakMinutes,
      sessionsUntilLongBreak: preferences.customSessionsUntilLongBreak,
    };
  }
  const preset = TIMER_PRESETS.find((p) => p.id === preferences.selectedPresetId);
  return preset ?? TIMER_PRESETS[0];
}

function getPhaseDuration(phase: TimerPhase, preferences: TimerPreferences): number {
  const preset = getActivePreset(preferences);
  switch (phase) {
    case 'work':
      return preset.workMinutes * 60;
    case 'break':
      return preset.breakMinutes * 60;
    case 'longBreak':
      return preset.longBreakMinutes * 60;
  }
}

function resetStatsIfNewDay(stats: TimerStats): TimerStats {
  const today = getTodayKey();
  if (stats.lastResetDate !== today) {
    return {
      ...stats,
      todayFocusMinutes: 0,
      todaySessionsCompleted: 0,
      lastResetDate: today,
    };
  }
  return stats;
}

const initialSession: TimerSession = {
  isActive: false,
  isPaused: false,
  phase: 'work',
  remainingSeconds: 25 * 60,
  phaseDurationSeconds: 25 * 60,
  currentSession: 1,
  phaseStartedAt: null,
  pausedAt: null,
};

const initialStats: TimerStats = {
  todayFocusMinutes: 0,
  totalFocusMinutes: 0,
  todaySessionsCompleted: 0,
  lastResetDate: getTodayKey(),
};

const initialPreferences: TimerPreferences = {
  selectedPresetId: DEFAULT_PRESET_ID,
  customWorkMinutes: 25,
  customBreakMinutes: 5,
  customLongBreakMinutes: 15,
  customSessionsUntilLongBreak: 4,
  autoStartBreak: false,
  autoStartWork: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

// Granular selectors
export const useTimerSession = () => useTimerStore((state) => state.session);
export const useTimerStats = () => useTimerStore((state) => resetStatsIfNewDay(state.stats));
export const useTimerPreferences = () => useTimerStore((state) => state.preferences);
export const useTimerIsActive = () => useTimerStore((state) => state.session.isActive);
export const useTimerPhase = () => useTimerStore((state) => state.session.phase);
export const useTimerRemaining = () => useTimerStore((state) => state.session.remainingSeconds);
export const useTimerIsPaused = () => useTimerStore((state) => state.session.isPaused);
export const useTimerProgress = () =>
  useTimerStore((state) => {
    const { remainingSeconds, phaseDurationSeconds } = state.session;
    if (phaseDurationSeconds === 0) return 0;
    return ((phaseDurationSeconds - remainingSeconds) / phaseDurationSeconds) * 100;
  });

// Action selectors (stable references)
export const useTimerActions = () =>
  useTimerStore(
    useShallow((state) => ({
      startWorkSession: state.startWorkSession,
      pause: state.pause,
      resume: state.resume,
      tick: state.tick,
      completePhase: state.completePhase,
      skip: state.skip,
      reset: state.reset,
      handleForegroundResume: state.handleForegroundResume,
      setPreset: state.setPreset,
      setCustomDurations: state.setCustomDurations,
      toggleAutoStartBreak: state.toggleAutoStartBreak,
      toggleAutoStartWork: state.toggleAutoStartWork,
      toggleTimerSound: state.toggleTimerSound,
      toggleTimerVibration: state.toggleTimerVibration,
    }))
  );

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      session: initialSession,
      stats: initialStats,
      preferences: initialPreferences,

      startWorkSession: () => {
        const { preferences } = get();
        const duration = getPhaseDuration('work', preferences);
        set({
          session: {
            isActive: true,
            isPaused: false,
            phase: 'work',
            remainingSeconds: duration,
            phaseDurationSeconds: duration,
            currentSession: get().session.currentSession,
            phaseStartedAt: Date.now(),
            pausedAt: null,
          },
          stats: resetStatsIfNewDay(get().stats),
        });
      },

      pause: () => {
        set((state) => ({
          session: {
            ...state.session,
            isPaused: true,
            pausedAt: Date.now(),
          },
        }));
      },

      resume: () => {
        const { session } = get();
        if (!session.isPaused || !session.pausedAt || !session.phaseStartedAt) {
          set((state) => ({
            session: { ...state.session, isPaused: false, pausedAt: null },
          }));
          return;
        }

        // Adjust phaseStartedAt to account for paused duration
        const pausedDuration = Date.now() - session.pausedAt;
        set((state) => ({
          session: {
            ...state.session,
            isPaused: false,
            pausedAt: null,
            phaseStartedAt: (state.session.phaseStartedAt ?? Date.now()) + pausedDuration,
          },
        }));
      },

      tick: () => {
        const { session } = get();
        if (!session.isActive || session.isPaused) return;

        if (session.remainingSeconds <= 1) {
          get().completePhase();
          return;
        }

        set((state) => ({
          session: {
            ...state.session,
            remainingSeconds: state.session.remainingSeconds - 1,
          },
        }));
      },

      completePhase: () => {
        const { session, preferences } = get();
        const preset = getActivePreset(preferences);
        const sessionsUntilLongBreak = preset.sessionsUntilLongBreak;

        if (session.phase === 'work') {
          // Work phase completed — track stats
          const workDurationMinutes = session.phaseDurationSeconds / 60;
          const isLongBreakDue = session.currentSession % sessionsUntilLongBreak === 0;
          const nextPhase: TimerPhase = isLongBreakDue ? 'longBreak' : 'break';
          const nextDuration = getPhaseDuration(nextPhase, preferences);

          set((state) => {
            const stats = resetStatsIfNewDay(state.stats);
            return {
              session: {
                isActive: preferences.autoStartBreak,
                isPaused: false,
                phase: nextPhase,
                remainingSeconds: nextDuration,
                phaseDurationSeconds: nextDuration,
                currentSession: state.session.currentSession,
                phaseStartedAt: preferences.autoStartBreak ? Date.now() : null,
                pausedAt: null,
              },
              stats: {
                ...stats,
                todayFocusMinutes: stats.todayFocusMinutes + workDurationMinutes,
                totalFocusMinutes: stats.totalFocusMinutes + workDurationMinutes,
                todaySessionsCompleted: stats.todaySessionsCompleted + 1,
              },
            };
          });
        } else {
          // Break/longBreak completed — move to next work session
          const nextSession = session.phase === 'longBreak' ? 1 : session.currentSession + 1;
          const nextDuration = getPhaseDuration('work', preferences);

          set({
            session: {
              isActive: preferences.autoStartWork,
              isPaused: false,
              phase: 'work',
              remainingSeconds: nextDuration,
              phaseDurationSeconds: nextDuration,
              currentSession: nextSession,
              phaseStartedAt: preferences.autoStartWork ? Date.now() : null,
              pausedAt: null,
            },
          });
        }
      },

      skip: () => {
        // Skip current phase without tracking stats
        get().completePhase();
      },

      reset: () => {
        const { preferences } = get();
        const duration = getPhaseDuration('work', preferences);
        set({
          session: {
            ...initialSession,
            remainingSeconds: duration,
            phaseDurationSeconds: duration,
          },
        });
      },

      handleForegroundResume: () => {
        const { session } = get();
        if (!session.isActive || session.isPaused || !session.phaseStartedAt) return;

        const elapsed = Math.floor((Date.now() - session.phaseStartedAt) / 1000);
        const remaining = session.phaseDurationSeconds - elapsed;

        if (remaining <= 0) {
          // Phase completed while in background
          get().completePhase();
        } else {
          set((state) => ({
            session: { ...state.session, remainingSeconds: remaining },
          }));
        }
      },

      setPreset: (presetId) => {
        const newPreferences = { ...get().preferences, selectedPresetId: presetId };
        const duration = getPhaseDuration('work', newPreferences);
        set({
          preferences: newPreferences,
          session: {
            ...initialSession,
            remainingSeconds: duration,
            phaseDurationSeconds: duration,
          },
        });
      },

      setCustomDurations: (work, breakMins, longBreak, sessions) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            selectedPresetId: 'custom',
            customWorkMinutes: Math.max(1, Math.min(120, work)),
            customBreakMinutes: Math.max(1, Math.min(60, breakMins)),
            customLongBreakMinutes: Math.max(1, Math.min(60, longBreak)),
            customSessionsUntilLongBreak: Math.max(1, Math.min(12, sessions)),
          },
        }));
        // Reset session with new durations
        const { preferences } = get();
        const duration = getPhaseDuration('work', preferences);
        set({
          session: {
            ...initialSession,
            remainingSeconds: duration,
            phaseDurationSeconds: duration,
          },
        });
      },

      toggleAutoStartBreak: () =>
        set((state) => ({
          preferences: { ...state.preferences, autoStartBreak: !state.preferences.autoStartBreak },
        })),

      toggleAutoStartWork: () =>
        set((state) => ({
          preferences: { ...state.preferences, autoStartWork: !state.preferences.autoStartWork },
        })),

      toggleTimerSound: () =>
        set((state) => ({
          preferences: { ...state.preferences, soundEnabled: !state.preferences.soundEnabled },
        })),

      toggleTimerVibration: () =>
        set((state) => ({
          preferences: { ...state.preferences, vibrationEnabled: !state.preferences.vibrationEnabled },
        })),
    }),
    {
      name: 'microbreaks-timer',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTimerStore;
