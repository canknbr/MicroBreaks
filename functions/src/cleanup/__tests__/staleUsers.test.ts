import {
  shouldDeleteStaleUser,
  type StaleUserCandidate,
  type ShouldDeleteOptions,
} from '../staleUsers';

const NOW = new Date('2026-06-09T00:00:00Z').getTime();
const NINETY_DAYS_MS = 90 * 86_400_000;

const baseOptions: ShouldDeleteOptions = {
  now: NOW,
  staleThresholdMs: NINETY_DAYS_MS,
};

function user(overrides: Partial<StaleUserCandidate> = {}): StaleUserCandidate {
  return {
    uid: 'uid-1',
    providerData: [],
    lastSignInTime: '2025-01-01T00:00:00Z',
    creationTime: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('shouldDeleteStaleUser', () => {
  it('deletes a truly anonymous user that has been silent for > 90 days', () => {
    const candidate = user({
      providerData: [],
      lastSignInTime: '2025-01-01T00:00:00Z', // ~17 months ago
    });
    expect(shouldDeleteStaleUser(candidate, baseOptions)).toBe(true);
  });

  it('does NOT delete an anonymous user who signed in recently', () => {
    const recentMs = NOW - 30 * 86_400_000; // 30 days ago
    const candidate = user({
      providerData: [],
      lastSignInTime: new Date(recentMs).toISOString(),
    });
    expect(shouldDeleteStaleUser(candidate, baseOptions)).toBe(false);
  });

  it('NEVER deletes a user with linked provider data, even if stale', () => {
    const candidate = user({
      providerData: [{ providerId: 'google.com' }],
      lastSignInTime: '2022-01-01T00:00:00Z',
    });
    expect(shouldDeleteStaleUser(candidate, baseOptions)).toBe(false);
  });

  it('treats a linked-email account the same — keep it', () => {
    const candidate = user({
      providerData: [{ providerId: 'password' }],
      lastSignInTime: '2020-01-01T00:00:00Z',
    });
    expect(shouldDeleteStaleUser(candidate, baseOptions)).toBe(false);
  });

  it('falls back to creationTime when lastSignInTime is missing', () => {
    const candidate = user({
      providerData: [],
      lastSignInTime: null,
      creationTime: '2020-01-01T00:00:00Z',
    });
    expect(shouldDeleteStaleUser(candidate, baseOptions)).toBe(true);
  });

  it('does nothing when both timestamps are missing (safety floor)', () => {
    const candidate = user({
      providerData: [],
      lastSignInTime: null,
      creationTime: null,
    });
    expect(shouldDeleteStaleUser(candidate, baseOptions)).toBe(false);
  });

  it('does nothing when both timestamps are unparseable', () => {
    const candidate = user({
      providerData: [],
      lastSignInTime: 'not-a-date',
      creationTime: '',
    });
    expect(shouldDeleteStaleUser(candidate, baseOptions)).toBe(false);
  });

  it('respects a non-default staleThreshold (boundary check)', () => {
    const sevenDaysAgo = new Date(NOW - 7 * 86_400_000).toISOString();
    const candidate = user({
      providerData: [],
      lastSignInTime: sevenDaysAgo,
    });
    // 7-day threshold: NOT yet stale (== threshold, > only).
    expect(
      shouldDeleteStaleUser(candidate, {
        now: NOW,
        staleThresholdMs: 7 * 86_400_000,
      })
    ).toBe(false);
    // 6-day threshold: stale.
    expect(
      shouldDeleteStaleUser(candidate, {
        now: NOW,
        staleThresholdMs: 6 * 86_400_000,
      })
    ).toBe(true);
  });
});
