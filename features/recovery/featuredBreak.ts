/** Minimal shape the featured-break selector needs from a break item. */
export interface FeaturableBreak {
  id: string;
  isLocked: boolean;
}

export interface SelectFeaturedBreakInput<TBreak extends FeaturableBreak> {
  library: TBreak[];
  sortedPackBreaks: TBreak[];
  featuredBreakId: string;
  fallbackFeaturedId: string;
  hasFullLibrary: boolean;
  /** Returns the outcome-badge tone for a break (e.g. 'warning'), or null/undefined. */
  resolveBadgeTone: (brk: TBreak) => string | null | undefined;
}

/**
 * Picks the hero break for the Breaks screen from the active outcome pack.
 *
 * Preference chain: the pack's featured break → the global featured break →
 * the first sorted pack break → the first library item → null. The pick is then
 * adjusted: a locked default is swapped for the first unlocked pack break when
 * the library is gated, and a break flagged with a 'warning' badge is swapped
 * for any other pack break. Kept free of React/store deps so the selection logic
 * can be tested directly; badge resolution is injected.
 */
export function selectFeaturedBreak<TBreak extends FeaturableBreak>(
  input: SelectFeaturedBreakInput<TBreak>
): TBreak | null {
  const {
    library,
    sortedPackBreaks,
    featuredBreakId,
    fallbackFeaturedId,
    hasFullLibrary,
    resolveBadgeTone,
  } = input;

  const defaultFeaturedBreak =
    library.find((item) => item.id === featuredBreakId) ??
    library.find((item) => item.id === fallbackFeaturedId) ??
    sortedPackBreaks[0] ??
    library[0] ??
    null;

  if (!defaultFeaturedBreak) {
    return null;
  }

  if (!hasFullLibrary && defaultFeaturedBreak.isLocked) {
    return sortedPackBreaks.find((item) => !item.isLocked) ?? defaultFeaturedBreak;
  }

  if (resolveBadgeTone(defaultFeaturedBreak) === 'warning') {
    return (
      sortedPackBreaks.find((item) => item.id !== defaultFeaturedBreak.id) ?? defaultFeaturedBreak
    );
  }

  return defaultFeaturedBreak;
}
