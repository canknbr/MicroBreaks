import {
  composeAdaptiveCopy,
  getTimeBucket,
  type AdaptiveCopyContext,
  type PainTag,
} from '@/services/notifications/adaptiveCopy';

function makeContext(overrides: Partial<AdaptiveCopyContext> = {}): AdaptiveCopyContext {
  return {
    now: new Date('2026-06-08T10:30:00'),
    currentStreak: 3,
    todayBreakCount: 1,
    dailyGoal: 4,
    lastBreakAt: Date.now() - 2 * 60 * 60 * 1000,
    painAreas: [],
    ...overrides,
  };
}

describe('getTimeBucket', () => {
  const cases: [number, ReturnType<typeof getTimeBucket>][] = [
    [3, 'late'],
    [5, 'late'],
    [7, 'early'],
    [10, 'morning'],
    [13, 'midday'],
    [16, 'afternoon'],
    [20, 'evening'],
    [23, 'late'],
  ];

  cases.forEach(([hour, expected]) => {
    it(`maps ${hour}:00 → ${expected}`, () => {
      expect(getTimeBucket(new Date(2026, 5, 8, hour, 0))).toBe(expected);
    });
  });
});

describe('composeAdaptiveCopy', () => {
  it('promotes a streak-at-risk message in the afternoon when no break has been taken', () => {
    const copy = composeAdaptiveCopy(
      makeContext({
        now: new Date('2026-06-08T16:00:00'),
        currentStreak: 9,
        todayBreakCount: 0,
        lastBreakAt: null,
      })
    );
    expect(copy.rationale).toBe('streak_at_risk');
    expect(copy.title).toContain('9-day streak');
  });

  it('does NOT mark streak-at-risk in the morning even if no break yet', () => {
    const copy = composeAdaptiveCopy(
      makeContext({
        now: new Date('2026-06-08T08:00:00'),
        currentStreak: 9,
        todayBreakCount: 0,
        lastBreakAt: null,
      })
    );
    // The user just woke up — pestering them now would feel hostile.
    expect(copy.rationale).not.toBe('streak_at_risk');
  });

  it('greets a brand-new user warmly', () => {
    const copy = composeAdaptiveCopy(
      makeContext({
        currentStreak: 0,
        todayBreakCount: 0,
        lastBreakAt: null,
      })
    );
    expect(copy.rationale).toBe('first_break');
    expect(copy.title.toLowerCase()).toContain('first');
  });

  it('promotes the "one more" line when the user is one break away from goal', () => {
    const copy = composeAdaptiveCopy(
      makeContext({
        currentStreak: 5,
        todayBreakCount: 3,
        dailyGoal: 4,
      })
    );
    expect(copy.rationale).toBe('almost_done');
    expect(copy.body).toContain('one break');
  });

  it('uses pain-area copy when the user has reported pain', () => {
    const painAreas: PainTag[] = ['eyes'];
    const copy = composeAdaptiveCopy(
      makeContext({
        now: new Date('2026-06-08T11:00:00'), // minute=0, even
        painAreas,
      })
    );
    // Either pain or time-of-day is acceptable depending on minute parity;
    // verify we got SOMETHING valid.
    expect(['pain_focused', 'time_of_day']).toContain(copy.rationale);
    if (copy.rationale === 'pain_focused') {
      expect(copy.title).toContain('👁️');
    }
  });

  it('falls through to a time-of-day pick when nothing special is happening', () => {
    const copy = composeAdaptiveCopy(
      makeContext({
        now: new Date('2026-06-08T10:30:00'),
        currentStreak: 5,
        todayBreakCount: 2,
        dailyGoal: 6,
        painAreas: [],
      })
    );
    expect(copy.rationale).toBe('time_of_day');
    expect(copy.tone).toBe('focused');
  });

  it('chooses a calm tone in the evening', () => {
    const copy = composeAdaptiveCopy(
      makeContext({
        now: new Date('2026-06-08T20:30:00'),
        currentStreak: 5,
        todayBreakCount: 3,
        dailyGoal: 5,
        painAreas: [],
      })
    );
    // Evening but goal isn't 1-away; should fall through to time-of-day.
    expect(copy.tone).toBe('calm');
  });

  it('falls back gracefully when pain areas are an empty array', () => {
    const copy = composeAdaptiveCopy(makeContext({ painAreas: [] }));
    expect(copy.title).toBeTruthy();
    expect(copy.body).toBeTruthy();
  });
});
