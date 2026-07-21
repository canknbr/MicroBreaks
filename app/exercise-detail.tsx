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
            <Text style={[styles.zoneBadgeText, { color: zone.color }]}>
              {t(`library.zones.${zoneForBodyPart(record.bodyPart)}`).toUpperCase()}
            </Text>
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
                color={isFavorite ? '#EB3E38' : theme.text.primary}
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
              style={styles.gifCard}
            >
              {media ? (
                <Image
                  source={media.thumb}
                  style={styles.gif}
                  contentFit="contain"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={styles.gifFallback}>{name.charAt(0)}</Text>
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
            <View style={styles.gifCard}>
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
                <Text style={styles.gifFallback}>{name.charAt(0)}</Text>
              )}
            </View>
          )}
          <Text style={[styles.attribution, { color: theme.text.muted }]}>
            {t('library.detail.attribution')}
          </Text>

          {/* Title */}
          <Text style={[styles.title, { color: theme.text.primary }]}>{name}</Text>

          {/* Meta line */}
          <Text style={[styles.metaLine, { color: theme.text.muted }]}>
            {t('library.detail.aboutDuration', { minutes })}
            {'   ·   '}{t(`library.kinds.${record.kind}`)}
            {'   ·   '}{t(`library.difficulty.${record.difficulty}`)}
            {'   ·   '}{t(`library.positions.${record.position}`)}
          </Text>

          {/* Muscles */}
          <Text style={[styles.sectionTitle, { color: theme.text.muted }]}>
            {t('library.detail.muscles').toUpperCase()}
          </Text>
          <View style={styles.muscleRow}>
            <Text style={[styles.musclePrimary, { color: zone.color }]}>
              {muscleLabel(record.target, locale)}
            </Text>
            {record.secondaryMuscles.map((muscle) => (
              <Text key={muscle} style={[styles.muscleSecondary, { color: theme.text.muted }]}>
                {muscleLabel(muscle, locale)}
              </Text>
            ))}
          </View>

          {/* Steps */}
          <Text style={[styles.sectionTitle, { color: theme.text.muted }]}>
            {t('library.detail.howTo').toUpperCase()}
          </Text>
          {visibleSteps.map((step, index) => (
            <View key={index} style={[styles.stepRow, index > 0 && styles.stepDivider, { borderTopColor: theme.border.subtle }]}>
              <Text style={[styles.stepNumberText, { color: zone.color }]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
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
          <View style={[styles.safetyNote, { borderTopColor: theme.border.subtle }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={theme.text.muted} />
            <Text style={[styles.safetyText, { color: theme.text.muted }]}>
              {t('library.detail.safety')}
            </Text>
          </View>
        </ScrollView>

        {/* Start CTA */}
        <Pressable
          onPress={handleStart}
          style={styles.startButton}
          accessibilityRole="button"
          accessibilityLabel={
            isLocked ? t('library.detail.unlockWithPro') : t('library.detail.startSession')
          }
        >
          <Ionicons
            name={isLocked ? 'lock-closed' : 'play'}
            size={18}
            color="#0B0A0D"
          />
          <Text style={styles.startButtonText}>
            {isLocked ? t('library.detail.unlockWithPro') : t('library.detail.startSession')}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  zoneBadgeText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 11,
    letterSpacing: 1.4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  gifCard: {
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  gif: {
    width: 236,
    height: 236,
  },
  gifFallback: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 72,
    color: '#0B0A0D',
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
    borderRadius: 100,
  },
  lockedPreviewPillText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    color: '#000000',
  },
  lockedStepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  lockedStepsText: {
    flex: 1,
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 14,
  },
  attribution: {
    alignSelf: 'center',
    fontFamily: 'GeneralSans-Regular',
    fontSize: 10,
    marginTop: 10,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 30,
    letterSpacing: -0.8,
    marginTop: Spacing.md,
    marginBottom: 12,
  },
  metaLine: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    marginTop: 24,
    marginBottom: 12,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 6,
    marginBottom: Spacing.sm,
  },
  musclePrimary: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  muscleSecondary: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
  },
  stepDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stepNumberText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    width: 22,
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 18,
    marginTop: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  safetyText: {
    flex: 1,
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    lineHeight: 19,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  startButtonText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    color: '#0B0A0D',
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
