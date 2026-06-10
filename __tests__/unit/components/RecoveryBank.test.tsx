import { __formatBankForTests as formatBank } from '@/components/home/RecoveryBank';

describe('RecoveryBank formatter', () => {
  it('returns "0m" for an empty bank', () => {
    expect(formatBank(0)).toBe('0m');
  });

  it('rounds sub-minute values down to zero display', () => {
    // 0.4 minutes is still under one full minute — show "0m" so the
    // UI doesn't claim a recovery the user hasn't logged.
    expect(formatBank(0.4)).toBe('0m');
  });

  it('shows minutes for values under an hour', () => {
    expect(formatBank(15)).toBe('15m');
    expect(formatBank(59)).toBe('59m');
  });

  it('shows whole hours with no minutes remainder', () => {
    expect(formatBank(60)).toBe('1h');
    expect(formatBank(120)).toBe('2h');
  });

  it('shows compound hours and minutes', () => {
    expect(formatBank(65)).toBe('1h 5m');
    expect(formatBank(195)).toBe('3h 15m');
  });

  it('rounds the minute remainder to the nearest whole minute', () => {
    // 60 + 12.6 = 72.6 → "1h 13m" (round-half-up).
    expect(formatBank(72.6)).toBe('1h 13m');
  });
});
