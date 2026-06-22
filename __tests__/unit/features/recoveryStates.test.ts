import { composeRecoveryReason, getDefaultRecoveryStateId } from '@/features/recovery/states';

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
