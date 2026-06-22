import { filterBreakCategories } from '@/features/recovery/breakLibraryFilter';
import type { IoniconsName } from '@/types/icons';

const durationFilters = [
  { id: 'all', min: 0, max: 999 },
  { id: 'quick', min: 1, max: 2 },
  { id: 'medium', min: 3, max: 5 },
  { id: 'long', min: 5, max: 999 },
];

const categoryDefinitions = [
  { id: 'quick', title: 'Quick Breaks', subtitle: 'Fast', icon: 'flash' as IoniconsName, color: '#06FFA5' },
  { id: 'stretch', title: 'Stretching', subtitle: 'Posture', icon: 'body' as IoniconsName, color: '#B47EFF' },
];

const eyeRoll = { id: 'eye', title: 'Eye Roll', description: 'Relax your eyes', durationMinutes: 1, category: 'quick' };
const breathing = { id: 'breath', title: 'Deep Breathing', description: 'Calm down', durationMinutes: 4, category: 'quick' };
const hipStretch = { id: 'hip', title: 'Hip Stretch', description: 'Open hips', durationMinutes: 6, category: 'stretch' };

const library = [eyeRoll, breathing, hipStretch];
const libraryByCategory = { quick: [eyeRoll, breathing], stretch: [hipStretch] };

function run(overrides: Record<string, unknown> = {}) {
  return filterBreakCategories({
    searchQuery: '',
    selectedCategory: null,
    selectedDuration: 'all',
    durationFilters,
    categoryDefinitions,
    libraryByCategory,
    library,
    favoriteBreaks: [],
    ...overrides,
  });
}

describe('filterBreakCategories', () => {
  it('returns every category with all of its breaks when unfiltered', () => {
    const result = run();
    expect(result.map((c) => c.id)).toEqual(['quick', 'stretch']);
    expect(result[0].breaks.map((b) => b.id)).toEqual(['eye', 'breath']);
    expect(result[1].breaks.map((b) => b.id)).toEqual(['hip']);
  });

  it('keeps the category definition fields (title/subtitle/icon/color)', () => {
    const [quick] = run();
    expect(quick).toMatchObject({ title: 'Quick Breaks', subtitle: 'Fast', icon: 'flash', color: '#06FFA5' });
  });

  it('restricts to a single selected category', () => {
    const result = run({ selectedCategory: 'stretch' });
    expect(result.map((c) => c.id)).toEqual(['stretch']);
  });

  it('matches the search query against title and description, case-insensitively', () => {
    const byTitle = run({ searchQuery: 'EYE' });
    expect(byTitle.flatMap((c) => c.breaks.map((b) => b.id))).toEqual(['eye']);

    const byDescription = run({ searchQuery: 'calm' });
    expect(byDescription.flatMap((c) => c.breaks.map((b) => b.id))).toEqual(['breath']);
  });

  it('applies the duration filter window (inclusive min/max)', () => {
    const quickOnly = run({ selectedDuration: 'quick' });
    expect(quickOnly.flatMap((c) => c.breaks.map((b) => b.id))).toEqual(['eye']);

    const longOnly = run({ selectedDuration: 'long' });
    expect(longOnly.flatMap((c) => c.breaks.map((b) => b.id))).toEqual(['hip']);
  });

  it('drops categories that have no matching breaks', () => {
    const result = run({ searchQuery: 'hip' });
    expect(result.map((c) => c.id)).toEqual(['stretch']);
  });

  it('builds a virtual Favorites category honoring search and duration', () => {
    const result = run({ selectedCategory: 'favorites', favoriteBreaks: ['eye', 'hip'] });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'favorites', title: 'Your Favorites', subtitle: '2 saved' });
    expect(result[0].breaks.map((b) => b.id)).toEqual(['eye', 'hip']);

    const filtered = run({ selectedCategory: 'favorites', favoriteBreaks: ['eye', 'hip'], selectedDuration: 'long' });
    expect(filtered[0].breaks.map((b) => b.id)).toEqual(['hip']);
  });

  it('returns an empty list when there are no favorites', () => {
    expect(run({ selectedCategory: 'favorites', favoriteBreaks: [] })).toEqual([]);
  });
});
