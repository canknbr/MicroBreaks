import { selectFeaturedBreak } from '@/features/recovery/featuredBreak';

interface TestBreak {
  id: string;
  isLocked: boolean;
}

const noWarnings = () => null;

function run(overrides: {
  library?: TestBreak[];
  sortedPackBreaks?: TestBreak[];
  featuredBreakId?: string;
  fallbackFeaturedId?: string;
  hasFullLibrary?: boolean;
  resolveBadgeTone?: (brk: TestBreak) => string | null | undefined;
} = {}) {
  const library: TestBreak[] = overrides.library ?? [
    { id: 'pack-featured', isLocked: false },
    { id: 'global-featured', isLocked: false },
    { id: 'other', isLocked: false },
  ];
  return selectFeaturedBreak<TestBreak>({
    library,
    sortedPackBreaks: overrides.sortedPackBreaks ?? library,
    featuredBreakId: overrides.featuredBreakId ?? 'pack-featured',
    fallbackFeaturedId: overrides.fallbackFeaturedId ?? 'global-featured',
    hasFullLibrary: overrides.hasFullLibrary ?? true,
    resolveBadgeTone: overrides.resolveBadgeTone ?? noWarnings,
  });
}

describe('selectFeaturedBreak', () => {
  it("returns the pack's featured break when present, unlocked, and unflagged", () => {
    expect(run()?.id).toBe('pack-featured');
  });

  it('falls back to the global featured id when the pack featured is missing', () => {
    expect(run({ featuredBreakId: 'absent' })?.id).toBe('global-featured');
  });

  it('falls back to the first sorted pack break, then the first library item', () => {
    expect(
      run({
        featuredBreakId: 'absent',
        fallbackFeaturedId: 'also-absent',
        sortedPackBreaks: [{ id: 'sorted-first', isLocked: false }],
      })?.id
    ).toBe('sorted-first');

    expect(
      run({
        featuredBreakId: 'absent',
        fallbackFeaturedId: 'also-absent',
        sortedPackBreaks: [],
        library: [{ id: 'only', isLocked: false }],
      })?.id
    ).toBe('only');
  });

  it('returns null when there are no breaks at all', () => {
    expect(run({ library: [], sortedPackBreaks: [] })).toBeNull();
  });

  it('swaps a locked default for the first unlocked pack break when library is gated', () => {
    const result = run({
      hasFullLibrary: false,
      library: [{ id: 'pack-featured', isLocked: true }],
      sortedPackBreaks: [
        { id: 'pack-featured', isLocked: true },
        { id: 'unlocked', isLocked: false },
      ],
    });
    expect(result?.id).toBe('unlocked');
  });

  it('keeps a locked default when the full library is unlocked', () => {
    const result = run({
      hasFullLibrary: true,
      library: [{ id: 'pack-featured', isLocked: true }],
      sortedPackBreaks: [{ id: 'pack-featured', isLocked: true }],
    });
    expect(result?.id).toBe('pack-featured');
  });

  it('swaps away from a break flagged with a warning badge', () => {
    const result = run({
      sortedPackBreaks: [
        { id: 'pack-featured', isLocked: false },
        { id: 'alternative', isLocked: false },
      ],
      resolveBadgeTone: (brk) => (brk.id === 'pack-featured' ? 'warning' : null),
    });
    expect(result?.id).toBe('alternative');
  });

  it('keeps a warning-flagged default when no alternative exists', () => {
    const result = run({
      library: [{ id: 'pack-featured', isLocked: false }],
      sortedPackBreaks: [{ id: 'pack-featured', isLocked: false }],
      resolveBadgeTone: () => 'warning',
    });
    expect(result?.id).toBe('pack-featured');
  });
});
