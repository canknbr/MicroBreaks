/**
 * Breaks Screen — editorial. Pick a focus (type-menu), then a reset
 * (hairline type-list). No featured card / search / filter chrome.
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';
import { useOnboardingStore } from '@/store';
import { useTierFeature } from '@/hooks/useTierFeature';
import { useTheme } from '@/hooks/useTheme';
import { ALL_EXERCISES } from '@/data/exercises';
import { getBreakHistory } from '@/services/breakHistory';
import {
  CATEGORY_DEFINITIONS,
  OUTCOME_PACKS,
  OutcomePackId,
  formatDurationMinutes,
  getDefaultOutcomePackId,
  isStarterExercise,
} from '@/features/recovery/outcomePacks';
import {
  mapBreakHistoryToOutcomeSignals,
  sortBreakListByOutcome,
} from '@/features/recovery/personalization';
import { useTranslation } from '@/i18n/hooks';
import { toLibraryLocale } from '@/features/exercise-library/catalog';
import { localizeExercise } from '@/data/exerciseLocalization';
import type { BreakListItem } from '@/components/breaks/types';
import type { RecommendationOutcomeSignal } from '@/services/recommendations/scoring';

export default function BreaksScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { language } = useTranslation();
  const onboardingData = useOnboardingStore((state) => state.data);

  const [selectedPackId, setSelectedPackId] = useState<OutcomePackId>(
    getDefaultOutcomePackId(onboardingData.painAreas, onboardingData.breakStyle)
  );
  const [historicalOutcomes, setHistoricalOutcomes] = useState<RecommendationOutcomeSignal[]>([]);
  const hasFullLibrary = useTierFeature('full_break_library').hasFeature;

  const defaultPackId = useMemo(
    () => getDefaultOutcomePackId(onboardingData.painAreas, onboardingData.breakStyle),
    [onboardingData.breakStyle, onboardingData.painAreas]
  );

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
      ALL_EXERCISES.map((raw) => {
        const exercise = localizeExercise(raw, toLibraryLocale(language));
        return {
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
        };
      }),
    [hasFullLibrary, language]
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

  const openProPreview = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/subscription',
      params: { placement: 'breaks' },
    } as any);
  }, [router]);

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

  const handlePackPress = useCallback((packId: OutcomePackId) => {
    Haptics.selectionAsync();
    setSelectedPackId(packId);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Breaks</Text>
            <Text style={styles.subtitle}>Pick a focus, then a reset.</Text>
          </View>

          {/* Focus selector — horizontal type-menu */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.packRail}
          >
            {OUTCOME_PACKS.map((pack) => {
              const on = pack.id === selectedPack.id;
              return (
                <Pressable
                  key={pack.id}
                  onPress={() => handlePackPress(pack.id)}
                  style={styles.packItem}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={pack.title}
                >
                  <Text style={[styles.packLabel, on ? styles.packOn : styles.packOff]}>
                    {pack.shortLabel}
                  </Text>
                  <View style={[styles.packBar, { opacity: on ? 1 : 0 }]} />
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Exercises for the selected focus — type list */}
          <View style={styles.list}>
            {sortedPackBreaks.map((item, i) => (
              <Pressable
                key={item.id}
                onPress={() => handleBreakPress(item)}
                style={[styles.exRow, i > 0 && styles.exDivider]}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${item.duration}`}
              >
                <View style={styles.exText}>
                  <Text style={styles.exTitle} numberOfLines={1}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.exDesc} numberOfLines={1}>{item.description}</Text>
                  ) : null}
                </View>
                <View style={styles.exMeta}>
                  {item.isLocked ? (
                    <IconSymbol name="lock.fill" size={12} color="rgba(255,255,255,0.4)" />
                  ) : null}
                  <Text style={styles.exDuration}>{item.duration}</Text>
                </View>
              </Pressable>
            ))}
          </View>


          {/* Full library link */}
          <Pressable
            style={styles.libraryLink}
            onPress={() => router.push('/exercise-library' as never)}
            accessibilityRole="button"
          >
            <Text style={styles.libraryLinkText}>Full movement library</Text>
            <IconSymbol name="arrow.right" size={16} color="#FF2472" />
          </Pressable>

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
    backgroundColor: '#BC26F4',
  },
  ambientTeal: {
    bottom: 100,
    right: -150,
    width: 350,
    height: 350,
    backgroundColor: '#FF2472',
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
    marginBottom: 18,
    marginTop: 4,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 34,
    letterSpacing: -0.8,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  packRail: {
    gap: 22,
    paddingRight: 20,
    paddingVertical: 4,
  },
  packItem: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  packLabel: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  packOn: { color: '#FFFFFF' },
  packOff: { color: 'rgba(255,255,255,0.34)' },
  packBar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
    marginTop: 8,
  },
  list: {
    marginTop: 22,
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  exDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  exText: { flex: 1, marginRight: 12 },
  exTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 18,
    letterSpacing: -0.2,
    color: '#FFFFFF',
  },
  exDesc: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  exMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exDuration: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  libraryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
    paddingVertical: 8,
  },
  libraryLinkText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 15,
    color: '#FF2472',
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
    borderColor: '#FF2472',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF2472',
  },
});
