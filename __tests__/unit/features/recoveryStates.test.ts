import { getDefaultRecoveryStateId } from '@/features/recovery/states';

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
