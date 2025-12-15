/**
 * Break Session Screen
 * Full-screen immersive break execution experience
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useBreakSession } from '@/hooks/useBreakSession';
import { saveCompletedBreak, getTodayBreaks, getUserStats } from '@/services/breakHistory';
import {
  scheduleBreakReminder,
  sendGoalCompletedNotification,
} from '@/services/notifications';
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

export default function BreakSessionScreen() {
  const router = useRouter();
  const { breakId } = useLocalSearchParams<{ breakId: string }>();

  const { state, actions, stats, progress } = useBreakSession(breakId || 'deep-breath');

  // Track if we've already saved this session
  const savedRef = useRef(false);

  // Save completed break to storage when session completes
  useEffect(() => {
    if (state.phase === 'completion' && state.exercise && !savedRef.current) {
      savedRef.current = true;

      const saveAndNotify = async () => {
        // Save the completed break
        await saveCompletedBreak({
          breakId: state.exercise!.id,
          title: state.exercise!.title,
          category: state.exercise!.category,
          icon: state.exercise!.icon,
          color: state.exercise!.color,
          duration: stats.totalDuration,
          stepsCompleted: stats.stepsCompleted,
          totalSteps: stats.totalSteps,
          xpEarned: stats.xpEarned,
          rating: state.feedbackRating,
          completedAt: new Date().toISOString(),
        });

        // Schedule next break reminder
        await scheduleBreakReminder();

        // Check if daily goal is complete
        const todayBreaks = await getTodayBreaks();
        const userStats = await getUserStats();
        const dailyGoal = Math.max(Math.round(userStats.weeklyGoal / 7), 3);

        if (todayBreaks.length === dailyGoal) {
          // Just completed daily goal
          await sendGoalCompletedNotification();
        }
      };

      saveAndNotify();
    }
  }, [state.phase, state.exercise, state.feedbackRating, stats]);

  // Update rating when feedback is submitted
  useEffect(() => {
    if (state.phase === 'feedback' && state.feedbackRating && state.exercise) {
      // Update the saved break with rating
      saveCompletedBreak({
        breakId: state.exercise.id,
        title: state.exercise.title,
        category: state.exercise.category,
        icon: state.exercise.icon,
        color: state.exercise.color,
        duration: stats.totalDuration,
        stepsCompleted: stats.stepsCompleted,
        totalSteps: stats.totalSteps,
        xpEarned: stats.xpEarned,
        rating: state.feedbackRating,
        completedAt: new Date().toISOString(),
      });
    }
  }, [state.phase, state.feedbackRating]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    actions.endSession();
  }, [actions]);

  const handleFinish = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (state.phase) {
      case 'loading':
        return (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Preparing...</Text>
          </View>
        );

      case 'preparation':
        return (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={styles.preparationContainer}
          >
            <Text style={styles.preparationTitle}>Get Ready</Text>
            <View style={[styles.preparationIconContainer, { borderColor: exercise.color }]}>
              <Text style={styles.preparationIcon}>{exercise.icon}</Text>
            </View>
            <Text style={styles.preparationExercise}>{exercise.title}</Text>
            <Text style={[styles.preparationCountdown, { color: exercise.color }]}>
              {state.timeRemaining}
            </Text>
          </Animated.View>
        );

      case 'instruction':
      case 'execution':
      case 'transition':
        return (
          <Animated.View
            entering={FadeIn.duration(300)}
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
            entering={FadeIn.duration(400)}
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
              color={exercise.color}
            />

            {/* Done Button */}
            <Pressable
              style={[styles.doneButton, { backgroundColor: exercise.color }]}
              onPress={handleFinish}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </Animated.View>
        );

      case 'feedback':
        return (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={styles.completionContainer}
          >
            <View style={styles.feedbackComplete}>
              <Text style={styles.feedbackCompleteEmoji}>🙏</Text>
              <Text style={styles.feedbackCompleteTitle}>Thank you!</Text>
              <Text style={styles.feedbackCompleteText}>
                Your feedback helps us improve
              </Text>
            </View>

            {/* Done Button */}
            <Pressable
              style={[styles.doneButton, { backgroundColor: exercise.color }]}
              onPress={handleFinish}
            >
              <Text style={styles.doneButtonText}>Continue</Text>
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
  ]);

  // Ambient background color based on exercise
  const ambientColor = state.exercise?.color || '#06FFA5';

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#000000', '#0a0a15', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow */}
      <View style={[styles.ambientGlow, { backgroundColor: ambientColor }]} />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        {/* Header - only show during active session */}
        {state.exercise &&
          state.phase !== 'completion' &&
          state.phase !== 'feedback' && (
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
