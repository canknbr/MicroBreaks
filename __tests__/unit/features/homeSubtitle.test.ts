import { getHomeSubtitle } from '@/features/home/homeSubtitle';

const base = {
  hasCompletedGoal: false,
  isNewUser: false,
  isEmpty: false,
  lastBreakMinutesAgo: 0,
  dynamicSubtitle: 'Time-of-day greeting subtitle',
};

describe('getHomeSubtitle', () => {
  it('celebrates a completed goal above every other state', () => {
    expect(
      getHomeSubtitle({ ...base, hasCompletedGoal: true, isNewUser: true, isEmpty: true })
    ).toBe("Amazing! You've crushed your goal today");
  });

  it('guides a new user when the goal is not yet complete', () => {
    expect(getHomeSubtitle({ ...base, isNewUser: true, isEmpty: true })).toBe(
      'Choose the kind of relief you want and start with one guided reset.'
    );
  });

  it('prompts an empty (returning) user to pick a reset', () => {
    expect(getHomeSubtitle({ ...base, isEmpty: true })).toBe(
      'Pick what your body or mind needs right now and take a short reset.'
    );
  });

  it('flags an overdue reset once it has been more than 90 minutes', () => {
    expect(getHomeSubtitle({ ...base, lastBreakMinutesAgo: 91 })).toBe(
      'You are overdue for a reset. Start with the recovery state that feels most relevant right now.'
    );
  });

  it('does not flag overdue exactly at the 90-minute boundary', () => {
    expect(getHomeSubtitle({ ...base, lastBreakMinutesAgo: 90 })).toBe(
      'Time-of-day greeting subtitle'
    );
  });

  it('does not flag overdue when there is no break data (null)', () => {
    // null means "no recent break" — it must not be treated as overdue.
    expect(getHomeSubtitle({ ...base, lastBreakMinutesAgo: null })).toBe(
      'Time-of-day greeting subtitle'
    );
  });

  it('falls back to the dynamic time-of-day subtitle by default', () => {
    expect(getHomeSubtitle(base)).toBe('Time-of-day greeting subtitle');
  });
});
