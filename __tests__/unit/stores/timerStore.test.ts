/**
 * Timer Store Unit Tests
 * Tests for the Pomodoro/focus timer state management
 */

import { act } from '@testing-library/react-native';
import { getTodayKey, useTimerStore } from '@/store/timerStore';

describe('TimerStore', () => {
  beforeEach(() => {
    act(() => {
      // Full state reset — reset() only resets session, so we must also reset stats and preferences
      useTimerStore.setState({
        session: {
          isActive: false,
          isPaused: false,
          phase: 'work' as const,
          remainingSeconds: 25 * 60,
          phaseDurationSeconds: 25 * 60,
          currentSession: 1,
          phaseStartedAt: null,
          pausedAt: null,
        },
        stats: {
          todayFocusMinutes: 0,
          totalFocusMinutes: 0,
          todaySessionsCompleted: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
        },
        preferences: {
          selectedPresetId: 'pomodoro',
          customWorkMinutes: 25,
          customBreakMinutes: 5,
          customLongBreakMinutes: 15,
          customSessionsUntilLongBreak: 4,
          autoStartBreak: false,
          autoStartWork: false,
        },
      });
    });
  });

  describe('Initial State', () => {
    it('should start with work phase and not active', () => {
      const { session } = useTimerStore.getState();
      expect(session.isActive).toBe(false);
      expect(session.isPaused).toBe(false);
      expect(session.phase).toBe('work');
      expect(session.currentSession).toBe(1);
    });

    it('should default to pomodoro preset (25 minutes)', () => {
      const { session, preferences } = useTimerStore.getState();
      expect(preferences.selectedPresetId).toBe('pomodoro');
      expect(session.remainingSeconds).toBe(25 * 60);
      expect(session.phaseDurationSeconds).toBe(25 * 60);
    });

    it('should have default preferences', () => {
      const { preferences } = useTimerStore.getState();
      expect(preferences.autoStartBreak).toBe(false);
      expect(preferences.autoStartWork).toBe(false);
    });

    it('should have zero stats', () => {
      const { stats } = useTimerStore.getState();
      expect(stats.todayFocusMinutes).toBe(0);
      expect(stats.totalFocusMinutes).toBe(0);
      expect(stats.todaySessionsCompleted).toBe(0);
    });
  });

  describe('Start Work Session', () => {
    it('should start the timer', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
      });

      const { session } = useTimerStore.getState();
      expect(session.isActive).toBe(true);
      expect(session.isPaused).toBe(false);
      expect(session.phase).toBe('work');
      expect(session.phaseStartedAt).not.toBeNull();
    });

    it('should set the correct duration for pomodoro preset', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
      });

      const { session } = useTimerStore.getState();
      expect(session.remainingSeconds).toBe(25 * 60);
      expect(session.phaseDurationSeconds).toBe(25 * 60);
    });
  });

  describe('Pause and Resume', () => {
    it('should pause the timer', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().pause();
      });

      const { session } = useTimerStore.getState();
      expect(session.isPaused).toBe(true);
      expect(session.pausedAt).not.toBeNull();
    });

    it('should resume the timer', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().pause();
        useTimerStore.getState().resume();
      });

      const { session } = useTimerStore.getState();
      expect(session.isPaused).toBe(false);
      expect(session.pausedAt).toBeNull();
    });
  });

  describe('Tick', () => {
    it('should decrement remaining seconds as wall-clock time advances', () => {
      const base = 1_000_000_000_000;
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(base);
      try {
        act(() => {
          useTimerStore.getState().startWorkSession();
        });

        const initialRemaining = useTimerStore.getState().session.remainingSeconds;

        nowSpy.mockReturnValue(base + 1000); // one real second later
        act(() => {
          useTimerStore.getState().tick();
        });

        expect(useTimerStore.getState().session.remainingSeconds).toBe(initialRemaining - 1);
      } finally {
        nowSpy.mockRestore();
      }
    });

    it('derives remaining from elapsed wall-clock time, not the tick count', () => {
      // setInterval drops ticks when the JS thread janks: 5 real seconds can
      // pass with only ONE tick firing. Counting ticks would leave the
      // countdown 4s behind reality; deriving from phaseStartedAt stays honest.
      const base = 1_000_000_000_000;
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(base);
      try {
        act(() => {
          useTimerStore.getState().startWorkSession();
        });
        const start = useTimerStore.getState().session.remainingSeconds; // 25*60

        nowSpy.mockReturnValue(base + 5000); // 5s elapse, only one tick fires
        act(() => {
          useTimerStore.getState().tick();
        });

        expect(useTimerStore.getState().session.remainingSeconds).toBe(start - 5);
      } finally {
        nowSpy.mockRestore();
      }
    });

    it('completes the phase when wall-clock time has run past the duration', () => {
      const base = 1_000_000_000_000;
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(base);
      try {
        act(() => {
          useTimerStore.getState().startWorkSession(); // 25 min work
        });

        nowSpy.mockReturnValue(base + 25 * 60 * 1000 + 1000); // past full phase
        act(() => {
          useTimerStore.getState().tick();
        });

        expect(useTimerStore.getState().session.phase).toBe('break');
      } finally {
        nowSpy.mockRestore();
      }
    });

    it('should not tick when paused', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().pause();
      });

      const remaining = useTimerStore.getState().session.remainingSeconds;

      act(() => {
        useTimerStore.getState().tick();
      });

      expect(useTimerStore.getState().session.remainingSeconds).toBe(remaining);
    });

    it('should not tick when not active', () => {
      const remaining = useTimerStore.getState().session.remainingSeconds;

      act(() => {
        useTimerStore.getState().tick();
      });

      expect(useTimerStore.getState().session.remainingSeconds).toBe(remaining);
    });
  });

  describe('Complete Phase', () => {
    it('should transition from work to break', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        // Simulate phase completion
        useTimerStore.getState().completePhase();
      });

      const { session } = useTimerStore.getState();
      expect(session.phase).toBe('break');
      expect(session.remainingSeconds).toBe(5 * 60); // pomodoro break = 5 min
    });

    it('should track stats after work phase completion', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase();
      });

      const { stats } = useTimerStore.getState();
      expect(stats.todayFocusMinutes).toBe(25); // 25 min pomodoro
      expect(stats.totalFocusMinutes).toBe(25);
      expect(stats.todaySessionsCompleted).toBe(1);
    });

    it('should transition from break to work', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase(); // work → break
        useTimerStore.getState().completePhase(); // break → work
      });

      const { session } = useTimerStore.getState();
      expect(session.phase).toBe('work');
      expect(session.currentSession).toBe(2);
    });

    it('should trigger long break after 4 pomodoro sessions', () => {
      // Complete 4 work sessions (pomodoro: every 4th session gets long break)
      act(() => {
        // Session 1
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase(); // work → break
        useTimerStore.getState().completePhase(); // break → work (session 2)

        // Session 2
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase(); // work → break
        useTimerStore.getState().completePhase(); // break → work (session 3)

        // Session 3
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase(); // work → break
        useTimerStore.getState().completePhase(); // break → work (session 4)

        // Session 4 (should trigger long break)
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase(); // work → longBreak
      });

      const { session } = useTimerStore.getState();
      expect(session.phase).toBe('longBreak');
      expect(session.remainingSeconds).toBe(15 * 60); // pomodoro long break = 15 min
    });

    it('should reset session counter after long break', () => {
      // Manually set to session 4 and complete to trigger long break
      act(() => {
        // Complete 3 full cycles to get to session 4
        for (let i = 0; i < 3; i++) {
          useTimerStore.getState().startWorkSession();
          useTimerStore.getState().completePhase();
          useTimerStore.getState().completePhase();
        }
        // Session 4 work → long break
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase();
        // Long break → work (resets to session 1)
        useTimerStore.getState().completePhase();
      });

      const { session } = useTimerStore.getState();
      expect(session.phase).toBe('work');
      expect(session.currentSession).toBe(1);
    });

    it('should not auto-start break by default', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase();
      });

      expect(useTimerStore.getState().session.isActive).toBe(false);
    });

    it('should auto-start break when preference is enabled', () => {
      act(() => {
        useTimerStore.getState().toggleAutoStartBreak();
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase();
      });

      const { session } = useTimerStore.getState();
      expect(session.isActive).toBe(true);
      expect(session.phase).toBe('break');
    });

    it('should auto-start work when preference is enabled', () => {
      act(() => {
        useTimerStore.getState().toggleAutoStartWork();
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase(); // work → break
        useTimerStore.getState().completePhase(); // break → work (auto-started)
      });

      const { session } = useTimerStore.getState();
      expect(session.isActive).toBe(true);
      expect(session.phase).toBe('work');
    });
  });

  describe('Skip', () => {
    it('should skip current phase', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().skip();
      });

      // Should have moved to break phase
      expect(useTimerStore.getState().session.phase).toBe('break');
    });

    it('should not credit focus stats when work phase is skipped early', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        // simulate only a few seconds elapsed
        useTimerStore.getState().tick();
        useTimerStore.getState().tick();
        useTimerStore.getState().skipPhase();
      });

      const { stats, session } = useTimerStore.getState();
      expect(session.phase).toBe('break');
      expect(stats.todayFocusMinutes).toBe(0);
      expect(stats.todaySessionsCompleted).toBe(0);
      expect(stats.totalFocusMinutes).toBe(0);
    });

    it('completePhase still credits stats for an honest work finish', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase();
      });

      const { stats } = useTimerStore.getState();
      expect(stats.todaySessionsCompleted).toBe(1);
      expect(stats.todayFocusMinutes).toBeGreaterThan(0);
    });
  });

  describe('Custom durations input validation', () => {
    it('falls back to the previous duration when given NaN', () => {
      act(() => {
        useTimerStore.getState().setCustomDurations(25, 5, 15, 4);
        // simulate a form sending parseInt('abc') = NaN
        useTimerStore.getState().setCustomDurations(Number.NaN, 5, 15, 4);
      });

      const { preferences } = useTimerStore.getState();
      expect(preferences.customWorkMinutes).toBe(25);
    });

    it('clamps oversized values into range', () => {
      act(() => {
        useTimerStore.getState().setCustomDurations(9999, -10, 0, 50);
      });

      const { preferences } = useTimerStore.getState();
      expect(preferences.customWorkMinutes).toBe(120);
      expect(preferences.customBreakMinutes).toBe(1);
      expect(preferences.customLongBreakMinutes).toBe(1);
      expect(preferences.customSessionsUntilLongBreak).toBe(12);
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().tick();
        useTimerStore.getState().tick();
        useTimerStore.getState().reset();
      });

      const { session } = useTimerStore.getState();
      expect(session.isActive).toBe(false);
      expect(session.phase).toBe('work');
      expect(session.remainingSeconds).toBe(25 * 60);
    });
  });

  describe('Preset Selection', () => {
    it('should switch to deep work preset', () => {
      act(() => {
        useTimerStore.getState().setPreset('deep-work');
      });

      const { session, preferences } = useTimerStore.getState();
      expect(preferences.selectedPresetId).toBe('deep-work');
      expect(session.remainingSeconds).toBe(50 * 60);
    });

    it('should switch to micro session preset', () => {
      act(() => {
        useTimerStore.getState().setPreset('micro-session');
      });

      const { session, preferences } = useTimerStore.getState();
      expect(preferences.selectedPresetId).toBe('micro-session');
      expect(session.remainingSeconds).toBe(15 * 60);
    });

    it('should reset session when switching presets', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().tick();
        useTimerStore.getState().setPreset('deep-work');
      });

      const { session } = useTimerStore.getState();
      expect(session.isActive).toBe(false);
      expect(session.remainingSeconds).toBe(50 * 60);
    });
  });

  describe('Custom Durations', () => {
    it('should set custom durations', () => {
      act(() => {
        useTimerStore.getState().setCustomDurations(30, 8, 20, 3);
      });

      const { preferences, session } = useTimerStore.getState();
      expect(preferences.selectedPresetId).toBe('custom');
      expect(preferences.customWorkMinutes).toBe(30);
      expect(preferences.customBreakMinutes).toBe(8);
      expect(preferences.customLongBreakMinutes).toBe(20);
      expect(preferences.customSessionsUntilLongBreak).toBe(3);
      expect(session.remainingSeconds).toBe(30 * 60);
    });

    it('should clamp custom durations to valid ranges', () => {
      act(() => {
        useTimerStore.getState().setCustomDurations(0, 0, 0, 0);
      });

      const { preferences } = useTimerStore.getState();
      expect(preferences.customWorkMinutes).toBe(1);
      expect(preferences.customBreakMinutes).toBe(1);
      expect(preferences.customLongBreakMinutes).toBe(1);
      expect(preferences.customSessionsUntilLongBreak).toBe(1);
    });

    it('should clamp large custom durations', () => {
      act(() => {
        useTimerStore.getState().setCustomDurations(200, 200, 200, 200);
      });

      const { preferences } = useTimerStore.getState();
      expect(preferences.customWorkMinutes).toBe(120);
      expect(preferences.customBreakMinutes).toBe(60);
      expect(preferences.customLongBreakMinutes).toBe(60);
      expect(preferences.customSessionsUntilLongBreak).toBe(12);
    });
  });

  describe('Preference Toggles', () => {
    it('should toggle auto-start break', () => {
      expect(useTimerStore.getState().preferences.autoStartBreak).toBe(false);
      act(() => {
        useTimerStore.getState().toggleAutoStartBreak();
      });
      expect(useTimerStore.getState().preferences.autoStartBreak).toBe(true);
    });

    it('should toggle auto-start work', () => {
      expect(useTimerStore.getState().preferences.autoStartWork).toBe(false);
      act(() => {
        useTimerStore.getState().toggleAutoStartWork();
      });
      expect(useTimerStore.getState().preferences.autoStartWork).toBe(true);
    });
  });

  describe('Background Recovery', () => {
    it('should recover remaining time from phaseStartedAt', () => {
      const now = Date.now();
      // Simulate a session that started 10 seconds ago with 25 min duration
      act(() => {
        useTimerStore.setState({
          session: {
            isActive: true,
            isPaused: false,
            phase: 'work',
            remainingSeconds: 25 * 60,
            phaseDurationSeconds: 25 * 60,
            currentSession: 1,
            phaseStartedAt: now - 10000, // 10 seconds ago
            pausedAt: null,
          },
        });
        useTimerStore.getState().handleForegroundResume();
      });

      const { session } = useTimerStore.getState();
      // Should be approximately 25*60 - 10 seconds
      expect(session.remainingSeconds).toBeGreaterThanOrEqual(25 * 60 - 11);
      expect(session.remainingSeconds).toBeLessThanOrEqual(25 * 60 - 9);
    });

    it('should complete phase if time exceeded while in background', () => {
      const now = Date.now();
      act(() => {
        useTimerStore.setState({
          session: {
            isActive: true,
            isPaused: false,
            phase: 'work',
            remainingSeconds: 25 * 60,
            phaseDurationSeconds: 25 * 60,
            currentSession: 1,
            phaseStartedAt: now - (26 * 60 * 1000), // 26 minutes ago (exceeded 25 min)
            pausedAt: null,
          },
        });
        useTimerStore.getState().handleForegroundResume();
      });

      // Should have auto-completed and moved to break phase
      expect(useTimerStore.getState().session.phase).toBe('break');
    });

    it('should not recover when paused', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().pause();
      });

      const remaining = useTimerStore.getState().session.remainingSeconds;

      act(() => {
        useTimerStore.getState().handleForegroundResume();
      });

      expect(useTimerStore.getState().session.remainingSeconds).toBe(remaining);
    });

    it('should not recover when not active', () => {
      const remaining = useTimerStore.getState().session.remainingSeconds;

      act(() => {
        useTimerStore.getState().handleForegroundResume();
      });

      expect(useTimerStore.getState().session.remainingSeconds).toBe(remaining);
    });

    it('catches up across multiple phases that elapsed while backgrounded', () => {
      const now = Date.now();
      act(() => {
        useTimerStore.setState((state) => ({
          preferences: { ...state.preferences, autoStartBreak: true, autoStartWork: true },
          session: {
            isActive: true,
            isPaused: false,
            phase: 'work',
            remainingSeconds: 25 * 60,
            phaseDurationSeconds: 25 * 60,
            currentSession: 1,
            // 31 min ago: work (25m) + break (5m) both elapsed, 1 min into next work
            phaseStartedAt: now - 31 * 60 * 1000,
            pausedAt: null,
          },
        }));
        useTimerStore.getState().handleForegroundResume();
      });

      const { session, stats } = useTimerStore.getState();
      // Work completed → break completed → fresh work phase (session 2),
      // ~1 minute already elapsed into it.
      expect(session.phase).toBe('work');
      expect(session.currentSession).toBe(2);
      expect(session.remainingSeconds).toBeGreaterThanOrEqual(25 * 60 - 61);
      expect(session.remainingSeconds).toBeLessThanOrEqual(25 * 60 - 59);
      // Exactly one work phase credited — no double counting across the chain.
      expect(stats.todaySessionsCompleted).toBe(1);
      expect(stats.todayFocusMinutes).toBe(25);
    });

    it('stops catching up at a phase that does not auto-start', () => {
      const now = Date.now();
      act(() => {
        useTimerStore.setState((state) => ({
          // Break auto-starts, but the work after it does not.
          preferences: { ...state.preferences, autoStartBreak: true, autoStartWork: false },
          session: {
            isActive: true,
            isPaused: false,
            phase: 'work',
            remainingSeconds: 25 * 60,
            phaseDurationSeconds: 25 * 60,
            currentSession: 1,
            // 31 min ago: work + break both elapsed; next work must wait for user.
            phaseStartedAt: now - 31 * 60 * 1000,
            pausedAt: null,
          },
        }));
        useTimerStore.getState().handleForegroundResume();
      });

      const { session } = useTimerStore.getState();
      expect(session.phase).toBe('work');
      expect(session.isActive).toBe(false);
      expect(session.currentSession).toBe(2);
      expect(session.remainingSeconds).toBe(25 * 60);
      expect(session.phaseStartedAt).toBeNull();
    });
  });

  describe('Stats Accumulation', () => {
    it('should accumulate focus minutes across sessions', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase(); // +25 min
        useTimerStore.getState().completePhase(); // break → work
        useTimerStore.getState().startWorkSession();
        useTimerStore.getState().completePhase(); // +25 min
      });

      const { stats } = useTimerStore.getState();
      expect(stats.todayFocusMinutes).toBe(50);
      expect(stats.totalFocusMinutes).toBe(50);
      expect(stats.todaySessionsCompleted).toBe(2);
    });
  });
});

describe('getTodayKey (M2 local timezone)', () => {
  // A fake Date whose LOCAL getters say 2025-01-15 but whose UTC
  // toISOString() says the 16th. A UTC-based key (toISOString().split)
  // would roll the day forward and reset today's focus stats just after
  // local midnight in negative-UTC offsets. The local getters are correct.
  const fakeLateNight = {
    getFullYear: () => 2025,
    getMonth: () => 0, // January, 0-indexed
    getDate: () => 15,
    toISOString: () => '2025-01-16T03:30:00.000Z',
  } as unknown as Date;

  it('derives the key from local calendar components, not UTC', () => {
    expect(getTodayKey(fakeLateNight)).toBe('2025-01-15');
  });

  it('zero-pads single-digit month and day', () => {
    const fakeEarly = {
      getFullYear: () => 2025,
      getMonth: () => 2, // March, 0-indexed
      getDate: () => 7,
      toISOString: () => '2025-03-07T00:00:00.000Z',
    } as unknown as Date;
    expect(getTodayKey(fakeEarly)).toBe('2025-03-07');
  });
});

describe('persist partialize (M1)', () => {
  it('persists only stats and preferences, never the volatile session', () => {
    const { partialize } = useTimerStore.persist.getOptions();
    expect(partialize).toBeDefined();

    const persisted = partialize!(useTimerStore.getState());

    expect(persisted).toHaveProperty('stats');
    expect(persisted).toHaveProperty('preferences');
    expect(persisted).not.toHaveProperty('session');
  });
});
