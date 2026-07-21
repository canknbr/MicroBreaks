/**
 * Break Session Screen
 * Full-screen immersive break execution experience
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
            <Text style={styles.prepEyebrow}>{t('breakSession.preparation.title')}</Text>
            <Text style={[styles.prepTitle, { color: theme.text.primary }]}>{exercise.title}</Text>
            <Text style={[styles.prepCountdown, { color: exercise.color }]}>
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
              style={styles.doneButton}
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
              <Text style={styles.fbDoneEyebrow}>
                {t('breakSession.feedback.thankYou', { defaultValue: 'Thank you' })}
              </Text>
              <Text style={[styles.fbDoneTitle, { color: theme.text.primary }]}>
                {t('breakSession.feedback.subtitle')}
              </Text>
            </View>

            {/* Next-move momentum card (library sessions only) */}
            {nextMove && (
              <Pressable
                onPress={handleNextMove}
                accessibilityRole="button"
                accessibilityLabel={`${t('library.nextMove.start')}: ${localizedName(nextMove, toLibraryLocale(language))}`}
                style={styles.nextMoveRow}
              >
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
                <Text style={[styles.nextMoveArrow, { color: exercise.color }]}>→</Text>
              </Pressable>
            )}

            {/* Done Button */}
            <Pressable
              style={styles.doneButton}
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
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
    backgroundColor: '#0B0A0D',
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
    justifyContent: 'center',
  },
  prepEyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 18,
  },
  prepTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 4,
  },
  prepCountdown: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 104,
    letterSpacing: -4,
  },
  disclaimerText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 24,
    maxWidth: 300,
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
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  doneButtonText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    color: '#0B0A0D',
  },
  feedbackComplete: {
    flex: 1,
    justifyContent: 'center',
  },
  fbDoneEyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 16,
  },
  fbDoneTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1,
  },
  nextMoveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    marginBottom: 8,
  },
  nextMoveInfo: {
    flex: 1,
  },
  nextMoveLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  nextMoveName: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
    marginTop: 4,
  },
  nextMoveArrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 24,
    marginLeft: 12,
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
