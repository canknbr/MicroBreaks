/**
 * Exercise Library Screen
 * Browse the curated, desk-friendly movement library: search, body-zone and
 * space filters, and animated thumbnails. Rows open the movement detail.
 */

import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';
import { useTierFeature } from '@/hooks/useTierFeature';
import { isFreeExercise } from '@/services/subscription/exerciseAccess';
import { SearchBar } from '@/components/breaks/SearchBar';
import {
  CircuitRail,
  LibraryExerciseRow,
  RoutineRail,
  TodayPlanRail,
} from '@/components/library';
import { ScreenErrorBoundary } from '@/components/error';
import { useOnboardingStore, useUserStore } from '@/store';
import { analytics } from '@/services/analytics';
import { useRoutinesStore, type CustomRoutine } from '@/store/routinesStore';
import {
  LIBRARY_ZONES,
  filterLibraryExercises,
  getLibraryExercises,
  groupLibraryByZone,
  toLibraryLocale,
  zoneForBodyPart,
  type LibraryZoneMeta,
} from '@/features/exercise-library/catalog';
import { getZoneCircuits } from '@/features/exercise-library/circuits';
import {
  formatPlanDateKey,
  getTodayPlan,
} from '@/features/exercise-library/suggestions';
import type { Exercise } from '@/data/exercises';
import type {
  LibraryExerciseRecord,
  LibraryPosition,
  LibraryZoneId,
} from '@/features/exercise-library/types';

type ListItem =
  | { type: 'header'; zone: LibraryZoneMeta; count: number }
  | { type: 'row'; record: LibraryExerciseRecord };

const POSITION_FILTERS: Array<LibraryPosition | null> = [null, 'desk', 'standing'];

function ExerciseLibraryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useTranslation();
  const locale = toLibraryLocale(language);
  const hasFullLibrary = useTierFeature('full_break_library').hasFeature;

  // Deep links (e.g. pain-focused reminders) can pre-select a zone shelf.
  const { initialZone } = useLocalSearchParams<{ initialZone?: string | string[] }>();
  const resolvedInitialZone = useMemo(() => {
    const candidate = Array.isArray(initialZone) ? initialZone[0] : initialZone;
    return LIBRARY_ZONES.some((zone) => zone.id === candidate)
      ? (candidate as LibraryZoneId)
      : null;
  }, [initialZone]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<LibraryZoneId | null>(
    resolvedInitialZone
  );
  const [selectedPosition, setSelectedPosition] = useState<LibraryPosition | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const deferredQuery = useDeferredValue(searchQuery);

  const painAreas = useOnboardingStore((state) => state.data.painAreas);
  const favoriteBreaks = useUserStore((state) => state.preferences.favoriteBreaks);
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);
  const favoriteSet = useMemo(() => new Set(favoriteBreaks), [favoriteBreaks]);
  const routines = useRoutinesStore((state) => state.routines);

  // Fixed at mount: the plan rotates per calendar day, not mid-session.
  const dateKey = useMemo(() => formatPlanDateKey(new Date()), []);
  const todayPlan = useMemo(
    () => getTodayPlan(painAreas, dateKey),
    [dateKey, painAreas]
  );
  const circuits = useMemo(() => getZoneCircuits(locale), [locale]);

  const filtered = useMemo(() => {
    const base = filterLibraryExercises({
      query: deferredQuery,
      zone: selectedZone,
      position: selectedPosition,
    });
    if (!favoritesOnly) return base;
    return base.filter((record) => favoriteSet.has(record.id));
  }, [deferredQuery, favoriteSet, favoritesOnly, selectedZone, selectedPosition]);

  const isFiltering =
    deferredQuery.trim().length > 0 ||
    selectedZone !== null ||
    selectedPosition !== null ||
    favoritesOnly;

  const listItems = useMemo<ListItem[]>(() => {
    if (isFiltering) {
      return filtered.map((record) => ({ type: 'row', record }));
    }
    return groupLibraryByZone(filtered).flatMap<ListItem>((group) => [
      { type: 'header', zone: group.zone, count: group.items.length },
      ...group.items.map<ListItem>((record) => ({ type: 'row', record })),
    ]);
  }, [filtered, isFiltering]);

  const totalCount = getLibraryExercises().length;

  // Funnel: one library view per visit, tagged with tier state.
  const viewTrackedRef = useRef(false);
  useEffect(() => {
    if (!viewTrackedRef.current) {
      viewTrackedRef.current = true;
      analytics.trackScreen('exercise_library', {
        total_moves: totalCount,
        has_full_library: hasFullLibrary,
      });
    }
  }, [hasFullLibrary, totalCount]);

  const handleRowPress = useCallback(
    (record: LibraryExerciseRecord) => {
      router.push({
        pathname: '/exercise-detail',
        params: { exerciseId: record.id },
      });
    },
    [router]
  );

  const handleZonePress = useCallback((zoneId: LibraryZoneId | null) => {
    Haptics.selectionAsync();
    setSelectedZone((current) => (current === zoneId ? null : zoneId));
  }, []);

  const handlePositionPress = useCallback((position: LibraryPosition | null) => {
    Haptics.selectionAsync();
    setSelectedPosition(position);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedZone(null);
    setSelectedPosition(null);
    setFavoritesOnly(false);
  }, []);

  const isLockedForUser = useCallback(
    (id: string) => !hasFullLibrary && !isFreeExercise(id),
    [hasFullLibrary]
  );

  const handleCircuitPress = useCallback(
    (circuit: Exercise, locked: boolean) => {
      if (locked) {
        router.push({
          pathname: '/subscription',
          params: { placement: 'library' },
        } as never);
        return;
      }
      router.push({
        pathname: '/break-session',
        params: { breakId: circuit.id },
      });
    },
    [router]
  );

  const openRoutineBuilder = useCallback(
    (routine?: CustomRoutine) => {
      router.push({
        pathname: '/routine-builder',
        params: routine ? { routineId: routine.id } : {},
      } as never);
    },
    [router]
  );

  const handleRoutinePlay = useCallback(
    (routine: CustomRoutine) => {
      router.push({
        pathname: '/break-session',
        params: { breakId: routine.id },
      });
    },
    [router]
  );

  const openProPaywall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/subscription',
      params: { placement: 'library' },
    } as never);
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') {
        return (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text.muted }]}>
              {t(`library.zones.${item.zone.id}`).toUpperCase()}
            </Text>
            <Text style={[styles.sectionCount, { color: theme.text.muted }]}>
              {item.count}
            </Text>
          </View>
        );
      }

      const record = item.record;
      return (
        <LibraryExerciseRow
          record={record}
          locale={locale}
          theme={theme}
          isLocked={isLockedForUser(record.id)}
          isFavorite={favoriteSet.has(record.id)}
          labels={{
            zone: t(`library.zones.${zoneForBodyPart(record.bodyPart)}`),
            difficulty: t(`library.difficulty.${record.difficulty}`),
            lockedHint: t('library.detail.unlockWithPro'),
            startHint: t('library.detail.startSession'),
          }}
          onPress={handleRowPress}
          onToggleFavorite={toggleFavorite}
        />
      );
    },
    [favoriteSet, handleRowPress, isLockedForUser, locale, t, theme, toggleFavorite]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text.primary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              {t('library.title')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              {t('library.subtitle', { count: totalCount })}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            theme={theme}
            placeholder={t('library.searchPlaceholder')}
          />

          {/* Zone rail */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zoneRail}
          >
            <ZoneChip
              label={t('library.allZones')}
              icon="🧩"
              color={theme.accent.primary}
              isSelected={selectedZone === null}
              onPress={() => handleZonePress(null)}
              theme={theme}
            />
            {LIBRARY_ZONES.map((zone) => (
              <ZoneChip
                key={zone.id}
                label={t(`library.zones.${zone.id}`)}
                icon={zone.icon}
                color={zone.color}
                isSelected={selectedZone === zone.id}
                onPress={() => handleZonePress(zone.id)}
                theme={theme}
              />
            ))}
          </ScrollView>

          {/* Position + favorites filter */}
          <View style={styles.positionRow}>
            {POSITION_FILTERS.map((position) => {
              const isSelected = selectedPosition === position;
              const label = t(`library.positions.${position ?? 'all'}`);
              return (
                <Pressable
                  key={position ?? 'all'}
                  onPress={() => handlePositionPress(position)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={label}
                  style={[
                    styles.positionChip,
                    {
                      backgroundColor: isSelected
                        ? `${theme.accent.primary}20`
                        : theme.isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                      borderColor: isSelected ? theme.accent.primary : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.positionChipText,
                      { color: isSelected ? theme.accent.primary : theme.text.secondary },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setFavoritesOnly((current) => !current);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: favoritesOnly }}
              accessibilityLabel={t('library.favoritesFilter')}
              style={[
                styles.positionChip,
                styles.favoritesChip,
                {
                  backgroundColor: favoritesOnly
                    ? 'rgba(255, 107, 107, 0.15)'
                    : theme.isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.04)',
                  borderColor: favoritesOnly ? '#EB3E38' : 'transparent',
                },
              ]}
            >
              <Ionicons
                name={favoritesOnly ? 'heart' : 'heart-outline'}
                size={13}
                color={favoritesOnly ? '#EB3E38' : theme.text.secondary}
              />
              <Text
                style={[
                  styles.positionChipText,
                  { color: favoritesOnly ? '#EB3E38' : theme.text.secondary },
                ]}
              >
                {t('library.favoritesFilter')}
              </Text>
            </Pressable>
          </View>

          {/* Pro upsell strip */}
          {!hasFullLibrary && (
            <Pressable
              onPress={openProPaywall}
              accessibilityRole="button"
              accessibilityLabel={t('library.upsell.title', { count: totalCount })}
              style={[
                styles.upsellStrip,
                {
                  borderColor: `${theme.accent.primary}40`,
                  backgroundColor: `${theme.accent.primary}0D`,
                },
              ]}
            >
              <Ionicons name="sparkles" size={16} color={theme.accent.primary} />
              <View style={styles.upsellText}>
                <Text style={[styles.upsellTitle, { color: theme.text.primary }]}>
                  {t('library.upsell.title', { count: totalCount })}
                </Text>
                <Text style={[styles.upsellSubtitle, { color: theme.text.muted }]}>
                  {t('library.upsell.subtitle')}
                </Text>
              </View>
              <Text style={[styles.upsellCta, { color: theme.accent.primary }]}>
                {t('library.upsell.cta')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Results */}
        {listItems.length > 0 ? (
          <FlashList
            data={listItems}
            renderItem={renderItem}
            keyExtractor={(item) =>
              item.type === 'header' ? `header-${item.zone.id}` : item.record.id
            }
            getItemType={(item) => item.type}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              isFiltering ? null : (
                <View>
                  <TodayPlanRail
                    title={t('library.today.title')}
                    subtitle={t('library.today.subtitle')}
                    plan={todayPlan}
                    locale={locale}
                    theme={theme}
                    isLocked={isLockedForUser}
                    onPressMove={handleRowPress}
                  />
                  <CircuitRail
                    title={t('library.circuits.title')}
                    subtitle={t('library.circuits.subtitle')}
                    durationLabel={(minutes) =>
                      t('library.circuits.duration', { minutes })
                    }
                    circuits={circuits}
                    theme={theme}
                    isLocked={isLockedForUser}
                    onPressCircuit={handleCircuitPress}
                  />
                  <RoutineRail
                    title={t('library.routines.title')}
                    subtitle={t('library.routines.subtitle')}
                    newLabel={t('library.routines.newRoutine')}
                    emptyHint={t('library.routines.empty')}
                    moveCountLabel={(count) =>
                      t('library.routines.moveCount', { count })
                    }
                    teaser={
                      hasFullLibrary
                        ? null
                        : {
                            title: t('library.routines.proTeaserTitle'),
                            subtitle: t('library.routines.proTeaserSubtitle'),
                          }
                    }
                    routines={routines}
                    theme={theme}
                    onPressNew={() => openRoutineBuilder()}
                    onPressPlay={handleRoutinePlay}
                    onPressEdit={openRoutineBuilder}
                    onPressTeaser={openProPaywall}
                  />
                </View>
              )
            }
          />
        ) : (
          <Animated.View entering={FadeIn.duration(250)} style={styles.emptyState}>
            <Ionicons
              name={favoritesOnly ? 'heart-outline' : 'search-outline'}
              size={44}
              color={theme.text.muted}
            />
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              {t('library.empty.title')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.text.muted }]}>
              {favoritesOnly ? t('library.favoritesEmpty') : t('library.empty.subtitle')}
            </Text>
            <Pressable
              onPress={handleClearFilters}
              style={[styles.clearButton, { borderColor: theme.accent.primary }]}
              accessibilityRole="button"
              accessibilityLabel={t('library.empty.clear')}
            >
              <Text style={[styles.clearButtonText, { color: theme.accent.primary }]}>
                {t('library.empty.clear')}
              </Text>
            </Pressable>
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

function ZoneChip({
  label,
  color,
  isSelected,
  onPress,
  theme,
}: {
  label: string;
  // `icon` is accepted from call sites but not rendered — zones are a type menu.
  icon?: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      style={styles.zoneChip}
    >
      <Text
        style={[
          styles.zoneChipText,
          { color: isSelected ? theme.text.primary : 'rgba(255,255,255,0.34)' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <View style={[styles.zoneChipBar, isSelected && { backgroundColor: color }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 30,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    marginTop: 3,
  },
  controls: {
    paddingHorizontal: Spacing.lg,
  },
  zoneRail: {
    paddingVertical: Spacing.sm,
    gap: 22,
    paddingRight: Spacing.lg,
    alignItems: 'flex-start',
  },
  zoneChip: {
    alignItems: 'center',
  },
  zoneChipText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  zoneChipBar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  positionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  positionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 0,
  },
  favoritesChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginLeft: 'auto',
  },
  positionChipText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 13,
  },
  upsellStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: Spacing.sm,
  },
  upsellText: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  upsellTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  upsellSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  upsellCta: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    flex: 1,
  },
  sectionCount: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 14,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  clearButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default function ExerciseLibraryWithErrorBoundary() {
  return (
    <ScreenErrorBoundary screenName="ExerciseLibrary">
      <ExerciseLibraryScreen />
    </ScreenErrorBoundary>
  );
}
