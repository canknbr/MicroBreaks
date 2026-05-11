import {
  DEFAULT_BREAK_SESSION_ID,
  resolveBreakSessionBreakId,
} from '@/features/break-session/sessionParams';

describe('break session route param resolution', () => {
  it('accepts a valid string break id', () => {
    expect(resolveBreakSessionBreakId('eye-rest')).toBe('eye-rest');
  });

  it('uses the first valid break id when the route param is an array', () => {
    expect(resolveBreakSessionBreakId(['neck-roll', 'eye-rest'])).toBe('neck-roll');
  });

  it('falls back to a safe default for invalid route params', () => {
    expect(resolveBreakSessionBreakId('missing-break')).toBe(DEFAULT_BREAK_SESSION_ID);
    expect(resolveBreakSessionBreakId(undefined)).toBe(DEFAULT_BREAK_SESSION_ID);
    expect(resolveBreakSessionBreakId([])).toBe(DEFAULT_BREAK_SESSION_ID);
  });
});
