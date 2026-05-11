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
  Platform,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';
import { useHasActiveSubscription, useOnboardingStore, useUserStore } from '@/store';
import { useTheme, ThemeColors } from '@/hooks/useTheme';
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
import type { RecommendationOutcomeSignal } from '@/services/recommendations/scoring';

// Duration filter options
const DURATION_FILTERS = [
  { id: 'all', label: 'All', min: 0, max: 999 },
  { id: 'quick', label: '1-2m', min: 1, max: 2 },
  { id: 'medium', label: '3-5m', min: 3, max: 5 },
  { id: 'long', label: '5m+', min: 5, max: 999 },
];

interface BreakListItem {
  id: string;
  title: string;
  duration: string;
  durationMinutes: number;
  icon: string;
  description: string;
  category: ExerciseCategory;
  color: string;
  isLocked: boolean;
}

interface BreakCategorySectionData {
  id: string;
  title: string;
  subtitle: string;
  icon: IoniconsName;
  color: string;
  breaks: BreakListItem[];
}

// Animated Break Card Component
function BreakCard({
  item,
  index,
  categoryColor,
  onPress,
  isFavorite,
  onToggleFavorite,
  theme,
}: {
  item: BreakListItem;
  index: number;
  categoryColor: string;
  onPress: (_item: BreakListItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (_id: string) => void;
  theme: ThemeColors;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 400 }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(item);
  };

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite(item.id);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.duration}, ${item.description}`}
      accessibilityHint={
        item.isLocked
          ? 'Double tap to preview Pro access for this break'
          : 'Double tap to start this break exercise'
      }
    >
      <Animated.View style={[
        styles.breakCard,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0 : 0.08,
          shadowRadius: 8,
          elevation: theme.isDark ? 0 : 4,
        },
        animatedStyle,
      ]}>
        {/* BlurView only for dark mode */}
        {theme.isDark && (
          Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
          )
        )}
        <View style={styles.breakCardContent}>
          <View style={[styles.breakIconContainer, { backgroundColor: `${categoryColor}15` }]}>
            <Text style={styles.breakIcon} accessibilityElementsHidden>{item.icon}</Text>
          </View>
          <View style={styles.breakInfo}>
            <Text style={[styles.breakTitle, { color: theme.text.primary }]}>{item.title}</Text>
            <Text style={[styles.breakDescription, { color: theme.text.muted }]}>
              {item.isLocked ? `Pro • ${item.description}` : item.description}
            </Text>
          </View>
          <View style={styles.breakActions}>
            <Pressable
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
              accessibilityState={{ selected: isFavorite }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#FF6B6B' : theme.text.muted}
              />
            </Pressable>
            <Text
              style={[
                styles.durationText,
                { color: item.isLocked ? theme.text.muted : categoryColor },
              ]}
              accessibilityLabel={`Duration: ${item.duration}`}
            >
              {item.duration}
            </Text>
            <Ionicons
              name={item.isLocked ? 'lock-closed' : 'play-circle'}
              size={24}
              color={item.isLocked ? theme.text.muted : categoryColor}
              accessibilityElementsHidden
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// Category Section Component
function CategorySection({
  category,
  delay,
  onBreakPress,
  favoriteBreaks,
  onToggleFavorite,
  theme,
}: {
  category: BreakCategorySectionData;
  delay: number;
  onBreakPress: (_item: BreakListItem) => void;
  favoriteBreaks: string[];
  onToggleFavorite: (_id: string) => void;
  theme: ThemeColors;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [delay, opacity, translateX]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.categorySection}>
      <Animated.View style={[styles.categoryHeader, headerStyle]}>
        <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}20` }]}>
          <Ionicons name={category.icon as IoniconsName} size={20} color={category.color} />
        </View>
        <View>
          <Text style={[styles.categoryTitle, { color: theme.text.primary }]}>{category.title}</Text>
          <Text style={[styles.categorySubtitle, { color: theme.text.muted }]}>{category.subtitle}</Text>
        </View>
      </Animated.View>
      <View style={styles.breaksList}>
        {category.breaks.map((item, index) => (
          <BreakCard
            key={item.id}
            item={item}
            index={index}
            categoryColor={category.color}
            onPress={onBreakPress}
            isFavorite={favoriteBreaks.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

// Search Bar Component
function SearchBar({
  value,
  onChangeText,
  onClear,
  theme,
}: {
  value: string;
  onChangeText: (_text: string) => void;
  onClear: () => void;
  theme: ThemeColors;
}) {
  return (
    <View style={[
      styles.searchContainer,
      {
        borderColor: theme.isDark ? theme.border.subtle : 'transparent',
        backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: theme.isDark ? 0 : 0.06,
        shadowRadius: 4,
        elevation: theme.isDark ? 0 : 2,
      }
    ]}>
      {/* BlurView only for dark mode */}
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
        )
      )}
      <Ionicons name="search" size={18} color={theme.text.muted} />
      <TextInput
        style={[styles.searchInput, { color: theme.text.primary }]}
        placeholder="Search breaks..."
        placeholderTextColor={theme.text.muted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={theme.text.muted} />
        </Pressable>
      )}
    </View>
  );
}

// Filter Chips Component
function FilterChips({
  selectedCategory,
  selectedDuration,
  onCategoryChange,
  onDurationChange,
  theme,
}: {
  selectedCategory: string | null;
  selectedDuration: string;
  onCategoryChange: (_id: string | null) => void;
  onDurationChange: (_id: string) => void;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {/* Category Filters */}
        <Pressable
          style={[
            styles.filterChip,
            {
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: theme.isDark ? 0 : 0.06,
              shadowRadius: 3,
              elevation: theme.isDark ? 0 : 2,
            },
            !selectedCategory && [styles.filterChipActive, { backgroundColor: theme.isDark ? 'rgba(6, 255, 165, 0.15)' : `${theme.accent.primary}15` }],
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onCategoryChange(null);
          }}
        >
          <Text style={[styles.filterChipText, { color: theme.text.secondary }, !selectedCategory && styles.filterChipTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            {
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: theme.isDark ? 0 : 0.06,
              shadowRadius: 3,
              elevation: theme.isDark ? 0 : 2,
            },
            selectedCategory === 'favorites' && { backgroundColor: 'rgba(255, 107, 107, 0.12)' },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onCategoryChange('favorites');
          }}
        >
          <Ionicons
            name="heart"
            size={14}
            color={selectedCategory === 'favorites' ? '#FF6B6B' : theme.text.muted}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.filterChipText,
              { color: theme.text.secondary },
              selectedCategory === 'favorites' && { color: '#FF6B6B' },
            ]}
          >
            Favorites
          </Text>
        </Pressable>
        {CATEGORY_DEFINITIONS.map((cat) => (
          <Pressable
            key={cat.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 3,
                elevation: theme.isDark ? 0 : 2,
              },
              selectedCategory === cat.id && { backgroundColor: `${cat.color}15` },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onCategoryChange(cat.id);
            }}
          >
            <Ionicons
              name={cat.icon as IoniconsName}
              size={14}
              color={selectedCategory === cat.id ? cat.color : theme.text.muted}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                { color: theme.text.secondary },
                selectedCategory === cat.id && { color: cat.color },
              ]}
            >
              {cat.title.replace(' Breaks', '')}
            </Text>
          </Pressable>
        ))}

        {/* Divider */}
        <View style={[styles.filterDivider, { backgroundColor: theme.isDark ? theme.border.medium : theme.border.strong }]} />

        {/* Duration Filters */}
        {DURATION_FILTERS.map((dur) => (
          <Pressable
            key={dur.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: theme.isDark ? 0 : 0.06,
                shadowRadius: 3,
                elevation: theme.isDark ? 0 : 2,
              },
              selectedDuration === dur.id && [styles.filterChipActive, { backgroundColor: theme.isDark ? 'rgba(6, 255, 165, 0.15)' : `${theme.accent.primary}15` }],
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onDurationChange(dur.id);
            }}
          >
            <Text style={[styles.filterChipText, { color: theme.text.secondary }, selectedDuration === dur.id && styles.filterChipTextActive]}>
              {dur.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

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
  const hasActiveSubscription = useHasActiveSubscription();

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
        isLocked: !hasActiveSubscription && !isStarterExercise(exercise.id),
      })),
    [hasActiveSubscription]
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
        hasActiveSubscription
      ),
    [hasActiveSubscription, historicalOutcomes, library, selectedPack.category, selectedPack.featuredBreakId]
  );

  const featuredBreak = useMemo(() => {
    const defaultFeaturedBreak =
      library.find((item) => item.id === selectedPack.featuredBreakId) ??
      library.find((item) => item.id === FEATURED_EXERCISE_ID) ??
      sortedPackBreaks[0] ??
      library[0] ??
      null;

    if (!defaultFeaturedBreak) {
      return null;
    }

    if (!hasActiveSubscription && defaultFeaturedBreak.isLocked) {
      return sortedPackBreaks.find((item) => !item.isLocked) ?? defaultFeaturedBreak;
    }

    const featuredOutcomeBadge = getBreakOutcomeBadge(
      defaultFeaturedBreak.id,
      defaultFeaturedBreak.category,
      historicalOutcomes
    );

    if (featuredOutcomeBadge?.tone === 'warning') {
      return (
        sortedPackBreaks.find((item) => item.id !== defaultFeaturedBreak.id) ??
        defaultFeaturedBreak
      );
    }

    return defaultFeaturedBreak;
  }, [
    hasActiveSubscription,
    historicalOutcomes,
    library,
    selectedPack.featuredBreakId,
    sortedPackBreaks,
  ]);

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
          hasActiveSubscription
        ),
        stretch: sortBreakListByOutcome(
          grouped.stretch,
          historicalOutcomes,
          FEATURED_EXERCISE_ID,
          hasActiveSubscription
        ),
        mindful: sortBreakListByOutcome(
          grouped.mindful,
          historicalOutcomes,
          FEATURED_EXERCISE_ID,
          hasActiveSubscription
        ),
        active: sortBreakListByOutcome(
          grouped.active,
          historicalOutcomes,
          FEATURED_EXERCISE_ID,
          hasActiveSubscription
        ),
      };
    },
    [hasActiveSubscription, historicalOutcomes, library]
  );

  const openProPreview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/subscription',
      params: { placement: 'breaks' },
    } as any);
  }, [router]);

  // Filter breaks based on search and filters
  const filteredCategories = useMemo(() => {
    const query = deferredSearchQuery.toLowerCase().trim();
    const durationFilter = DURATION_FILTERS.find((d) => d.id === selectedDuration);

    // Special handling for favorites
    if (selectedCategory === 'favorites') {
      // Create a virtual "Favorites" category with all favorited breaks
      const favoriteBreaksList = library.filter((brk) => favoriteBreaks.includes(brk.id));

      if (favoriteBreaksList.length === 0) {
        return [];
      }

      return [{
        id: 'favorites',
        title: 'Your Favorites',
        subtitle: `${favoriteBreaksList.length} saved`,
        icon: 'heart' as IoniconsName,
        color: '#FF6B6B',
        breaks: favoriteBreaksList.filter((brk) => {
          const matchesSearch =
            !query ||
            brk.title.toLowerCase().includes(query) ||
            brk.description.toLowerCase().includes(query);
          const duration = brk.durationMinutes;
          const matchesDuration =
            !durationFilter ||
            (duration >= durationFilter.min && duration <= durationFilter.max);
          return matchesSearch && matchesDuration;
        }),
      }].filter((cat) => cat.breaks.length > 0);
    }

    return CATEGORY_DEFINITIONS
      .filter((cat) => !selectedCategory || cat.id === selectedCategory)
      .map((cat) => ({
        ...cat,
        breaks: libraryByCategory[cat.id].filter((brk) => {
          // Search filter
          const matchesSearch =
            !query ||
            brk.title.toLowerCase().includes(query) ||
            brk.description.toLowerCase().includes(query);

          // Duration filter
          const duration = brk.durationMinutes;
          const matchesDuration =
            !durationFilter ||
            (duration >= durationFilter.min && duration <= durationFilter.max);

          return matchesSearch && matchesDuration;
        }),
      }))
      .filter((cat) => cat.breaks.length > 0);
  }, [
    deferredSearchQuery,
    favoriteBreaks,
    libraryByCategory,
    library,
    selectedCategory,
    selectedDuration,
  ]);

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
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: theme.isDark ? 0 : 0.08,
                        shadowRadius: 4,
                        elevation: theme.isDark ? 0 : 2,
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

          {!hasActiveSubscription && !isFiltering && (
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
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categorySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  breaksList: {
    gap: 10,
  },
  breakCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  breakCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  breakIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  breakIcon: {
    fontSize: 22,
  },
  breakInfo: {
    flex: 1,
  },
  breakTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  breakDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  breakActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 120,
  },
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  // Filter styles
  filtersContainer: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
    borderColor: '#06FFA5',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  filterChipTextActive: {
    color: '#06FFA5',
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 4,
  },
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
