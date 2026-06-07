/**
 * Break Live Activity orchestrator
 *
 * The break session never imports the widget-bridge module directly —
 * it talks to this small service, which:
 *
 *   - Tracks the single active activity ID across the app's lifetime.
 *   - Throttles per-second tick updates to a sane cadence (the activity
 *     redraws aggressively in the final 10 seconds, gently otherwise).
 *   - Forces an update on phase changes (pause / resume / skip step)
 *     regardless of the throttle.
 *   - No-ops safely when ActivityKit is unavailable so existing call
 *     sites stay synchronous and unaware.
 *
 * The bridge from this service into `useBreakSession` is a single hook:
 *   `useBreakLiveActivity(state, exercise)`
 * which fires the start / update / end calls based on session state
 * transitions.
 */

import { useEffect, useRef } from 'react';
import {
  areActivitiesEnabled,
  endBreakActivity,
  startBreakActivity,
  updateBreakActivity,
} from '../../modules/widget-bridge';

const FAST_THROTTLE_MS = 1000; // last 10 seconds — every tick
const SLOW_THROTTLE_MS = 2500; // > 10 seconds left — once per 2.5 s

interface BreakActivityContext {
  breakId: string;
  title: string;
  icon: string;
  colorHex: string;
  totalSeconds: number;
}

interface BreakActivityState {
  timeRemainingSec: number;
  isPaused: boolean;
  progress: number; // 0..1
  stepLabel?: string;
}

class BreakLiveActivityOrchestrator {
  private activityId: string | null = null;
  private lastUpdateAt = 0;
  private starting: Promise<string> | null = null;

  isActive(): boolean {
    return this.activityId != null;
  }

  /**
   * Start an activity if one is not already running. Calling start
   * twice with the same break is safe — the second call resolves with
   * the first call's ID. The promise resolves with an empty string if
   * the platform / user has Live Activities disabled.
   */
  async start(ctx: BreakActivityContext, state: BreakActivityState): Promise<string> {
    if (this.activityId) return this.activityId;
    if (this.starting) return this.starting;
    if (!areActivitiesEnabled()) return '';

    const promise = startBreakActivity({
      breakId: ctx.breakId,
      title: ctx.title,
      icon: ctx.icon,
      colorHex: ctx.colorHex,
      totalSeconds: ctx.totalSeconds,
      timeRemainingSec: state.timeRemainingSec,
      isPaused: state.isPaused,
      progress: state.progress,
      stepLabel: state.stepLabel,
    });
    this.starting = promise;
    try {
      const id = await promise;
      this.activityId = id || null;
      this.lastUpdateAt = Date.now();
      return id;
    } finally {
      this.starting = null;
    }
  }

  /**
   * Push a new content state. Throttled: only one update per
   * `SLOW_THROTTLE_MS` while the timer has more than 10s left, and
   * faster once the user is in the final stretch.
   * Pass `{ force: true }` for state transitions (pause/resume) that
   * must update immediately regardless of the throttle.
   */
  async update(
    state: BreakActivityState,
    options: { force?: boolean } = {}
  ): Promise<void> {
    if (!this.activityId) return;
    const now = Date.now();
    const throttle = state.timeRemainingSec <= 10 ? FAST_THROTTLE_MS : SLOW_THROTTLE_MS;
    if (!options.force && now - this.lastUpdateAt < throttle) {
      return;
    }
    this.lastUpdateAt = now;
    await updateBreakActivity({
      activityId: this.activityId,
      timeRemainingSec: state.timeRemainingSec,
      isPaused: state.isPaused,
      progress: state.progress,
      stepLabel: state.stepLabel,
    });
  }

  /**
   * End the running activity. Safe to call when nothing is running.
   */
  async end(
    options: {
      dismissalSeconds?: number;
      finalLabel?: string;
    } = {}
  ): Promise<void> {
    const id = this.activityId;
    if (!id) return;
    this.activityId = null;
    this.lastUpdateAt = 0;
    await endBreakActivity({
      activityId: id,
      dismissalSeconds: options.dismissalSeconds ?? 2,
      timeRemainingSec: 0,
      isPaused: false,
      progress: 1,
      stepLabel: options.finalLabel ?? 'Done',
    });
  }
}

export const breakLiveActivity = new BreakLiveActivityOrchestrator();

// ============================================================
// React bridge
// ============================================================

interface UseBreakLiveActivityArgs {
  /** Stable identity for this session — used to detect a new session. */
  sessionKey: string | null;
  /** Immutable info about the break. */
  context: BreakActivityContext | null;
  /** Mutable per-tick state. */
  state: BreakActivityState | null;
  /** Whether the session is finished (success or cancel). */
  isFinished: boolean;
}

/**
 * Wires a running break session to the system Live Activity. Drop into
 * `BreakSessionScreen` (or any screen that owns the timer). The hook:
 *   - starts an activity on first non-finished tick of a new session;
 *   - updates the activity on every subsequent tick (throttled);
 *   - forces an update when `isPaused` flips;
 *   - ends the activity on unmount, finish, or a new sessionKey.
 */
export function useBreakLiveActivity({
  sessionKey,
  context,
  state,
  isFinished,
}: UseBreakLiveActivityArgs) {
  const lastIsPausedRef = useRef<boolean | null>(null);
  const startedForSessionRef = useRef<string | null>(null);

  useEffect(() => {
    // New session: end any leftover activity from a prior break.
    if (sessionKey !== startedForSessionRef.current) {
      const prev = startedForSessionRef.current;
      if (prev) {
        void breakLiveActivity.end({ dismissalSeconds: 0 });
      }
      startedForSessionRef.current = sessionKey;
      lastIsPausedRef.current = null;
    }
  }, [sessionKey]);

  useEffect(() => {
    if (!context || !state || !sessionKey || isFinished) return;

    if (!breakLiveActivity.isActive()) {
      void breakLiveActivity.start(context, state);
      lastIsPausedRef.current = state.isPaused;
      return;
    }

    const pausedChanged = lastIsPausedRef.current !== state.isPaused;
    lastIsPausedRef.current = state.isPaused;
    void breakLiveActivity.update(state, { force: pausedChanged });
  }, [context, state, sessionKey, isFinished]);

  useEffect(() => {
    if (!isFinished) return;
    void breakLiveActivity.end({ dismissalSeconds: 3, finalLabel: 'Done' });
  }, [isFinished]);

  useEffect(
    () => () => {
      void breakLiveActivity.end({ dismissalSeconds: 0 });
    },
    []
  );
}
