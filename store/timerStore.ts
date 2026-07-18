/**
 * Timer Store
 * Manages Pomodoro/focus timer state with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { createMmkvStorage } from '@/services/storage/zustandMmkv';
import { ZUSTAND_PERSIST_KEYS } from '@/constants/storageKeys';
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
  skipPhase: () => void;
  skip: () => void;
  reset: () => void;

  // Background recovery
  handleForegroundResume: () => void;

  // Preference actions
  setPreset: (presetId: string) => void;
  setCustomDurations: (work: number, breakMins: number, longBreak: number, sessions: number) => void;
  toggleAutoStartBreak: () => void;
  toggleAutoStartWork: () => void;
}

/**
 * Local-calendar date key (YYYY-MM-DD). Uses local components rather than
 * UTC so today's focus stats reset at the user's local midnight, matching
 * `getLocalDateString`/`getLocalDateKey` used across the app.
 */
export function getTodayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  const defaultPreset = TIMER_PRESETS[0]!;
  return preset ?? defaultPreset;
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

export const initialTimerSession: TimerSession = {
  isActive: false,
  isPaused: false,
  phase: 'work',
  remainingSeconds: 25 * 60,
  phaseDurationSeconds: 25 * 60,
  currentSession: 1,
  phaseStartedAt: null,
  pausedAt: null,
};

export const initialTimerStats: TimerStats = {
  todayFocusMinutes: 0,
  totalFocusMinutes: 0,
  todaySessionsCompleted: 0,
  lastResetDate: getTodayKey(),
};

export const initialTimerPreferences: TimerPreferences = {
  selectedPresetId: DEFAULT_PRESET_ID,
  customWorkMinutes: 25,
  customBreakMinutes: 5,
  customLongBreakMinutes: 15,
  customSessionsUntilLongBreak: 4,
  autoStartBreak: false,
  autoStartWork: false,
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
      skipPhase: state.skipPhase,
      skip: state.skip,
      reset: state.reset,
      handleForegroundResume: state.handleForegroundResume,
      setPreset: state.setPreset,
      setCustomDurations: state.setCustomDurations,
      toggleAutoStartBreak: state.toggleAutoStartBreak,
      toggleAutoStartWork: state.toggleAutoStartWork,
    }))
  );

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      session: initialTimerSession,
      stats: initialTimerStats,
      preferences: initialTimerPreferences,

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
        if (!session.isActive || session.isPaused || session.phaseStartedAt == null) return;

        // Derive remaining from the wall-clock anchor instead of counting tick
        // invocations. setInterval fires irregularly and drops ticks when the
        // JS thread janks, so counting would let the countdown drift slower
        // than real time. phaseStartedAt is the source of truth (already
        // pause-adjusted in resume()), matching handleForegroundResume().
        const elapsed = Math.floor((Date.now() - session.phaseStartedAt) / 1000);
        const remaining = session.phaseDurationSeconds - elapsed;

        if (remaining <= 0) {
          get().completePhase();
          return;
        }

        // Interval jitter (and a busy JS thread) can fire two ticks inside the
        // same wall-clock second. The countdown is derived from phaseStartedAt,
        // so both compute the same `remaining` — skip the redundant set() so we
        // don't emit a new session object and force every subscriber (the
        // TimerWidget) to re-render with identical content.
        if (remaining === session.remainingSeconds) return;

        set((state) => ({
          session: {
            ...state.session,
            remainingSeconds: remaining,
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

      skipPhase: () => {
        // Advance to the next phase without crediting focus stats. Used when
        // the user voluntarily aborts a work phase early so the gamification
        // numbers stay honest.
        const { session, preferences } = get();
        const preset = getActivePreset(preferences);
        const sessionsUntilLongBreak = preset.sessionsUntilLongBreak;

        if (session.phase === 'work') {
          const isLongBreakDue = session.currentSession % sessionsUntilLongBreak === 0;
          const nextPhase: TimerPhase = isLongBreakDue ? 'longBreak' : 'break';
          const nextDuration = getPhaseDuration(nextPhase, preferences);

          set((state) => ({
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
          }));
        } else {
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
        // Backwards-compatible alias — delegates to the stats-free skip.
        get().skipPhase();
      },

      reset: () => {
        const { preferences } = get();
        const duration = getPhaseDuration('work', preferences);
        set({
          session: {
            ...initialTimerSession,
            remainingSeconds: duration,
            phaseDurationSeconds: duration,
          },
        });
      },

      handleForegroundResume: () => {
        // Catch up across EVERY phase boundary crossed while backgrounded —
        // not just the first. completePhase() restarts the next phase at
        // "now", so after each completion we re-anchor phaseStartedAt to the
        // instant the previous phase actually ended and loop until we land in
        // an in-progress phase (or one that does not auto-start and is
        // therefore waiting for the user). The guard is unreachable in
        // practice (min phase ≥ 60s vs a fixed `now`) — it only prevents a
        // pathological infinite loop.
        let guard = 0;
        while (guard < 10000) {
          guard += 1;
          const { session } = get();
          if (!session.isActive || session.isPaused || !session.phaseStartedAt) return;

          const elapsed = Math.floor((Date.now() - session.phaseStartedAt) / 1000);
          const remaining = session.phaseDurationSeconds - elapsed;

          if (remaining > 0) {
            set((state) => ({
              session: { ...state.session, remainingSeconds: remaining },
            }));
            return;
          }

          // Phase elapsed entirely in the background. Remember when it truly
          // ended so the next phase's countdown starts from there, not now.
          const phaseEndedAt =
            session.phaseStartedAt + session.phaseDurationSeconds * 1000;
          get().completePhase();

          const next = get().session;
          if (!next.isActive || !next.phaseStartedAt) {
            // Next phase waits for the user — completePhase already reset it.
            return;
          }
          set((state) => ({
            session: { ...state.session, phaseStartedAt: phaseEndedAt },
          }));
        }
      },

      setPreset: (presetId) => {
        const newPreferences = { ...get().preferences, selectedPresetId: presetId };
        const duration = getPhaseDuration('work', newPreferences);
        set({
          preferences: newPreferences,
          session: {
            ...initialTimerSession,
            remainingSeconds: duration,
            phaseDurationSeconds: duration,
          },
        });
      },

      setCustomDurations: (work, breakMins, longBreak, sessions) => {
        // Clamp NaN/non-finite inputs to the lower bound so an invalid form
        // entry cannot produce a 0-second phase that bursts through completePhase.
        const safe = (value: number, min: number, max: number, fallback: number) => {
          const numeric = Number.isFinite(value) ? value : fallback;
          return Math.max(min, Math.min(max, numeric));
        };

        set((state) => ({
          preferences: {
            ...state.preferences,
            selectedPresetId: 'custom',
            customWorkMinutes: safe(work, 1, 120, state.preferences.customWorkMinutes),
            customBreakMinutes: safe(breakMins, 1, 60, state.preferences.customBreakMinutes),
            customLongBreakMinutes: safe(
              longBreak,
              1,
              60,
              state.preferences.customLongBreakMinutes
            ),
            customSessionsUntilLongBreak: safe(
              sessions,
              1,
              12,
              state.preferences.customSessionsUntilLongBreak
            ),
          },
        }));
        // Reset session with new durations
        const { preferences } = get();
        const duration = getPhaseDuration('work', preferences);
        set({
          session: {
            ...initialTimerSession,
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
    }),
    {
      name: ZUSTAND_PERSIST_KEYS.TIMER,
      storage: createMmkvStorage(),
      // The session ticks every second; persisting it would write to MMKV on
      // each tick and restore a stale countdown on cold start. Only the
      // durable stats and preferences belong on disk.
      partialize: (state) => ({ stats: state.stats, preferences: state.preferences }),
      version: 2,
      migrate: (persistedState, version) => {
        // v1 → v2: sound/vibration moved to settingsStore (single source of
        // truth). Drop the duplicated fields so they no longer round-trip.
        if (version < 2 && persistedState && typeof persistedState === 'object') {
          const state = persistedState as {
            preferences?: Record<string, unknown> & {
              soundEnabled?: unknown;
              vibrationEnabled?: unknown;
            };
          };
          if (state.preferences) {
            const { soundEnabled: _s, vibrationEnabled: _v, ...rest } = state.preferences;
            state.preferences = rest;
          }
        }
        return persistedState as TimerState;
      },
    }
  )
);

export default useTimerStore;
