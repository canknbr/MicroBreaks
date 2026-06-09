/**
 * Break Session Screen
 * Full-screen immersive break execution experience
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, ReduceMotion } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useBreakSession } from '@/hooks/useBreakSession';
import { useAchievements } from '@/hooks/useAchievements';
import { useEffectiveTier } from '@/hooks/useEffectiveTier';
import { requiresUpgradeForExercise } from '@/services/subscription/exerciseAccess';
import { saveCompletedBreak, getTodayBreaks, getUserStats } from '@/services/breakHistory';
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
} from '@/components/break-session';
import { AnimationType } from '@/data/exercises';
import { ScreenErrorBoundary } from '@/components/error';
import { resolveBreakSessionBreakId } from '@/features/break-session/sessionParams';
import { useBreakLiveActivity } from '@/services/widgets/liveActivity';

function BreakSessionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
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
  useEffect(() => {
    if (!needsUpgrade) return;
    router.replace(
      ({
        pathname: '/subscription',
        params: { placement: 'breaks' },
      } as never)
    );
  }, [needsUpgrade, router]);

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

  // Track if we've already saved this session
  const savedRef = useRef(false);
  const previousLevelRef = useRef(currentLevel);

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
    renderExerciseAnimation,
    t,
    theme,
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
  return (
    <ScreenErrorBoundary screenName="BreakSession">
      <BreakSessionScreen />
    </ScreenErrorBoundary>
  );
}
