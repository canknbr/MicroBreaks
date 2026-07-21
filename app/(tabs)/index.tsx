/**
 * Home / "Today" — one job: take your next reset.
 *
 * Editorial, art-directed layout (not a stack of generic cards): a committed
 * category-color field at the top, an oversized recommendation hero, real
 * SF Symbol iconography (no emoji), and a single Start action. Everything
 * else lives on Progress/Profile so the user is never lost.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  EmptyState,
  HomeScreenSkeleton,
  CelebrationOverlay,
  ExpiredAccessBanner,
} from '@/components/home';
import { useHomeData, useFormattedDate } from '@/hooks/useHomeData';
import { getSuggestedBreak } from '@/services/recommendations/engine';
import { getExerciseById } from '@/data/exercises';
import { localizeExercise } from '@/data/exerciseLocalization';
import { toLibraryLocale } from '@/features/exercise-library/catalog';
import {
  RECOVERY_STATES,
  RecoveryStateId,
  composeRecoveryReason,
  getDefaultRecoveryStateId,
  getRecommendationContextForRecoveryState,
  getRecoveryReason,
} from '@/features/recovery/states';
import { getWorkPatternTimingHint } from '@/features/workday/patterns';
import { useOnboardingStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { language } = useTranslation();
  const onboardingData = useOnboardingStore((s) => s.data);

  const {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
    isNewUser,
    shouldCelebrate,
    clearCelebration,
  } = useHomeData({ workPattern: onboardingData.workPattern });

  const defaultRecoveryStateId = useMemo(
    () =>
      getDefaultRecoveryStateId(
        onboardingData.painAreas,
        onboardingData.breakStyle,
        onboardingData.energyPattern
      ),
    [onboardingData.painAreas, onboardingData.breakStyle, onboardingData.energyPattern]
  );
  const [selectedRecoveryStateId, setSelectedRecoveryStateId] =
    useState<RecoveryStateId>(defaultRecoveryStateId);
  useEffect(() => {
    setSelectedRecoveryStateId(defaultRecoveryStateId);
  }, [defaultRecoveryStateId]);

  const selectedRecoveryState = useMemo(
    () =>
      RECOVERY_STATES.find((s) => s.id === selectedRecoveryStateId) ??
      RECOVERY_STATES[0],
    [selectedRecoveryStateId]
  );

  // Peek-scroll the need selector once so the off-screen options are discoverable.
  const needScrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const t1 = setTimeout(() => needScrollRef.current?.scrollTo({ x: 80, animated: true }), 650);
    const t2 = setTimeout(() => needScrollRef.current?.scrollTo({ x: 0, animated: true }), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const formattedDate = useFormattedDate();

  const adaptiveRecommendation = useMemo(() => {
    if (!data) return null;
    const ctx = getRecommendationContextForRecoveryState(selectedRecoveryState.id);
    return getSuggestedBreak(
      ctx.painAreas,
      ctx.painSeverity,
      ctx.breakStyle,
      data.recommendationSignals.recentBreakIds,
      data.dailyProgress.breaksTaken,
      data.recommendationSignals.historicalOutcomes
    );
  }, [data, selectedRecoveryState.id]);

  const recommendedBreakId =
    adaptiveRecommendation?.exercise.id ?? selectedRecoveryState.breakId;

  const recommendedExercise = useMemo(() => {
    const locale = toLibraryLocale(language);
    const resolved = getExerciseById(recommendedBreakId, locale);
    return resolved ? localizeExercise(resolved, locale) : undefined;
  }, [language, recommendedBreakId]);

  const recommendedDuration = useMemo(
    () =>
      recommendedExercise
        ? `${Math.max(1, Math.round(recommendedExercise.totalDuration / 60))} min`
        : '1 min',
    [recommendedExercise]
  );

  const workPatternHint = useMemo(
    () => getWorkPatternTimingHint(onboardingData.workPattern),
    [onboardingData.workPattern]
  );

  const recoveryReason = useMemo(
    () =>
      composeRecoveryReason({
        baseReason: getRecoveryReason(
          selectedRecoveryState.id,
          data?.dailyProgress.lastBreakMinutesAgo ?? null,
          data?.dailyProgress.breaksTaken ?? 0,
          isNewUser
        ),
        adaptiveReason: adaptiveRecommendation?.reason ?? null,
        workPatternHint,
      }),
    [
      adaptiveRecommendation,
      selectedRecoveryState.id,
      data?.dailyProgress.lastBreakMinutesAgo,
      data?.dailyProgress.breaksTaken,
      isNewUser,
      workPatternHint,
    ]
  );

  const handleStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/break-session', params: { breakId: recommendedBreakId } });
  }, [recommendedBreakId]);

  const handleNeed = useCallback((id: RecoveryStateId) => {
    Haptics.selectionAsync();
    setSelectedRecoveryStateId(id);
  }, []);

  const handleBrowse = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/breaks');
  }, []);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
  }, [refresh]);

  const accent = selectedRecoveryState.color;
  const breaksTaken = data?.dailyProgress.breaksTaken ?? 0;
  const breaksGoal = data?.dailyProgress.breaksGoal ?? 0;
  const streak = data?.streak.current ?? 0;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <HomeScreenSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.centerContent}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.accent.primary} />
            }
          >
            <EmptyState type="error" onAction={handleRefresh} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {shouldCelebrate && (
        <CelebrationOverlay
          type={shouldCelebrate}
          value={shouldCelebrate === 'streak_milestone' ? data?.streak.current : undefined}
          onDismiss={clearCelebration}
        />
      )}

      {/* Art-directed category-color wash — a soft directional field that
          fades to canvas. No hard circle/blob. */}
      <View style={styles.colorField} pointerEvents="none">
        <LinearGradient
          colors={[`${accent}52`, `${accent}17`, 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.6, y: 1 }}
        />
      </View>

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 176 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={theme.accent.primary} />
          }
        >
          {/* Header — clean: just the day + date */}
          <View style={styles.headerTop}>
            <Text style={[styles.todayTitle, { color: theme.text.primary }]} accessibilityRole="header">
              Today
            </Text>
            <Text style={[styles.todayDate, { color: 'rgba(255,255,255,0.55)' }]}>{formattedDate}</Text>
          </View>

          <View style={styles.centerBlock}>
          {/* Editorial hero — the recommended reset, oversized */}
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>YOUR NEXT RESET</Text>
            <Text style={[styles.heroTitle, { color: theme.text.primary }]} numberOfLines={3}>
              {recommendedExercise?.title ?? selectedRecoveryState.title}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.durationText}>{recommendedDuration}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={[styles.metaCat, { color: theme.text.secondary }]}>{selectedRecoveryState.label}</Text>
            </View>

            <Text style={[styles.heroWhy, { color: theme.text.secondary }]}>{recoveryReason}</Text>
          </View>

          {/* Need selector — type menu (dim → white, colored underline) */}
          <Text style={[styles.sectionLabel, { color: theme.text.muted }]}>OR PICK WHAT NEEDS A RESET</Text>
          <ScrollView
            ref={needScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.needScroll}
            contentContainerStyle={styles.needRow}
          >
            {RECOVERY_STATES.map((state) => {
              const selected = state.id === selectedRecoveryState.id;
              return (
                <Pressable
                  key={state.id}
                  onPress={() => handleNeed(state.id)}
                  style={styles.needItem}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={state.label}
                >
                  <Text
                    style={[
                      styles.needLabel,
                      { color: selected ? theme.text.primary : 'rgba(255,255,255,0.34)' },
                    ]}
                  >
                    {state.label}
                  </Text>
                  <View style={[styles.needBar, selected && { backgroundColor: state.color }]} />
                </Pressable>
              );
            })}
          </ScrollView>

          {/* One-line progress */}
          <Pressable style={styles.progressRow} onPress={handleBrowse} accessibilityRole="button">
            <Text style={[styles.progressText, { color: theme.text.secondary }]}>
              <Text style={styles.progressNum}>{breaksTaken}</Text>
              {` of ${breaksGoal} today`}
              {streak > 0 ? '   ·   ' : ''}
              {streak > 0 ? <Text style={styles.progressNum}>{streak}</Text> : null}
              {streak > 0 ? ' day streak' : ''}
            </Text>
            <Text style={[styles.browseLink, { color: theme.accent.primary }]}>Browse all →</Text>
          </Pressable>
          </View>

          <ExpiredAccessBanner />
        </ScrollView>

        {/* Pinned primary action — thumb-reachable at the bottom */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 84 }]} pointerEvents="box-none">
          <LinearGradient
            colors={['transparent', theme.background.primary]}
            style={styles.footerFade}
            pointerEvents="none"
          />
          <Pressable
            style={styles.startBtn}
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel={`Start ${recommendedExercise?.title ?? selectedRecoveryState.title}`}
          >
            <Text style={styles.startBtnText}>Start reset</Text>
            <IconSymbol name="arrow.right" size={18} color="#0B0A0D" weight="bold" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 140, flexGrow: 1 },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  colorField: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 460,
    overflow: 'hidden',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrap: { flex: 1 },
  todayTitle: { fontFamily: 'GeneralSans-Bold', fontSize: 32, letterSpacing: -0.8 },
  todayDate: { fontFamily: 'GeneralSans-Medium', fontSize: 15, marginTop: 2 },
  hero: {
    marginTop: 0,
  },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.6)',
  },
  heroTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -1.2,
    marginTop: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  durationText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  metaDot: { color: 'rgba(255,255,255,0.35)', fontSize: 14 },
  metaCat: { fontFamily: 'GeneralSans-Semibold', fontSize: 15 },
  heroWhy: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 18,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    height: 58,
    backgroundColor: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 0,
    paddingTop: 12,
  },
  footerFade: {
    position: 'absolute',
    left: -20,
    right: -20,
    top: -56,
    bottom: 0,
  },
  startBtnText: { fontFamily: 'GeneralSans-Bold', fontSize: 17, color: '#0B0A0D' },
  sectionLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    marginTop: 34,
    marginBottom: 12,
  },
  needScroll: { flexGrow: 0, height: 46 },
  needRow: { gap: 22, paddingRight: 20, alignItems: 'flex-start' },
  needItem: { alignItems: 'center' },
  needLabel: { fontFamily: 'GeneralSans-Bold', fontSize: 20, letterSpacing: -0.4 },
  needBar: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginTop: 7,
    backgroundColor: 'transparent',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  progressText: { fontFamily: 'GeneralSans-Medium', fontSize: 14 },
  progressNum: { fontFamily: 'JetBrainsMono-Bold', color: '#FFFFFF' },
  browseLink: { fontFamily: 'GeneralSans-Semibold', fontSize: 14 },
  bottomSpacer: { height: 40 },
});
