/**
 * Breaks Screen - All break types and guided sessions
 * Premium design with categories, search, filtering, and featured breaks
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
import { useUserStore } from '@/store';
import { useTheme, ThemeColors } from '@/hooks/useTheme';

// Duration filter options
const DURATION_FILTERS = [
  { id: 'all', label: 'All', min: 0, max: 999 },
  { id: 'quick', label: '1-2m', min: 1, max: 2 },
  { id: 'medium', label: '3-5m', min: 3, max: 5 },
  { id: 'long', label: '5m+', min: 5, max: 999 },
];

// Break categories with their breaks
const BREAK_CATEGORIES = [
  {
    id: 'quick',
    title: 'Quick Breaks',
    subtitle: '1-2 minutes',
    icon: 'flash',
    color: '#06FFA5',
    breaks: [
      { id: 'eye-rest', title: 'Eye Rest', duration: '1m', icon: '👁️', description: '20-20-20 rule for eye strain' },
      { id: 'deep-breath', title: 'Deep Breath', duration: '1m', icon: '🌬️', description: 'Quick breathing exercise' },
      { id: 'neck-roll', title: 'Neck Roll', duration: '2m', icon: '🧘', description: 'Release neck tension' },
    ],
  },
  {
    id: 'stretch',
    title: 'Stretching',
    subtitle: '3-5 minutes',
    icon: 'body',
    color: '#B47EFF',
    breaks: [
      { id: 'upper-body', title: 'Upper Body', duration: '3m', icon: '💪', description: 'Shoulders, arms, and back' },
      { id: 'lower-body', title: 'Lower Body', duration: '4m', icon: '🦵', description: 'Legs, hips, and ankles' },
      { id: 'full-body', title: 'Full Body', duration: '5m', icon: '🙆', description: 'Complete stretch routine' },
    ],
  },
  {
    id: 'mindful',
    title: 'Mindfulness',
    subtitle: '2-5 minutes',
    icon: 'leaf',
    color: '#00E5FF',
    breaks: [
      { id: 'meditation', title: 'Mini Meditation', duration: '3m', icon: '🧘‍♀️', description: 'Calm your mind' },
      { id: 'body-scan', title: 'Body Scan', duration: '4m', icon: '✨', description: 'Release physical tension' },
      { id: 'gratitude', title: 'Gratitude', duration: '2m', icon: '🙏', description: 'Positive reflection moment' },
    ],
  },
  {
    id: 'active',
    title: 'Active Breaks',
    subtitle: '5-10 minutes',
    icon: 'walk',
    color: '#FFD166',
    breaks: [
      { id: 'walk', title: 'Quick Walk', duration: '5m', icon: '🚶', description: 'Get moving and refresh' },
      { id: 'desk-exercises', title: 'Desk Exercises', duration: '5m', icon: '🏋️', description: 'Light exercises at desk' },
      { id: 'energizer', title: 'Energizer', duration: '3m', icon: '⚡', description: 'Boost your energy' },
    ],
  },
];

// Featured break
const FEATURED_BREAK = {
  id: 'afternoon-reset',
  title: 'Afternoon Reset',
  duration: '5m',
  description: 'Perfect mid-day break combining stretching and breathing',
  gradient: ['#06FFA5', '#00E5FF'] as [string, string],
  icon: '🌟',
};

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
  item: typeof BREAK_CATEGORIES[0]['breaks'][0];
  index: number;
  categoryColor: string;
  onPress: (id: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  theme: ThemeColors;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 400 }));
  }, [index]);

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
    onPress(item.id);
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
      accessibilityHint="Double tap to start this break exercise"
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
            <Text style={[styles.breakDescription, { color: theme.text.muted }]}>{item.description}</Text>
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
            <Text style={[styles.durationText, { color: categoryColor }]} accessibilityLabel={`Duration: ${item.duration}`}>{item.duration}</Text>
            <Ionicons name="play-circle" size={24} color={categoryColor} accessibilityElementsHidden />
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
  category: typeof BREAK_CATEGORIES[0];
  delay: number;
  onBreakPress: (id: string) => void;
  favoriteBreaks: string[];
  onToggleFavorite: (id: string) => void;
  theme: ThemeColors;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [delay]);

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
  onChangeText: (text: string) => void;
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
  onCategoryChange: (id: string | null) => void;
  onDurationChange: (id: string) => void;
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
        {BREAK_CATEGORIES.map((cat) => (
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

// Parse duration string to number (e.g., "3m" -> 3)
function parseDuration(duration: string): number {
  return parseInt(duration.replace('m', ''), 10) || 0;
}

export default function BreaksScreen() {
  const router = useRouter();
  const theme = useTheme();
  const headerOpacity = useSharedValue(0);
  const featuredScale = useSharedValue(0.9);
  const featuredOpacity = useSharedValue(0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState('all');

  // Favorites from store
  const favoriteBreaks = useUserStore((state) => state.preferences.favoriteBreaks);
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    featuredOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    featuredScale.value = withDelay(200, withSpring(1));
  }, []);

  // Filter breaks based on search and filters
  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const durationFilter = DURATION_FILTERS.find((d) => d.id === selectedDuration);

    // Special handling for favorites
    if (selectedCategory === 'favorites') {
      // Create a virtual "Favorites" category with all favorited breaks
      const allBreaks = BREAK_CATEGORIES.flatMap((cat) =>
        cat.breaks.map((brk) => ({ ...brk, categoryColor: cat.color }))
      );
      const favoriteBreaksList = allBreaks.filter((brk) => favoriteBreaks.includes(brk.id));

      if (favoriteBreaksList.length === 0) {
        return [];
      }

      return [{
        id: 'favorites',
        title: 'Your Favorites',
        subtitle: `${favoriteBreaksList.length} saved`,
        icon: 'heart',
        color: '#FF6B6B',
        breaks: favoriteBreaksList.filter((brk) => {
          const matchesSearch =
            !query ||
            brk.title.toLowerCase().includes(query) ||
            brk.description.toLowerCase().includes(query);
          const duration = parseDuration(brk.duration);
          const matchesDuration =
            !durationFilter ||
            (duration >= durationFilter.min && duration <= durationFilter.max);
          return matchesSearch && matchesDuration;
        }),
      }].filter((cat) => cat.breaks.length > 0);
    }

    return BREAK_CATEGORIES
      .filter((cat) => !selectedCategory || cat.id === selectedCategory)
      .map((cat) => ({
        ...cat,
        breaks: cat.breaks.filter((brk) => {
          // Search filter
          const matchesSearch =
            !query ||
            brk.title.toLowerCase().includes(query) ||
            brk.description.toLowerCase().includes(query);

          // Duration filter
          const duration = parseDuration(brk.duration);
          const matchesDuration =
            !durationFilter ||
            (duration >= durationFilter.min && duration <= durationFilter.max);

          return matchesSearch && matchesDuration;
        }),
      }))
      .filter((cat) => cat.breaks.length > 0);
  }, [searchQuery, selectedCategory, selectedDuration, favoriteBreaks]);

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

  const handleBreakPress = useCallback((breakId: string) => {
    router.push({
      pathname: '/break-session',
      params: { breakId },
    });
  }, [router]);

  const handleFeaturedPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/break-session',
      params: { breakId: FEATURED_BREAK.id },
    });
  }, [router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedDuration('all');
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
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>Choose your wellness moment</Text>
          </Animated.View>

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

          {/* Featured Break - only show when not filtering */}
          {!isFiltering && (
            <Pressable onPress={handleFeaturedPress}>
              <Animated.View style={[styles.featuredCard, featuredStyle]}>
                <LinearGradient
                  colors={FEATURED_BREAK.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.featuredContent}>
                  <View style={styles.featuredBadge}>
                    <Ionicons name="star" size={12} color="#000" />
                    <Text style={styles.featuredBadgeText}>FEATURED</Text>
                  </View>
                  <Text style={styles.featuredIcon}>{FEATURED_BREAK.icon}</Text>
                  <Text style={styles.featuredTitle}>{FEATURED_BREAK.title}</Text>
                  <Text style={styles.featuredDescription}>{FEATURED_BREAK.description}</Text>
                  <View style={styles.featuredFooter}>
                    <Text style={styles.featuredDuration}>{FEATURED_BREAK.duration}</Text>
                    <View style={styles.featuredButton}>
                      <Text style={styles.featuredButtonText}>Start</Text>
                      <Ionicons name="play" size={16} color="#000" />
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
  androidCardFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
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
