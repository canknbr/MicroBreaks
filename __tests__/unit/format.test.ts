import { formatDuration, formatRelativeTime } from '@/utils/format';

describe('formatDuration', () => {
  it('renders sub-minute durations in seconds', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(0)).toBe('0s');
  });

  it('renders whole minutes compactly by default (drops seconds)', () => {
    expect(formatDuration(60)).toBe('1m');
    expect(formatDuration(305)).toBe('5m');
  });

  it('includes seconds when showSeconds is set', () => {
    expect(formatDuration(305, { showSeconds: true })).toBe('5m 5s');
    expect(formatDuration(60, { showSeconds: true })).toBe('1m 0s');
  });

  it('keeps the seconds-only form under a minute even with showSeconds', () => {
    expect(formatDuration(30, { showSeconds: true })).toBe('30s');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-06-22T12:00:00.000Z');

  it('returns "Just now" under a minute', () => {
    expect(formatRelativeTime('2026-06-22T11:59:30.000Z', { now })).toBe('Just now');
  });

  it('returns minutes ago under an hour', () => {
    expect(formatRelativeTime('2026-06-22T11:45:00.000Z', { now })).toBe('15m ago');
  });

  it('returns hours ago under a day', () => {
    expect(formatRelativeTime('2026-06-22T09:00:00.000Z', { now })).toBe('3h ago');
  });

  it('returns "Yesterday" at one day', () => {
    expect(formatRelativeTime('2026-06-21T11:00:00.000Z', { now })).toBe('Yesterday');
  });

  it('returns days ago under a week', () => {
    expect(formatRelativeTime('2026-06-19T12:00:00.000Z', { now })).toBe('3d ago');
  });

  it('falls back to a localized date beyond a week', () => {
    const old = '2026-01-01T12:00:00.000Z';
    expect(formatRelativeTime(old, { now, locale: 'en-US' })).toBe(
      new Date(old).toLocaleDateString('en-US')
    );
  });

  it('defaults the locale fallback to English', () => {
    const old = '2026-01-01T12:00:00.000Z';
    expect(formatRelativeTime(old, { now })).toBe(new Date(old).toLocaleDateString('en'));
  });
});
