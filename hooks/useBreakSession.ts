/**
 * Break Session Hook
 * Manages the complete break session state machine
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Exercise, ExerciseStep, getExerciseById } from '@/data/exercises';
import { localizeExercise } from '@/data/exerciseLocalization';
import { toLibraryLocale } from '@/features/exercise-library/catalog';
import { useTranslation } from '@/i18n/hooks';
import {
  PREPARATION_DURATION,
  INSTRUCTION_DURATION,
  TRANSITION_DURATION,
  XP_PER_SECOND,
  XP_PER_STEP,
} from '@/constants/config';

export type SessionPhase =
  | 'loading'
  | 'preparation'
  | 'instruction'
  | 'execution'
  | 'transition'
  | 'completion'
  | 'feedback';

export type FeedbackRating = 'good' | 'neutral' | 'bad';
export type ReliefScore = 'worse' | 'same' | 'better' | 'much_better';

export interface SessionState {
  phase: SessionPhase;
  exercise: Exercise | null;
  currentStepIndex: number;
  currentStep: ExerciseStep | null;
  timeRemaining: number;
  totalTimeElapsed: number;
  isPaused: boolean;
  feedbackRating: FeedbackRating | null;
  feedbackReliefScore: ReliefScore | null;
}

export interface SessionActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  skipStep: () => void;
  endSession: () => void;
  submitFeedback: (rating: FeedbackRating, reliefScore: ReliefScore) => void;
}

export interface SessionStats {
  totalDuration: number;
  stepsCompleted: number;
  totalSteps: number;
  xpEarned: number;
}

interface UseBreakSessionReturn {
  state: SessionState;
  actions: SessionActions;
  stats: SessionStats;
  progress: number; // 0-100
}

// Phase durations are imported from constants/config.ts

export function useBreakSession(breakId: string): UseBreakSessionReturn {
  const { language } = useTranslation();
  // Core exercises get locale-appropriate title/description so the header,
  // completion screen, and saved history read in the UI language (library
  // sessions are fully locale-built).
  const exercise = useMemo(() => {
    const locale = toLibraryLocale(language);
    const resolved = getExerciseById(breakId, locale);
    return resolved ? localizeExercise(resolved, locale) : null;
  }, [breakId, language]);

  // Core state
  const [phase, setPhase] = useState<SessionPhase>('loading');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRating | null>(null);
  const [feedbackReliefScore, setFeedbackReliefScore] = useState<ReliefScore | null>(null);

  // Refs for timer management
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false); // Prevent race conditions during phase transitions

  const currentStep = useMemo(
    () => (exercise ? exercise.steps[currentStepIndex] || null : null),
    [exercise, currentStepIndex]
  );

  // Calculate progress
  const progress = useMemo(() => {
    if (!exercise) return 0;
    const completedSteps = currentStepIndex;
    const totalSteps = exercise.steps.length;
    const stepProgress = currentStep
      ? (currentStep.duration - timeRemaining) / currentStep.duration
      : 0;
    return ((completedSteps + stepProgress) / totalSteps) * 100;
  }, [exercise, currentStepIndex, currentStep, timeRemaining]);

  // Stats
  const stats: SessionStats = useMemo(() => {
    if (!exercise) {
      return { totalDuration: 0, stepsCompleted: 0, totalSteps: 0, xpEarned: 0 };
    }
    const stepsCompleted = phase === 'completion' || phase === 'feedback'
      ? exercise.steps.length
      : currentStepIndex;
    const xpEarned = Math.round(totalTimeElapsed * XP_PER_SECOND) + stepsCompleted * XP_PER_STEP;
    return {
      totalDuration: totalTimeElapsed,
      stepsCompleted,
      totalSteps: exercise.steps.length,
      xpEarned,
    };
  }, [exercise, currentStepIndex, totalTimeElapsed, phase]);

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Notification-style cue when a new step starts (replaces spoken guidance):
  // a distinct haptic so the user can follow along without watching the screen.
  const cueNextStep = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  // Move to next phase/step
  const moveToNextPhase = useCallback(() => {
    if (!exercise || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    clearTimer();

    switch (phase) {
      case 'preparation':
        setPhase('instruction');
        setTimeRemaining(INSTRUCTION_DURATION);
        if (currentStep) {
          cueNextStep();
        }
        isTransitioningRef.current = false;
        break;

      case 'instruction':
        setPhase('execution');
        if (currentStep) {
          setTimeRemaining(currentStep.duration);
        }
        isTransitioningRef.current = false;
        break;

      case 'execution':
        // Check if there are more steps
        if (currentStepIndex < exercise.steps.length - 1) {
          setPhase('transition');
          setTimeRemaining(TRANSITION_DURATION);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          // Exercise complete
          setPhase('completion');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        isTransitioningRef.current = false;
        break;

      case 'transition':
        const nextStepIndex = currentStepIndex + 1;
        const nextStepData = exercise.steps[nextStepIndex];
        setCurrentStepIndex(nextStepIndex);
        setPhase('instruction');
        setTimeRemaining(INSTRUCTION_DURATION);
        if (nextStepData) {
          cueNextStep();
        }
        isTransitioningRef.current = false;
        break;

      case 'loading':
      case 'completion':
      case 'feedback':
        // These phases don't transition via moveToNextPhase
        isTransitioningRef.current = false;
        break;
    }
  }, [phase, exercise, currentStep, currentStepIndex, clearTimer, cueNextStep]);

  // Keep a ref to the latest moveToNextPhase to avoid stale closure in setInterval
  const moveToNextPhaseRef = useRef(moveToNextPhase);
  moveToNextPhaseRef.current = moveToNextPhase;

  // Timer effect — gated by a per-interval cancellation flag so we cannot
  // double-count seconds when the user fires `skipStep` mid-tick or when
  // the natural phase transition fires from inside the setState callback
  // (C-BUG9).
  useEffect(() => {
    if (isPaused || phase === 'loading' || phase === 'completion' || phase === 'feedback') {
      return;
    }

    let cancelled = false;

    timerRef.current = setInterval(() => {
      if (cancelled) return;
      let advancedPhase = false;
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          advancedPhase = true;
          cancelled = true;
          moveToNextPhaseRef.current();
          return 0;
        }
        return prev - 1;
      });
      // Only credit a second of elapsed time if we did not just transition
      // to a new phase — otherwise the next phase's interval will start
      // accruing time on its own, and double-counting can drift the stats.
      if (!advancedPhase) {
        setTotalTimeElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, [phase, isPaused, clearTimer]);

  // Initialize session when exercise loads
  useEffect(() => {
    if (exercise && phase === 'loading') {
      setPhase('preparation');
      setTimeRemaining(PREPARATION_DURATION);
      startTimeRef.current = Date.now();
    }
  }, [exercise, phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // Actions
  const start = useCallback(() => {
    if (phase === 'loading' && exercise) {
      setPhase('preparation');
      setTimeRemaining(PREPARATION_DURATION);
    }
  }, [phase, exercise]);

  const pause = useCallback(() => {
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const skipStep = useCallback(() => {
    // Prevent race condition with timer-based transitions
    if (!exercise || phase === 'completion' || phase === 'feedback' || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    clearTimer();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStepIndex < exercise.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setPhase('instruction');
      setTimeRemaining(INSTRUCTION_DURATION);
    } else {
      setPhase('completion');
    }
    isTransitioningRef.current = false;
  }, [exercise, phase, currentStepIndex, clearTimer]);

  const endSession = useCallback(() => {
    clearTimer();
    setPhase('completion');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [clearTimer]);

  const submitFeedback = useCallback((rating: FeedbackRating, reliefScore: ReliefScore) => {
    setFeedbackRating(rating);
    setFeedbackReliefScore(reliefScore);
    setPhase('feedback');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Build state object
  const state: SessionState = {
    phase,
    exercise,
    currentStepIndex,
    currentStep,
    timeRemaining,
    totalTimeElapsed,
    isPaused,
    feedbackRating,
    feedbackReliefScore,
  };

  const actions: SessionActions = {
    start,
    pause,
    resume,
    skipStep,
    endSession,
    submitFeedback,
  };

  return {
    state,
    actions,
    stats,
    progress,
  };
}

export default useBreakSession;
