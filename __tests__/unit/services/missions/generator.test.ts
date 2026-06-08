import { generateDailyMissions } from '@/services/missions/generator';

describe('generateDailyMissions', () => {
  it('returns the requested number of missions', () => {
    const m = generateDailyMissions('2026-06-08', 3);
    expect(m).toHaveLength(3);
  });

  it('is deterministic for the same seed', () => {
    const a = generateDailyMissions('2026-06-08', 3);
    const b = generateDailyMissions('2026-06-08', 3);
    expect(a.map((m) => m.kind)).toEqual(b.map((m) => m.kind));
    expect(a.map((m) => m.target)).toEqual(b.map((m) => m.target));
  });

  it('produces different sets for different seeds', () => {
    // Try several adjacent-day pairs — the templates are small enough
    // that two specific seeds might collide, but across a week we'll
    // see distinct orderings somewhere.
    const sets = [
      generateDailyMissions('2026-06-08', 3),
      generateDailyMissions('2026-06-09', 3),
      generateDailyMissions('2026-06-10', 3),
      generateDailyMissions('2026-06-11', 3),
    ];
    const fingerprints = sets.map((s) =>
      s.map((m) => `${m.kind}:${m.target}`).join('|')
    );
    const uniqueFingerprints = new Set(fingerprints);
    expect(uniqueFingerprints.size).toBeGreaterThan(1);
  });

  it('does not produce duplicate kinds in one set', () => {
    const m = generateDailyMissions('any-seed', 5);
    const kinds = m.map((x) => x.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });

  it('initialises progress at zero and completed=false', () => {
    const m = generateDailyMissions('seed', 3);
    for (const x of m) {
      expect(x.progress).toBe(0);
      expect(x.completed).toBe(false);
      expect(x.completedAt).toBeNull();
      expect(x.bonusXP).toBeGreaterThan(0);
    }
  });

  it('returns ids that include the seed for traceability', () => {
    const m = generateDailyMissions('2026-06-08', 3);
    for (const x of m) {
      expect(x.id.startsWith('2026-06-08-')).toBe(true);
    }
  });
});
