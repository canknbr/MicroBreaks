import {
  findNextFreeSlot,
  isInBusyWindow,
  type BusyWindow,
} from '@/services/notifications/calendarAwareness';

function window(startISO: string, endISO: string, title?: string): BusyWindow {
  return {
    startMs: new Date(startISO).getTime(),
    endMs: new Date(endISO).getTime(),
    title,
  };
}

describe('isInBusyWindow', () => {
  const meeting = window('2026-06-08T10:00:00', '2026-06-08T11:00:00');

  it('returns true mid-meeting', () => {
    expect(isInBusyWindow(new Date('2026-06-08T10:30:00'), [meeting])).toBe(true);
  });

  it('returns true at the start moment (inclusive)', () => {
    expect(isInBusyWindow(new Date('2026-06-08T10:00:00'), [meeting])).toBe(true);
  });

  it('returns false at the end moment (exclusive)', () => {
    expect(isInBusyWindow(new Date('2026-06-08T11:00:00'), [meeting])).toBe(false);
  });

  it('returns false before and after', () => {
    expect(isInBusyWindow(new Date('2026-06-08T09:59:00'), [meeting])).toBe(false);
    expect(isInBusyWindow(new Date('2026-06-08T12:00:00'), [meeting])).toBe(false);
  });

  it('returns false on empty windows', () => {
    expect(isInBusyWindow(new Date(), [])).toBe(false);
  });
});

describe('findNextFreeSlot', () => {
  it('returns the original time when there are no busy windows', () => {
    const proposed = new Date('2026-06-08T10:30:00');
    const result = findNextFreeSlot(proposed, []);
    expect(result?.getTime()).toBe(proposed.getTime());
  });

  it('returns the original time when it is already free', () => {
    const proposed = new Date('2026-06-08T11:30:00');
    const result = findNextFreeSlot(proposed, [
      window('2026-06-08T10:00:00', '2026-06-08T11:00:00'),
    ]);
    expect(result?.getTime()).toBe(proposed.getTime());
  });

  it('shifts past a single overlapping meeting plus the buffer', () => {
    const proposed = new Date('2026-06-08T10:30:00');
    const result = findNextFreeSlot(
      proposed,
      [window('2026-06-08T10:00:00', '2026-06-08T11:00:00')],
      { bufferAfterMin: 3, maxLookaheadMin: 90 }
    );
    // 11:00 + 3min buffer
    expect(result?.toISOString()).toBe(new Date('2026-06-08T11:03:00').toISOString());
  });

  it('chains past back-to-back meetings', () => {
    const proposed = new Date('2026-06-08T10:30:00');
    const result = findNextFreeSlot(
      proposed,
      [
        window('2026-06-08T10:00:00', '2026-06-08T11:00:00'),
        window('2026-06-08T11:00:00', '2026-06-08T11:30:00'),
      ],
      { bufferAfterMin: 1, maxLookaheadMin: 90 }
    );
    // 11:00 + 1min buffer = 11:01, still inside second meeting (until 11:30),
    // so shift again to 11:30 + 1min = 11:31
    expect(result?.toISOString()).toBe(new Date('2026-06-08T11:31:00').toISOString());
  });

  it('returns null when the lookahead budget runs out', () => {
    const proposed = new Date('2026-06-08T10:30:00');
    const result = findNextFreeSlot(
      proposed,
      [window('2026-06-08T10:00:00', '2026-06-08T15:00:00')],
      { bufferAfterMin: 5, maxLookaheadMin: 60 }
    );
    expect(result).toBeNull();
  });

  it('handles unsorted busy windows defensively', () => {
    const proposed = new Date('2026-06-08T10:30:00');
    const result = findNextFreeSlot(
      proposed,
      [
        window('2026-06-08T11:00:00', '2026-06-08T11:30:00'),
        window('2026-06-08T10:00:00', '2026-06-08T11:00:00'),
      ],
      { bufferAfterMin: 0, maxLookaheadMin: 90 }
    );
    expect(result?.toISOString()).toBe(new Date('2026-06-08T11:30:00').toISOString());
  });
});
