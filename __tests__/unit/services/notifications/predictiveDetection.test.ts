import {
  decideNotificationAction,
  type PredictiveInput,
} from '@/services/notifications/predictiveDetection';
import type { CompletedBreak } from '@/services/storage';

function makeBreak(minutesAgo: number, now = new Date()): CompletedBreak {
  return {
    id: `b-${minutesAgo}`,
    breakId: 'eye-rest',
    title: 'Eye Rest',
    category: 'quick',
    icon: '👁️',
    color: '#00E5FF',
    duration: 60,
    stepsCompleted: 1,
    totalSteps: 1,
    xpEarned: 5,
    rating: null,
    completedAt: new Date(now.getTime() - minutesAgo * 60_000).toISOString(),
  };
}

function makeInput(overrides: Partial<PredictiveInput> = {}): PredictiveInput {
  return {
    now: new Date('2026-06-08T14:00:00'),
    todayBreaks: [],
    dailyGoal: 4,
    quietHoursEnabled: true,
    ...overrides,
  };
}

describe('decideNotificationAction', () => {
  it('returns quiet during the configured quiet window', () => {
    const result = decideNotificationAction(
      makeInput({ now: new Date('2026-06-08T23:30:00') })
    );
    expect(result.action).toBe('quiet');
    expect(result.rationale).toBe('in_quiet_hours');
  });

  it('still fires during quiet window when quiet hours are disabled', () => {
    const result = decideNotificationAction(
      makeInput({
        now: new Date('2026-06-08T23:30:00'),
        quietHoursEnabled: false,
      })
    );
    expect(result.action).not.toBe('quiet');
  });

  it('suppresses a reminder if the user broke in the last 25 minutes', () => {
    const now = new Date('2026-06-08T14:00:00');
    const result = decideNotificationAction(
      makeInput({ now, todayBreaks: [makeBreak(10, now)] })
    );
    expect(result.action).toBe('suppress');
    expect(result.rationale).toBe('just_broke');
    expect(result.minutesSinceLastBreak).toBe(10);
  });

  it('suppresses when the daily goal is already met', () => {
    const now = new Date('2026-06-08T14:00:00');
    const breaks = [
      makeBreak(180, now),
      makeBreak(150, now),
      makeBreak(120, now),
      makeBreak(90, now),
    ];
    const result = decideNotificationAction(
      makeInput({ now, todayBreaks: breaks, dailyGoal: 4 })
    );
    expect(result.action).toBe('suppress');
    expect(result.rationale).toBe('goal_complete');
  });

  it('boosts when more than 120 minutes have passed since the last break', () => {
    const now = new Date('2026-06-08T14:00:00');
    const result = decideNotificationAction(
      makeInput({ now, todayBreaks: [makeBreak(150, now)] })
    );
    expect(result.action).toBe('boost');
    expect(result.rationale).toBe('long_silence');
  });

  it('boosts when no break has been taken yet and it is past midday', () => {
    const result = decideNotificationAction(
      makeInput({ now: new Date('2026-06-08T15:00:00'), todayBreaks: [] })
    );
    expect(result.action).toBe('boost');
    expect(result.rationale).toBe('long_silence');
    expect(result.minutesSinceLastBreak).toBeNull();
  });

  it('returns "send" for a normal mid-day reminder gap', () => {
    const now = new Date('2026-06-08T11:30:00');
    const result = decideNotificationAction(
      makeInput({ now, todayBreaks: [makeBreak(45, now)] })
    );
    expect(result.action).toBe('send');
    expect(result.rationale).toBe('normal');
  });

  it('handles a malformed completedAt timestamp without throwing', () => {
    const result = decideNotificationAction(
      makeInput({
        todayBreaks: [{ ...makeBreak(30), completedAt: 'not-a-date' }],
      })
    );
    // Falls through to "long_silence" rationale because we're past
    // midday with effectively no real history.
    expect(result.action).toBe('boost');
  });
});
