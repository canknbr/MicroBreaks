/**
 * Breaks Screen - All break types and guided sessions
 * Premium design with categories, search, filtering, and featured breaks
 */

import React, { useDeferredValue, useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';
import { cardShadow } from '@/utils/cardShadow';
import { useOnboardingStore, useUserStore } from '@/store';
import { useTierFeature } from '@/hooks/useTierFeature';
import { useTheme } from '@/hooks/useTheme';
import { ALL_EXERCISES, ExerciseCategory } from '@/data/exercises';
import { getBreakHistory } from '@/services/breakHistory';
import {
  PRO_LIBRARY_HIGHLIGHTS,
} from '@/constants/subscription';
import { UpgradePrompt } from '@/components/subscription';
import {
  CATEGORY_DEFINITIONS,
  FEATURED_EXERCISE_ID,
  FEATURED_GRADIENT,
  OUTCOME_PACKS,
  OutcomePackId,
  formatDurationMinutes,
  getDefaultOutcomePackId,
  isStarterExercise,
} from '@/features/recovery/outcomePacks';
import {
  getBreakOutcomeBadge,
  mapBreakHistoryToOutcomeSignals,
  sortBreakListByOutcome,
} from '@/features/recovery/personalization';
import { filterBreakCategories } from '@/features/recovery/breakLibraryFilter';
import { selectFeaturedBreak } from '@/features/recovery/featuredBreak';
import { CategorySection } from '@/components/breaks/CategorySection';
import { FilterChips } from '@/components/breaks/FilterChips';
import { SearchBar } from '@/components/breaks/SearchBar';
import { DURATION_FILTERS } from '@/components/breaks/constants';
import type { BreakListItem } from '@/components/breaks/types';
import type { RecommendationOutcomeSignal } from '@/services/recommendations/scoring';

export default function BreaksScreen() {
  const router = useRouter();
  const theme = useTheme();
  const onboardingData = useOnboardingStore((state) => state.data);
  const headerOpacity = useSharedValue(0);
  const featuredScale = useSharedValue(0.9);
  const featuredOpacity = useSharedValue(0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedPackId, setSelectedPackId] = useState<OutcomePackId>(
    getDefaultOutcomePackId(onboardingData.painAreas, onboardingData.breakStyle)
  );
  const [historicalOutcomes, setHistoricalOutcomes] = useState<RecommendationOutcomeSignal[]>([]);
  const hasFullLibrary = useTierFeature('full_break_library').hasFeature;

  // Favorites from store
  const favoriteBreaks = useUserStore((state) => state.preferences.favoriteBreaks);
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    featuredOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    featuredScale.value = withDelay(200, withSpring(1));
  }, [featuredOpacity, featuredScale, headerOpacity]);

  const defaultPackId = useMemo(
    () => getDefaultOutcomePackId(onboardingData.painAreas, onboardingData.breakStyle),
    [onboardingData.breakStyle, onboardingData.painAreas]
  );
  const deferredSearchQuery = useDeferredValue(searchQuery);

  useEffect(() => {
    setSelectedPackId(defaultPackId);
  }, [defaultPackId]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const hydrateBreakOutcomeSignals = async () => {
        const history = await getBreakHistory();
        if (!isActive) {
          return;
        }

        setHistoricalOutcomes(mapBreakHistoryToOutcomeSignals(history));
      };

      void hydrateBreakOutcomeSignals();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const library = useMemo<BreakListItem[]>(
    () =>
      ALL_EXERCISES.map((exercise) => ({
        id: exercise.id,
        title: exercise.title,
        duration: formatDurationMinutes(exercise.totalDuration),
        durationMinutes: Math.max(1, Math.round(exercise.totalDuration / 60)),
        icon: exercise.icon,
        description: exercise.description,
        category: exercise.category,
        color:
          CATEGORY_DEFINITIONS.find((category) => category.id === exercise.category)?.color ??
          exercise.color,
        isLocked: !hasFullLibrary && !isStarterExercise(exercise.id),
      })),
    [hasFullLibrary]
  );

  const selectedPack = useMemo(
    () => OUTCOME_PACKS.find((pack) => pack.id === selectedPackId) ?? OUTCOME_PACKS[0],
    [selectedPackId]
  );

  const sortedPackBreaks = useMemo(
    () =>
      sortBreakListByOutcome(
        library.filter((item) => item.category === selectedPack.category),
        historicalOutcomes,
        selectedPack.featuredBreakId,
        hasFullLibrary
      ),
    [hasFullLibrary, historicalOutcomes, library, selectedPack.category, selectedPack.featuredBreakId]
  );

  const featuredBreak = useMemo(
    () =>
      selectFeaturedBreak<BreakListItem>({
        library,
        sortedPackBreaks,
        featuredBreakId: selectedPack.featuredBreakId,
        fallbackFeaturedId: FEATURED_EXERCISE_ID,
        hasFullLibrary,
        resolveBadgeTone: (brk) =>
          getBreakOutcomeBadge(brk.id, brk.category, historicalOutcomes)?.tone,
      }),
    [
      hasFullLibrary,
      historicalOutcomes,
      library,
      selectedPack.featuredBreakId,
      sortedPackBreaks,
    ]
  );

  const featuredBreakBadge = useMemo(
    () =>
      featuredBreak
        ? getBreakOutcomeBadge(
            featuredBreak.id,
            featuredBreak.category,
            historicalOutcomes
          )
        : null,
    [featuredBreak, historicalOutcomes]
  );

  const lockedExerciseCount = useMemo(
    () => library.filter((item) => item.isLocked).length,
    [library]
  );

  const starterExerciseCount = useMemo(
    () => library.length - lockedExerciseCount,
    [library, lockedExerciseCount]
  );

  const packLibraryCount = useMemo(
    () => library.filter((item) => item.category === selectedPack.category).length,
    [library, selectedPack.category]
  );

  const packStarterCount = useMemo(
    () =>
      library.filter(
        (item) => item.category === selectedPack.category && !item.isLocked
      ).length,
    [library, selectedPack.category]
  );

  const libraryByCategory = useMemo(
    () => {
      const grouped = library.reduce<Record<ExerciseCategory, BreakListItem[]>>(
        (acc, item) => {
          acc[item.category].push(item);
          return acc;
        },
        {
          quick: [],
          stretch: [],
          mindful: [],
          active: [],
        }
      );

      return {
        quick: sortBreakListByOutcome(
          grouped.quick,
          historicalOutcomes,
          FEATURED_EXERCISE_ID,
          hasFullLibrary
        ),
        stretch: sortBreakListByOutcome(
          grouped.stretch,
          historicalOutcomes,
          FEATURED_EXERCISE_ID,
          hasFullLibrary
        ),
        mindful: sortBreakListByOutcome(
          grouped.mindful,
          historicalOutcomes,
          FEATURED_EXERCISE_ID,
          hasFullLibrary
        ),
        active: sortBreakListByOutcome(
          grouped.active,
          historicalOutcomes,
          FEATURED_EXERCISE_ID,
          hasFullLibrary
        ),
      };
    },
    [hasFullLibrary, historicalOutcomes, library]
  );

  const openProPreview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/subscription',
      params: { placement: 'breaks' },
    } as any);
  }, [router]);

  // Filter breaks based on search and filters
  const filteredCategories = useMemo(
    () =>
      filterBreakCategories<BreakListItem>({
        searchQuery: deferredSearchQuery,
        selectedCategory,
        selectedDuration,
        durationFilters: DURATION_FILTERS,
        categoryDefinitions: CATEGORY_DEFINITIONS,
        libraryByCategory,
        library,
        favoriteBreaks,
      }),
    [
      deferredSearchQuery,
      favoriteBreaks,
      libraryByCategory,
      library,
      selectedCategory,
      selectedDuration,
    ]
  );

  // Check if we have any results
  const hasResults = filteredCategories.length > 0;
  const isFiltering = searchQuery.length > 0 || selectedCategory !== null || selectedDuration !== 'all';

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [20, 0]) }],
  }));

  const featuredStyle = useAnimatedStyle(() => ({
    opacity: featuredOpacity.value,
    transform: [{ scale: featuredScale.value }],
  }));

  const handleBreakPress = useCallback((item: BreakListItem) => {
    if (item.isLocked) {
      openProPreview();
      return;
    }

    router.push({
      pathname: '/break-session',
      params: { breakId: item.id },
    });
  }, [openProPreview, router]);

  const handleFeaturedPress = useCallback(() => {
    if (!featuredBreak) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (featuredBreak.isLocked) {
      openProPreview();
      return;
    }

    router.push({
      pathname: '/break-session',
      params: { breakId: featuredBreak.id },
    });
  }, [featuredBreak, openProPreview, router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedDuration('all');
  }, []);

  const handlePackPress = useCallback((packId: OutcomePackId) => {
    Haptics.selectionAsync();
    setSelectedPackId(packId);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Ambient Background */}
      <View style={[styles.ambientGlow, styles.ambientPurple]} />
      <View style={[styles.ambientGlow, styles.ambientTeal]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Breaks</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Pick the kind of relief you want, then start with a guided reset.
            </Text>
          </Animated.View>

          <View style={styles.packSection}>
            <View style={styles.packSectionHeader}>
              <Text style={[styles.packSectionTitle, { color: theme.text.primary }]}>
                Reset packs
              </Text>
              <Text style={[styles.packSectionSubtitle, { color: theme.text.muted }]}>
                Outcome-first entry points for desk work pain, fatigue, and focus drops.
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.packRail}
            >
              {OUTCOME_PACKS.map((pack) => {
                const isSelected = pack.id === selectedPack.id;

                return (
                  <Pressable
                    key={pack.id}
                    style={[
                      styles.packChip,
                      {
                        borderColor: isSelected ? pack.color : theme.border.subtle,
                        backgroundColor: theme.isDark ? 'rgba(19, 19, 26, 0.92)' : theme.background.card,
                        ...cardShadow(theme.isDark, { height: 1, opacity: 0.08, radius: 4, elevation: 2 }),
                      },
                    ]}
                    onPress={() => handlePackPress(pack.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${pack.title}. ${pack.description}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={[styles.packChipIcon, { backgroundColor: `${pack.color}18` }]}>
                      <Text style={styles.packChipEmoji}>{pack.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.packChipText,
                        { color: isSelected ? pack.color : theme.text.primary },
                      ]}
                    >
                      {pack.shortLabel}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            theme={theme}
          />

          {/* Filter Chips */}
          <FilterChips
            selectedCategory={selectedCategory}
            selectedDuration={selectedDuration}
            onCategoryChange={setSelectedCategory}
            onDurationChange={setSelectedDuration}
            theme={theme}
          />

          {!hasFullLibrary && !isFiltering && (
            <UpgradePrompt
              title={`Unlock the full ${selectedPack.title} library`}
              subtitle={`You currently have ${starterExerciseCount} starter sessions. Pro opens ${lockedExerciseCount} more guided breaks, including deeper ${selectedPack.shortLabel.toLowerCase()} reset options.`}
              bullets={PRO_LIBRARY_HIGHLIGHTS}
              ctaLabel="Preview Pro Library"
              onPress={openProPreview}
              icon="sparkles"
              accentColors={FEATURED_GRADIENT}
            />
          )}

          {/* Featured Break - only show when not filtering */}
          {!isFiltering && featuredBreak && (
            <Pressable onPress={handleFeaturedPress}>
              <Animated.View style={[styles.featuredCard, featuredStyle]}>
                <LinearGradient
                  colors={FEATURED_GRADIENT}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.featuredContent}>
                  <View style={styles.featuredBadge}>
                    <Ionicons
                      name={featuredBreak.isLocked ? 'lock-closed' : 'star'}
                      size={12}
                      color="#000"
                    />
                    <Text style={styles.featuredBadgeText}>
                      {featuredBreak.isLocked ? 'PRO STARTER' : 'START HERE'}
                    </Text>
                  </View>
                  <Text style={styles.featuredIcon}>{selectedPack.icon}</Text>
                  <Text style={styles.featuredTitle}>{selectedPack.title}</Text>
                  {featuredBreakBadge && (
                    <View
                      style={[
                        styles.featuredInsightPill,
                        featuredBreakBadge.tone === 'positive'
                          ? styles.featuredInsightPillPositive
                          : styles.featuredInsightPillWarning,
                      ]}
                    >
                      <Text style={styles.featuredInsightText}>
                        {featuredBreakBadge.label}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.featuredDescription}>
                    {selectedPack.description} Start with {featuredBreak.title} for a fast {featuredBreak.duration} guided reset.
                  </Text>
                  <View style={styles.featuredFooter}>
                    <View>
                      <Text style={styles.featuredDuration}>{featuredBreak.title}</Text>
                      <Text style={styles.featuredLibraryMeta}>
                        {packStarterCount}/{packLibraryCount} unlocked in this pack
                      </Text>
                    </View>
                    <View style={styles.featuredButton}>
                      <Text style={styles.featuredButtonText}>
                        {featuredBreak.isLocked ? 'Unlock Pro' : 'Start'}
                      </Text>
                      <Ionicons
                        name={featuredBreak.isLocked ? 'lock-open' : 'play'}
                        size={16}
                        color="#000"
                      />
                    </View>
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          )}

          {/* Categories - show filtered results */}
          {hasResults ? (
            filteredCategories.map((category, index) => (
              <CategorySection
                key={category.id}
                category={category}
                delay={isFiltering ? 0 : 300 + index * 150}
                onBreakPress={handleBreakPress}
                favoriteBreaks={favoriteBreaks}
                onToggleFavorite={toggleFavorite}
                theme={theme}
              />
            ))
          ) : (
            <Animated.View entering={FadeIn.duration(300)} style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color={theme.text.muted} />
              <Text style={[styles.noResultsTitle, { color: theme.text.primary }]}>No breaks found</Text>
              <Text style={[styles.noResultsText, { color: theme.text.muted }]}>
                Try adjusting your search or filters
              </Text>
              <Pressable style={styles.clearFiltersButton} onPress={handleClearFilters}>
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  ambientPurple: {
    top: -100,
    left: -150,
    width: 400,
    height: 400,
    backgroundColor: '#B47EFF',
  },
  ambientTeal: {
    bottom: 100,
    right: -150,
    width: 350,
    height: 350,
    backgroundColor: '#06FFA5',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  packSection: {
    marginBottom: Spacing.lg,
  },
  packSectionHeader: {
    marginBottom: Spacing.sm,
  },
  packSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  packSectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  packRail: {
    paddingRight: Spacing.lg,
    gap: 10,
  },
  packChip: {
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packChipIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  packChipEmoji: {
    fontSize: 20,
  },
  packChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  featuredCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  featuredContent: {
    padding: Spacing.lg,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    marginLeft: 4,
  },
  featuredIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  featuredInsightPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  featuredInsightPillPositive: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  featuredInsightPillWarning: {
    backgroundColor: 'rgba(255, 107, 107, 0.18)',
  },
  featuredInsightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.2,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  featuredLibraryMeta: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.65)',
    marginTop: 2,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featuredButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  bottomSpacer: {
    height: 120,
  },
  // Search styles
  // Filter styles
  // No results styles
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
    borderWidth: 1,
    borderColor: '#06FFA5',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06FFA5',
  },
});
