import {
  getEffectiveReminderInterval,
  getWorkPatternTimingHint,
} from '@/features/workday/patterns';

describe('workday pattern helpers', () => {
  it('extends reminder intervals for deep focus work', () => {
    expect(getEffectiveReminderInterval(25, 'deep_focus')).toBe(35);
  });

  it('shortens reminder intervals for meeting-heavy and task-switching days', () => {
    expect(getEffectiveReminderInterval(25, 'meeting_heavy')).toBe(20);
    expect(getEffectiveReminderInterval(25, 'task_switching')).toBe(20);
  });

  it('keeps flexible or unknown patterns at the base interval', () => {
    expect(getEffectiveReminderInterval(25, 'flexible')).toBe(25);
    expect(getEffectiveReminderInterval(25, 'unknown-pattern')).toBe(25);
    expect(getEffectiveReminderInterval(25, null)).toBe(25);
  });

  it('returns user-facing timing hints for known patterns', () => {
    expect(getWorkPatternTimingHint('deep_focus')).toContain('focus blocks');
    expect(getWorkPatternTimingHint('meeting_heavy')).toContain('meetings');
    expect(getWorkPatternTimingHint('flexible')).toContain('balanced');
    expect(getWorkPatternTimingHint('unknown-pattern')).toBeNull();
  });
});
