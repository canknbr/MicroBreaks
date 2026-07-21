import type { IoniconsName } from '@/types/icons';

/** Minimal shape the filter needs from a break list item. */
export interface FilterableBreak {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

/** Category header metadata (matches CATEGORY_DEFINITIONS entries). */
export interface BreakCategoryDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: IoniconsName;
  color: string;
}

export interface DurationFilterOption {
  id: string;
  min: number;
  max: number;
}

export interface FilteredBreakCategory<TBreak> extends BreakCategoryDefinition {
  breaks: TBreak[];
}

export interface BreakLibraryFilterInput<TBreak extends FilterableBreak> {
  searchQuery: string;
  selectedCategory: string | null;
  selectedDuration: string;
  durationFilters: ReadonlyArray<DurationFilterOption>;
  categoryDefinitions: ReadonlyArray<BreakCategoryDefinition>;
  libraryByCategory: Record<string, TBreak[]>;
  library: TBreak[];
  favoriteBreaks: string[];
}

/**
 * Pure break-library filter extracted from the Breaks screen.
 *
 * Given the search/category/duration selections plus the (already
 * outcome-sorted) library, returns the non-empty category sections to render.
 * `selectedCategory === 'favorites'` produces a single virtual "Favorites"
 * section. Kept free of React/store/i18n deps so the screen's filtering can be
 * tested directly.
 */
export function filterBreakCategories<TBreak extends FilterableBreak>(
  input: BreakLibraryFilterInput<TBreak>
): FilteredBreakCategory<TBreak>[] {
  const {
    searchQuery,
    selectedCategory,
    selectedDuration,
    durationFilters,
    categoryDefinitions,
    libraryByCategory,
    library,
    favoriteBreaks,
  } = input;

  const query = searchQuery.toLowerCase().trim();
  const durationFilter = durationFilters.find((d) => d.id === selectedDuration);

  const matches = (brk: TBreak): boolean => {
    const matchesSearch =
      !query ||
      brk.title.toLowerCase().includes(query) ||
      brk.description.toLowerCase().includes(query);
    const matchesDuration =
      !durationFilter ||
      (brk.durationMinutes >= durationFilter.min && brk.durationMinutes <= durationFilter.max);
    return matchesSearch && matchesDuration;
  };

  if (selectedCategory === 'favorites') {
    const favoriteBreaksList = library.filter((brk) => favoriteBreaks.includes(brk.id));
    if (favoriteBreaksList.length === 0) {
      return [];
    }

    return [
      {
        id: 'favorites',
        title: 'Your Favorites',
        subtitle: `${favoriteBreaksList.length} saved`,
        icon: 'heart' as IoniconsName,
        color: '#EB3E38',
        breaks: favoriteBreaksList.filter(matches),
      },
    ].filter((cat) => cat.breaks.length > 0);
  }

  return categoryDefinitions
    .filter((cat) => !selectedCategory || cat.id === selectedCategory)
    .map((cat) => ({
      ...cat,
      breaks: (libraryByCategory[cat.id] ?? []).filter(matches),
    }))
    .filter((cat) => cat.breaks.length > 0);
}
