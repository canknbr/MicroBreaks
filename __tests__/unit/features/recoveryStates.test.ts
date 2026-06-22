import {
  composeRecoveryReason,
  formatRelativeMinutes,
  getDefaultRecoveryStateId,
  getRecoveryReason,
} from '@/features/recovery/states';

describe('recovery state defaults', () => {
  it('prioritizes explicit pain areas and break-style signals first', () => {
    expect(getDefaultRecoveryStateId(['eyes'], [], 'afternoon_slump')).toBe('eyes');
    expect(getDefaultRecoveryStateId([], ['mindful'], 'afternoon_slump')).toBe('focus');
    expect(getDefaultRecoveryStateId([], ['active'], 'night_owl')).toBe('energy');
  });

  it('uses energy pattern as a fallback when stronger signals are missing', () => {
    expect(getDefaultRecoveryStateId([], [], 'afternoon_slump')).toBe('energy');
    expect(getDefaultRecoveryStateId([], [], 'night_owl')).toBe('stress');
    expect(getDefaultRecoveryStateId([], [], 'morning_person')).toBe('focus');
  });

  it('falls back to eyes when there are no onboarding signals yet', () => {
    expect(getDefaultRecoveryStateId([], [], null)).toBe('eyes');
  });
});

describe('composeRecoveryReason', () => {
  it('returns the base reason alone when there is no adaptive reason or hint', () => {
    expect(
      composeRecoveryReason({ baseReason: 'Base.', adaptiveReason: null, workPatternHint: null })
    ).toBe('Base.');
  });

  it('appends the work-pattern hint to the base reason when no adaptive reason applies', () => {
    expect(
      composeRecoveryReason({
        baseReason: 'Base.',
        adaptiveReason: null,
        workPatternHint: 'Timed for focus.',
      })
    ).toBe('Base. Timed for focus.');
  });

  it('treats the generic "Recommended for you" reason as no adaptive reason', () => {
    expect(
      composeRecoveryReason({
        baseReason: 'Base.',
        adaptiveReason: 'Recommended for you',
        workPatternHint: 'Timed for focus.',
      })
    ).toBe('Base. Timed for focus.');
  });

  it('leads with a specific adaptive reason before the base reason', () => {
    expect(
      composeRecoveryReason({
        baseReason: 'Base.',
        adaptiveReason: 'Your eyes need this',
        workPatternHint: null,
      })
    ).toBe('Your eyes need this. Base.');
  });

  it('combines a specific adaptive reason, base reason, and hint', () => {
    expect(
      composeRecoveryReason({
        baseReason: 'Base.',
        adaptiveReason: 'Your eyes need this',
        workPatternHint: 'Timed for focus.',
      })
    ).toBe('Your eyes need this. Base. Timed for focus.');
  });
});

describe('formatRelativeMinutes', () => {
  it('renders the no-data case as "Not yet today" when minutes is null', () => {
    expect(formatRelativeMinutes(null)).toBe('Not yet today');
  });

  it('renders the no-data case as "Not yet today" when minutes is non-finite', () => {
    expect(formatRelativeMinutes(Number.NaN)).toBe('Not yet today');
  });

  it('renders "Just now" at zero', () => {
    expect(formatRelativeMinutes(0)).toBe('Just now');
  });

  it('renders minutes under an hour', () => {
    expect(formatRelativeMinutes(45)).toBe('45m ago');
  });

  it('renders hours honestly past the old 999 sentinel instead of collapsing to "Not yet today"', () => {
    // 1000 minutes = 16h 40m. The old in-band 999 sentinel turned any real gap
    // this long into "Not yet today"; a measured gap must render honestly.
    expect(formatRelativeMinutes(1000)).toBe('16h 40m ago');
  });

  it('renders a multi-day gap honestly', () => {
    expect(formatRelativeMinutes(1500)).toBe('25h ago');
  });
});

describe('getRecoveryReason', () => {
  it('guides a brand-new user with no breaks', () => {
    expect(getRecoveryReason('eyes', null, 0, true)).toBe(
      'Start with one short reset to get your first relief win before you explore the rest of the app.'
    );
  });

  it('does not fabricate an overdue line when there is no break data (null)', () => {
    // A null gap means "no recent break recorded" — it must not be treated as
    // overdue, and must never produce "You have gone Not yet today without a reset."
    const reason = getRecoveryReason('eyes', null, 0, false);
    expect(reason).not.toContain('Not yet today');
    expect(reason).toBe('Best after screen-heavy blocks, visual fatigue, or dry-eye moments.');
  });

  it('reports a real long gap honestly rather than as "Not yet today"', () => {
    // 1500 minutes ago is overdue (>90) and must render the real elapsed time.
    expect(getRecoveryReason('eyes', 1500, 4, false)).toBe(
      'You have gone 25h ago without a reset. This is the fastest way back into a better work rhythm.'
    );
  });
});
