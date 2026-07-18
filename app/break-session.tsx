/**
 * Break Session Screen
 * Full-screen immersive break execution experience
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useBreakSession } from '@/hooks/useBreakSession';
import { useAchievements } from '@/hooks/useAchievements';
import { useEffectiveTier } from '@/hooks/useEffectiveTier';
import { requiresUpgradeForExercise } from '@/services/subscription/exerciseAccess';
import { useFreeQuotaCheck } from '@/hooks/useFreeQuotaCheck';
import { saveCompletedBreak, getTodayBreaks, getUserStats } from '@/services/breakHistory';
import { breakSounds } from '@/services/audio/breakSounds';
import { STREAK_MILESTONES } from '@/constants/config';
import { calculateDailyGoal } from '@/utils/validation';
import { getLevelTitle } from '@/constants/levels';
import {
  scheduleBreakReminder,
  sendGoalCompletedNotification,
} from '@/services/notifications';
import {
  useUserStore,
  useNotificationStore,
  createGoalNotification,
  createStreakNotification,
  createLevelUpNotification,
} from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';
import {
  BreakHeader,
  BreakProgress,
  BreakControls,
  BreakCompletion,
  BreakFeedback,
  BreathingExercise,
  EyeExercise,
  NeckExercise,
  StretchExercise,
  ActiveExercise,
  GifExercise,
} from '@/components/break-session';
import { AnimationType } from '@/data/exercises';
import { ScreenErrorBoundary } from '@/components/error';
import { resolveBreakSessionBreakId } from '@/features/break-session/sessionParams';

/** Coarse origin of a session id for funnel segmentation. */
function breakSourceKind(id: string): 'core' | 'library' | 'circuit' | 'routine' {
  if (id.startsWith('lib-')) return 'library';
  if (id.startsWith('circuit-')) return 'circuit';
  if (id.startsWith('routine-')) return 'routine';
  return 'core';
}
import { useBreakLiveActivity } from '@/services/widgets/liveActivity';
import {
  getLibraryMedia,
  isLibraryExerciseId,
  localizedName,
  toLibraryLocale,
} from '@/features/exercise-library/catalog';
import { getNextZoneMove } from '@/features/exercise-library/suggestions';
import { analytics, AnalyticsEvent } from '@/services/analytics';

function BreakSessionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, language } = useTranslation();
  const { breakId } = useLocalSearchParams<{ breakId?: string | string[] }>();
  const resolvedBreakId = resolveBreakSessionBreakId(breakId);

  // Defense in depth: even if a deep link, Siri shortcut, or auto-
  // launched timer bypasses the breaks-tab lock UI, the session
  // refuses to mount for a paid exercise the user can't access and
  // redirects to the paywall. Loading state (server ledger hasn't
  // answered yet) lets the session render optimistically — the
  // alternative is flashing a paywall for paying users on cold start.
  const { tier, loaded: tierLoaded } = useEffectiveTier();
  const needsUpgrade =
    tierLoaded && requiresUpgradeForExercise(resolvedBreakId, tier);

  // Free-tier daily cap. The screen is the only place we enforce it
  // — once a user is here, we know they're committing to a session,
  // and the gate sends them to the paywall instead of starting it.
  // The check is gated on `tier === 'free'`; paid tiers skip the
  // history fetch entirely.
  const quota = useFreeQuotaCheck({ enabled: tierLoaded && tier === 'free' });
  const overFreeQuota = tierLoaded && tier === 'free' && quota.exhausted;

  useEffect(() => {
    if (needsUpgrade) {
      router.replace(
        ({
          pathname: '/subscription',
          params: { placement: 'breaks' },
        } as never)
      );
      return;
    }
    if (overFreeQuota) {
      router.replace(
        ({
          pathname: '/subscription',
          params: { placement: 'free_quota' },
        } as never)
      );
    }
  }, [needsUpgrade, overFreeQuota, router]);

  const { state, actions, stats, progress } = useBreakSession(resolvedBreakId);

  // Live Activity (iOS Dynamic Island + Lock Screen) — bridges the
  // session timer into the system Activity API. No-ops on Android, web,
  // and pre-prebuild iOS so call sites stay platform-agnostic.
  useBreakLiveActivity({
    sessionKey: state.exercise ? `${state.exercise.id}-${state.currentStepIndex}` : null,
    context: state.exercise
      ? {
          breakId: state.exercise.id,
          title: state.exercise.title,
          icon: state.exercise.icon,
          colorHex: state.exercise.color,
          totalSeconds: state.exercise.totalDuration,
        }
      : null,
    state: state.currentStep
      ? {
          timeRemainingSec: state.timeRemaining,
          isPaused: state.isPaused,
          progress: Math.max(0, Math.min(1, progress / 100)),
          stepLabel: state.currentStep.instruction,
        }
      : null,
    isFinished: state.phase === 'completion' || state.phase === 'feedback',
  });

  // User store actions
  const trackBreakCompletion = useUserStore((state) => state.trackBreakCompletion);
  const addRecentBreak = useUserStore((state) => state.addRecentBreak);
  const currentLevel = useUserStore((state) => state.progress.level);

  // Notifications
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Achievements
  const { checkAndUnlockAchievements } = useAchievements();

  // Funnel: one BREAK_STARTED per mounted session (the screen is keyed by
  // break id, so a chained "next move" replace emits its own event).
  const startTrackedRef = useRef(false);
  useEffect(() => {
    if (state.exercise && !startTrackedRef.current) {
      startTrackedRef.current = true;
      analytics.track(AnalyticsEvent.BREAK_STARTED, {
        break_id: state.exercise.id,
        break_type: state.exercise.category,
        source_kind: breakSourceKind(state.exercise.id),
        break_duration: state.exercise.totalDuration,
      });
    }
  }, [state.exercise]);

  // Ambient Soundscape Management
  useEffect(() => {
    const isPlayingPhase = ['preparation', 'instruction', 'execution'].includes(state.phase);

    if (isPlayingPhase && !state.isPaused) {
      void breakSounds.play('ambient-nature');
    } else {
      void breakSounds.stop('ambient-nature');
    }

    return () => {
      // Stop ambient track on unmount
      void breakSounds.stop('ambient-nature');
    };
  }, [state.phase, state.isPaused]);

  // Track if we've already saved this session
  const savedRef = useRef(false);
  const previousLevelRef = useRef(currentLevel);
  // Missions that newly completed alongside the save — surfaced by the
  // completion screen so bonus XP is visible. State (not ref) so a
  // re-render paints the callout once the save returns.
  const [completedMissionFeedback, setCompletedMissionFeedback] = useState<
    Array<{ id: string; description: string; bonusXP: number }>
  >([]);

  // Persisting the break is deferred until the user either submits feedback
  // (so rating + reliefScore land in the record) or explicitly finishes from
  // the completion screen. This avoids the historic two-step save+update flow
  // that briefly exposed rating=null records to the recommendation engine.
  const persistBreakRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    persistBreakRef.current = async () => {
      if (savedRef.current) return;
      const exercise = state.exercise;
      if (!exercise) return;
      if (state.phase !== 'completion' && state.phase !== 'feedback') return;

      savedRef.current = true;

      const saveResult = await saveCompletedBreak({
        breakId: exercise.id,
        title: exercise.title,
        category: exercise.category,
        icon: exercise.icon,
        color: exercise.color,
        duration: stats.totalDuration,
        stepsCompleted: stats.stepsCompleted,
        totalSteps: stats.totalSteps,
        xpEarned: stats.xpEarned,
        rating: state.feedbackRating,
        reliefScore: state.feedbackReliefScore,
        completedAt: new Date().toISOString(),
      });

      if (!saveResult.success) {
        // Allow a retry on the next trigger (e.g., user taps Done again).
        savedRef.current = false;
        if (__DEV__) {
          console.warn('Failed to save break to history:', saveResult.error);
        }
        return;
      }

      analytics.track(AnalyticsEvent.BREAK_COMPLETED, {
        break_id: exercise.id,
        break_type: exercise.category,
        source_kind: breakSourceKind(exercise.id),
        break_duration: stats.totalDuration,
        steps_completed: stats.stepsCompleted,
      });

      // Surface mission-bonus feedback to the completion screen. Map to
      // just the fields the UI uses so a Mission shape change later
      // doesn't cascade into the screen.
      if (saveResult.completedMissions && saveResult.completedMissions.length > 0) {
        setCompletedMissionFeedback(
          saveResult.completedMissions.map((m) => ({
            id: m.id,
            description: m.description,
            bonusXP: m.bonusXP,
          })),
        );
      }

      try {
        await scheduleBreakReminder();
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to schedule break reminder:', error);
        }
      }

      trackBreakCompletion(exercise.category, Math.round(stats.totalDuration / 60));
      addRecentBreak(exercise.id);
      checkAndUnlockAchievements();

      try {
        const todayBreaks = await getTodayBreaks();
        const userStats = await getUserStats();
        const dailyGoal = calculateDailyGoal(userStats.weeklyGoal);

        if (todayBreaks.length === dailyGoal) {
          addNotification(createGoalNotification());
          try {
            await sendGoalCompletedNotification();
          } catch (notifError) {
            if (__DEV__) {
              console.warn('Failed to send goal notification:', notifError);
            }
          }
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Failed to check daily goal:', error);
        }
      }

      const latestStreak = useUserStore.getState().progress.currentStreak;
      if (STREAK_MILESTONES.includes(latestStreak as typeof STREAK_MILESTONES[number])) {
        addNotification(createStreakNotification(latestStreak));
      }
    };
  });

  // Persist immediately when the user submits feedback so the recommendation
  // engine sees the rating and reliefScore on the first read.
  useEffect(() => {
    if (state.phase === 'feedback' && !savedRef.current) {
      void persistBreakRef.current?.().catch((error) => {
        if (__DEV__) {
          console.error('Error persisting break after feedback:', error);
        }
      });
    }
  }, [state.phase]);

  // Final safety net: if the screen unmounts without an explicit save (e.g.,
  // hardware back gesture from the completion screen), persist whatever state
  // we have so the break still counts toward today's stats and streak.
  useEffect(() => {
    return () => {
      if (!savedRef.current) {
        void persistBreakRef.current?.().catch(() => {
          // Silent — unmount path, nothing to surface to the user.
        });
      }
    };
  }, []);

  // Check for level up after XP is added
  useEffect(() => {
    if (currentLevel > previousLevelRef.current) {
      // User leveled up!
      const title = getLevelTitle(currentLevel);
      addNotification(createLevelUpNotification(currentLevel, title));
      previousLevelRef.current = currentLevel;
    }
  }, [currentLevel, addNotification]);

  // Post-session momentum: for library sessions, surface the next playable
  // move in the same body zone on the feedback screen.
  const nextMove = useMemo(() => {
    if (!state.exercise || !isLibraryExerciseId(state.exercise.id)) return null;
    if (!tierLoaded) return null;
    return getNextZoneMove(
      state.exercise.id,
      (id) => !requiresUpgradeForExercise(id, tier)
    );
  }, [state.exercise, tier, tierLoaded]);

  const handleNextMove = useCallback(() => {
    if (!nextMove) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // The completed session is already persisted (feedback phase implies a
    // submitted save); the keyed wrapper remounts a fresh state machine.
    router.replace({
      pathname: '/break-session',
      params: { breakId: nextMove.id },
    });
  }, [nextMove, router]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    actions.endSession();
  }, [actions]);

  const handleFinish = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!savedRef.current) {
      try {
        await persistBreakRef.current?.();
      } catch (error) {
        if (__DEV__) {
          console.error('Error persisting break on finish:', error);
        }
      }
    }
    router.back();
  }, [router]);

  // Determine which exercise component to render based on animation type
  const renderExerciseAnimation = useCallback(() => {
    if (!state.currentStep || !state.exercise) return null;

    const { animation, instruction, visualGuide } = state.currentStep;
    const color = state.exercise.color;

    // Movement-library sessions render their demo GIF for every working
    // step. Circuits pin per-step media so the GIF switches with each move;
    // "rest" steps (transitions, closer) fall through to the calm default.
    const stepMedia = state.currentStep.media ?? state.exercise.media;
    if (stepMedia && animation !== 'rest') {
      return (
        <GifExercise
          source={stepMedia.gif}
          instruction={instruction}
          color={color}
          isFlowStep={state.currentStep.id.endsWith('-flow')}
        />
      );
    }

    // Group animations by exercise type
    const breathingAnimations: AnimationType[] = ['breathe-in', 'breathe-hold', 'breathe-out'];
    const eyeAnimations: AnimationType[] = [
      'eye-move-circle',
      'eye-move-horizontal',
      'eye-move-vertical',
      'eye-move-figure8',
      'eye-focus-near',
      'eye-focus-far',
      'eye-palming',
      'eye-rest',
    ];
    const neckAnimations: AnimationType[] = [
      'rotate-left',
      'rotate-right',
      'tilt-left',
      'tilt-right',
      'tilt-forward',
      'tilt-back',
    ];
    const activeAnimations: AnimationType[] = ['walk', 'active'];

    if (breathingAnimations.includes(animation)) {
      return (
        <BreathingExercise
          animation={animation}
          instruction={instruction}
          color={color}
        />
      );
    }

    if (eyeAnimations.includes(animation)) {
      return (
        <EyeExercise
          animation={animation}
          instruction={instruction}
          color={color}
        />
      );
    }

    if (neckAnimations.includes(animation)) {
      return (
        <NeckExercise
          animation={animation}
          instruction={instruction}
          color={color}
          visualGuide={visualGuide}
        />
      );
    }

    if (activeAnimations.includes(animation)) {
      return (
        <ActiveExercise
          animation={animation}
          instruction={instruction}
          color={color}
          visualGuide={visualGuide}
          timeRemaining={state.timeRemaining}
        />
      );
    }

    // Default to stretch exercise for hold, rest, stretch-* animations
    return (
      <StretchExercise
        animation={animation}
        instruction={instruction}
        color={color}
        visualGuide={visualGuide}
      />
    );
  }, [state.currentStep, state.exercise, state.timeRemaining]);

  // Render content based on phase
  const renderContent = useCallback(() => {
    const exercise = state.exercise;
    if (!exercise) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>{t('common.loading')}</Text>
        </View>
      );
    }

    switch (state.phase) {
      case 'loading':
        return (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.text.secondary }]}>{t('common.loading')}</Text>
          </View>
        );

      case 'preparation':
        return (
          <Animated.View
            entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(200).reduceMotion(ReduceMotion.System)}
            style={styles.preparationContainer}
          >
            <Text style={[styles.preparationTitle, { color: theme.text.secondary }]}>{t('breakSession.preparation.title')}</Text>
            <View style={[styles.preparationIconContainer, { borderColor: exercise.color, backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }]}>
              <Text style={styles.preparationIcon}>{exercise.icon}</Text>
            </View>
            <Text style={[styles.preparationExercise, { color: theme.text.primary }]}>{exercise.title}</Text>
            <Text style={[styles.preparationCountdown, { color: exercise.color }]}>
              {state.timeRemaining}
            </Text>
            <Text style={[styles.disclaimerText, { color: theme.text.muted }]}>
              {t('breakSession.preparation.disclaimer')}
            </Text>
          </Animated.View>
        );

      case 'instruction':
      case 'execution':
      case 'transition':
        return (
          <Animated.View
            entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)}
            style={styles.exerciseContainer}
          >
            {/* Progress */}
            <BreakProgress
              currentStep={state.currentStepIndex}
              totalSteps={exercise.steps.length}
              progress={progress}
              color={exercise.color}
            />

            {/* Exercise Animation */}
            <View style={styles.animationContainer}>
              {renderExerciseAnimation()}
            </View>

            {/* Controls */}
            <BreakControls
              isPaused={state.isPaused}
              onPause={actions.pause}
              onResume={actions.resume}
              onSkip={actions.skipStep}
              onEnd={handleClose}
              color={exercise.color}
            />
          </Animated.View>
        );

      case 'completion':
        return (
          <Animated.View
            entering={FadeIn.duration(400).reduceMotion(ReduceMotion.System)}
            style={styles.completionContainer}
          >
            <BreakCompletion
              title={exercise.title}
              icon={exercise.icon}
              color={exercise.color}
              stats={stats}
              completedMissions={completedMissionFeedback}
            />

            {/* Feedback */}
            <BreakFeedback
              onSubmit={actions.submitFeedback}
              selectedRating={state.feedbackRating}
              selectedReliefScore={state.feedbackReliefScore}
              color={exercise.color}
            />

            {/* Done Button */}
            <Pressable
              style={[styles.doneButton, { backgroundColor: exercise.color }]}
              onPress={handleFinish}
              accessibilityRole="button"
              accessibilityLabel={t('common.done')}
            >
              <Text style={styles.doneButtonText}>{t('common.done')}</Text>
            </Pressable>
          </Animated.View>
        );

      case 'feedback':
        return (
          <Animated.View
            entering={FadeIn.duration(300).reduceMotion(ReduceMotion.System)}
            style={styles.completionContainer}
          >
            <View style={styles.feedbackComplete}>
              <Text style={styles.feedbackCompleteEmoji} accessibilityElementsHidden>🙏</Text>
              <Text style={[styles.feedbackCompleteTitle, { color: theme.text.primary }]}>{t('breakSession.feedback.thankYou', { defaultValue: 'Thank you!' })}</Text>
              <Text style={[styles.feedbackCompleteText, { color: theme.text.secondary }]}>
                {t('breakSession.feedback.subtitle')}
              </Text>
            </View>

            {/* Next-move momentum card (library sessions only) */}
            {nextMove && (
              <Pressable
                onPress={handleNextMove}
                accessibilityRole="button"
                accessibilityLabel={`${t('library.nextMove.start')}: ${localizedName(nextMove, toLibraryLocale(language))}`}
                style={[
                  styles.nextMoveCard,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(25, 25, 35, 0.9)'
                      : 'rgba(0, 0, 0, 0.04)',
                    borderColor: `${exercise.color}45`,
                  },
                ]}
              >
                <View style={styles.nextMoveThumbWrap}>
                  {getLibraryMedia(nextMove) ? (
                    <Image
                      source={getLibraryMedia(nextMove)?.thumb}
                      style={styles.nextMoveThumb}
                      contentFit="cover"
                      accessibilityIgnoresInvertColors
                    />
                  ) : (
                    <Text style={styles.nextMoveEmoji}>{exercise.icon}</Text>
                  )}
                </View>
                <View style={styles.nextMoveInfo}>
                  <Text style={[styles.nextMoveLabel, { color: theme.text.muted }]}>
                    {t('library.nextMove.subtitle')}
                  </Text>
                  <Text
                    style={[styles.nextMoveName, { color: theme.text.primary }]}
                    numberOfLines={1}
                  >
                    {localizedName(nextMove, toLibraryLocale(language))}
                  </Text>
                </View>
                <View style={[styles.nextMovePlay, { backgroundColor: exercise.color }]}>
                  <Ionicons name="play" size={14} color="#000000" />
                </View>
              </Pressable>
            )}

            {/* Done Button */}
            <Pressable
              style={[styles.doneButton, { backgroundColor: exercise.color }]}
              onPress={handleFinish}
              accessibilityRole="button"
              accessibilityLabel={t('common.continue')}
            >
              <Text style={styles.doneButtonText}>{t('common.continue')}</Text>
            </Pressable>
          </Animated.View>
        );

      default:
        return null;
    }
  }, [
    state,
    progress,
    stats,
    actions,
    handleClose,
    handleFinish,
    handleNextMove,
    language,
    nextMove,
    renderExerciseAnimation,
    t,
    theme,
    completedMissionFeedback,
  ]);

  // Ambient background color based on exercise
  const ambientColor = state.exercise?.color || '#06FFA5';

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Background gradient */}
      <LinearGradient
        colors={theme.isDark ? ['#000000', '#0a0a15', '#000000'] : ['#F8F9FA', '#FFFFFF', '#F8F9FA']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={[styles.ambientGlow, { backgroundColor: ambientColor }]} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Header - only show during active session */}
        {state.exercise &&
          state.phase !== 'completion' &&
          state.phase !== 'feedback' && (
            <View style={styles.headerWrapper}>
              <BreakHeader
              title={state.exercise.title}
              icon={state.exercise.icon}
              color={state.exercise.color}
              timeRemaining={state.timeRemaining}
              isPaused={state.isPaused}
              onClose={handleClose}
              onToggleVoice={actions.toggleVoice}
              isVoiceEnabled={state.isVoiceEnabled}
            />
            </View>
          )}

        {/* Main Content */}
        <View style={styles.content}>{renderContent()}</View>
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
    top: -200,
    left: '50%',
    marginLeft: -250,
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.08,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerWrapper: {
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  preparationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preparationTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 32,
  },
  preparationIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  preparationIcon: {
    fontSize: 80,
  },
  preparationExercise: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  preparationCountdown: {
    fontSize: 64,
    fontWeight: '200',
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 32,
    opacity: 0.7,
  },
  exerciseContainer: {
    flex: 1,
  },
  animationContainer: {
    flex: 1,
  },
  completionContainer: {
    flex: 1,
  },
  doneButton: {
    marginTop: 'auto',
    marginBottom: 20,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  feedbackComplete: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextMoveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  nextMoveThumbWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nextMoveThumb: {
    width: 42,
    height: 42,
  },
  nextMoveEmoji: {
    fontSize: 22,
  },
  nextMoveInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  nextMoveLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  nextMoveName: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  nextMovePlay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackCompleteEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  feedbackCompleteTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  feedbackCompleteText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default function BreakSessionWithErrorBoundary() {
  // Keyed by break id so chained navigation (post-session "next move"
  // replace) remounts the whole session state machine instead of leaking
  // completion state into the new exercise.
  const { breakId } = useLocalSearchParams<{ breakId?: string | string[] }>();
  const resolvedBreakId = resolveBreakSessionBreakId(breakId);
  return (
    <ScreenErrorBoundary screenName="BreakSession">
      <BreakSessionScreen key={resolvedBreakId} />
    </ScreenErrorBoundary>
  );
}
