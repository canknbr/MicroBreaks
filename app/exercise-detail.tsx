/**
 * Exercise Detail Screen
 * Full movement view: looping demo GIF, taxonomy chips, muscles worked,
 * localized step-by-step instructions, and the guided-session CTA.
 * Media © Gym visual — attribution rendered below the demo.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { analytics } from '@/services/analytics';

import { Spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';
import { useTierFeature } from '@/hooks/useTierFeature';
import { isFreeExercise } from '@/services/subscription/exerciseAccess';
import { ScreenErrorBoundary } from '@/components/error';
import { useUserStore } from '@/store';
import {
  getLibraryExerciseRecord,
  getLibraryMedia,
  localizedName,
  localizedSteps,
  muscleLabel,
  toLibraryLocale,
  zoneForBodyPart,
  zoneMetaForRecord,
} from '@/features/exercise-library/catalog';
import { estimateSessionSeconds } from '@/features/exercise-library/session';

function ExerciseDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useTranslation();
  const locale = toLibraryLocale(language);

  const { exerciseId } = useLocalSearchParams<{ exerciseId?: string | string[] }>();
  const resolvedId = Array.isArray(exerciseId) ? exerciseId[0] : exerciseId;
  const record = getLibraryExerciseRecord(resolvedId);

  const hasFullLibrary = useTierFeature('full_break_library').hasFeature;
  const isLocked = record ? !hasFullLibrary && !isFreeExercise(record.id) : false;

  const favoriteBreaks = useUserStore((state) => state.preferences.favoriteBreaks);
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);
  const isFavorite = record ? favoriteBreaks.includes(record.id) : false;

  const zone = record ? zoneMetaForRecord(record) : null;
  const media = record ? getLibraryMedia(record) : undefined;
  const steps = useMemo(
    () => (record ? localizedSteps(record, locale) : []),
    [record, locale]
  );
  const minutes = record
    ? Math.max(1, Math.round(estimateSessionSeconds(record) / 60))
    : 0;

  // Funnel: which moves get viewed, and whether the viewer hit a lock.
  useEffect(() => {
    if (record) {
      analytics.trackScreen('exercise_detail', {
        exercise_id: record.id,
        locked: isLocked,
      });
    }
  }, [record, isLocked]);

  const openPaywall = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/subscription',
      params: { placement: 'library' },
    } as never);
  }, [router]);

  // Conversion treatment for locked moves: static blurred preview instead
  // of the animated guide, and only the first steps of the instructions.
  const VISIBLE_LOCKED_STEPS = 2;
  const visibleSteps = isLocked ? steps.slice(0, VISIBLE_LOCKED_STEPS) : steps;
  const hiddenStepCount = isLocked
    ? Math.max(0, steps.length - VISIBLE_LOCKED_STEPS)
    : 0;

  const handleStart = useCallback(() => {
    if (!record) return;
    if (isLocked) {
      openPaywall();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/break-session',
      params: { breakId: record.id },
    });
  }, [isLocked, openPaywall, record, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!record || !zone) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <View style={styles.notFound}>
            <Ionicons name="alert-circle-outline" size={44} color={theme.text.muted} />
            <Text style={[styles.notFoundText, { color: theme.text.secondary }]}>
              {t('library.detail.notFound')}
            </Text>
            <Pressable
              onPress={handleBack}
              style={[styles.notFoundButton, { borderColor: theme.accent.primary }]}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Text style={[styles.notFoundButtonText, { color: theme.accent.primary }]}>
                {t('common.back')}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const name = localizedName(record, locale);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.ambientGlow, { backgroundColor: zone.color }]} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={[
              styles.backButton,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.05)',
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={22} color={theme.text.primary} />
          </Pressable>
          <View style={styles.headerRight}>
            <View style={[styles.zoneBadge, { backgroundColor: `${zone.color}18` }]}>
              <Text style={styles.zoneBadgeIcon} accessibilityElementsHidden>
                {zone.icon}
              </Text>
              <Text style={[styles.zoneBadgeText, { color: zone.color }]}>
                {t(`library.zones.${zoneForBodyPart(record.bodyPart)}`)}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleFavorite(record.id);
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={name}
              accessibilityState={{ selected: isFavorite }}
              style={[
                styles.favoriteButton,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#FF6B6B' : theme.text.primary}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Demo media — locked moves get a blurred static preview that
              routes to the paywall; unlocked moves get the animated guide. */}
          {isLocked ? (
            <Pressable
              onPress={openPaywall}
              accessibilityRole="button"
              accessibilityLabel={t('library.detail.lockedPreviewBadge')}
              style={[styles.gifCard, { borderColor: `${zone.color}40`, shadowColor: zone.color }]}
            >
              {media ? (
                <Image
                  source={media.thumb}
                  style={styles.gif}
                  contentFit="contain"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={styles.gifFallback}>{zone.icon}</Text>
              )}
              <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
              <View style={styles.lockedPreviewOverlay}>
                <View style={[styles.lockedPreviewPill, { backgroundColor: zone.color }]}>
                  <Ionicons name="lock-closed" size={13} color="#000000" />
                  <Text style={styles.lockedPreviewPillText}>
                    {t('library.detail.lockedPreviewBadge')}
                  </Text>
                </View>
              </View>
            </Pressable>
          ) : (
            <View style={[styles.gifCard, { borderColor: `${zone.color}40`, shadowColor: zone.color }]}>
              {media ? (
                <Image
                  source={media.gif}
                  style={styles.gif}
                  contentFit="contain"
                  accessibilityIgnoresInvertColors
                  accessible
                  accessibilityLabel={name}
                />
              ) : (
                <Text style={styles.gifFallback}>{zone.icon}</Text>
              )}
            </View>
          )}
          <Text style={[styles.attribution, { color: theme.text.muted }]}>
            {t('library.detail.attribution')}
          </Text>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text.primary }]}>{name}</Text>

          {/* Meta chips */}
          <View style={styles.chipRow}>
            <MetaChip
              icon="time-outline"
              label={t('library.detail.aboutDuration', { minutes })}
              theme={theme}
            />
            <MetaChip
              icon="body-outline"
              label={t(`library.kinds.${record.kind}`)}
              theme={theme}
            />
            <MetaChip
              icon="speedometer-outline"
              label={t(`library.difficulty.${record.difficulty}`)}
              theme={theme}
            />
            <MetaChip
              icon="location-outline"
              label={t(`library.positions.${record.position}`)}
              theme={theme}
            />
          </View>

          {/* Muscles */}
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            {t('library.detail.muscles')}
          </Text>
          <View style={styles.muscleRow}>
            <View style={[styles.muscleChip, { backgroundColor: `${zone.color}18`, borderColor: `${zone.color}50` }]}>
              <Text style={[styles.muscleChipText, { color: zone.color }]}>
                {muscleLabel(record.target, locale)}
              </Text>
            </View>
            {record.secondaryMuscles.map((muscle) => (
              <View
                key={muscle}
                style={[
                  styles.muscleChip,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.04)',
                    borderColor: 'transparent',
                  },
                ]}
              >
                <Text style={[styles.muscleChipText, { color: theme.text.secondary }]}>
                  {muscleLabel(muscle, locale)}
                </Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            {t('library.detail.howTo')}
          </Text>
          {visibleSteps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: `${zone.color}18` }]}>
                <Text style={[styles.stepNumberText, { color: zone.color }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.stepText, { color: theme.text.secondary }]}>{step}</Text>
            </View>
          ))}
          {hiddenStepCount > 0 && (
            <Pressable
              onPress={openPaywall}
              accessibilityRole="button"
              accessibilityLabel={t('library.detail.moreStepsWithPro', {
                count: hiddenStepCount,
              })}
              style={[
                styles.lockedStepsRow,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.04)',
                  borderColor: `${zone.color}35`,
                },
              ]}
            >
              <Ionicons name="lock-closed" size={15} color={zone.color} />
              <Text style={[styles.lockedStepsText, { color: theme.text.secondary }]}>
                {t('library.detail.moreStepsWithPro', { count: hiddenStepCount })}
              </Text>
              <Ionicons name="chevron-forward" size={15} color={theme.text.muted} />
            </Pressable>
          )}

          {/* Safety note */}
          <View
            style={[
              styles.safetyNote,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255, 209, 102, 0.08)'
                  : 'rgba(255, 149, 0, 0.08)',
              },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.accent.warning} />
            <Text style={[styles.safetyText, { color: theme.text.secondary }]}>
              {t('library.detail.safety')}
            </Text>
          </View>
        </ScrollView>

        {/* Start CTA */}
        <Pressable
          onPress={handleStart}
          style={[styles.startButton, { backgroundColor: isLocked ? theme.accent.warning : zone.color }]}
          accessibilityRole="button"
          accessibilityLabel={
            isLocked ? t('library.detail.unlockWithPro') : t('library.detail.startSession')
          }
        >
          <Ionicons
            name={isLocked ? 'lock-closed' : 'play'}
            size={18}
            color="#000000"
          />
          <Text style={styles.startButtonText}>
            {isLocked ? t('library.detail.unlockWithPro') : t('library.detail.startSession')}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function MetaChip({
  icon,
  label,
  theme,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <View
      style={[
        styles.metaChip,
        {
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        },
      ]}
    >
      <Ionicons name={icon} size={13} color={theme.text.muted} />
      <Text style={[styles.metaChipText, { color: theme.text.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: -180,
    left: '50%',
    marginLeft: -220,
    width: 440,
    height: 440,
    borderRadius: 220,
    opacity: 0.07,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  zoneBadgeIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  zoneBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  gifCard: {
    alignSelf: 'center',
    width: 250,
    height: 250,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: Spacing.sm,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  gif: {
    width: 226,
    height: 226,
  },
  gifFallback: {
    fontSize: 72,
  },
  lockedPreviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedPreviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  lockedPreviewPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  lockedStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 4,
  },
  lockedStepsText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  attribution: {
    alignSelf: 'center',
    fontSize: 10,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  muscleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  muscleChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 14,
    padding: 12,
    marginTop: Spacing.sm,
  },
  safetyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  notFoundButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 18,
    borderWidth: 1,
  },
  notFoundButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default function ExerciseDetailWithErrorBoundary() {
  return (
    <ScreenErrorBoundary screenName="ExerciseDetail">
      <ExerciseDetailScreen />
    </ScreenErrorBoundary>
  );
}
