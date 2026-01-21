/**
 * Break Session Hook
 * Manages the complete break session state machine
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Exercise, ExerciseStep, getExerciseById } from '@/data/exercises';
import { useVoiceGuidance } from './useVoiceGuidance';
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

export interface SessionState {
  phase: SessionPhase;
  exercise: Exercise | null;
  currentStepIndex: number;
  currentStep: ExerciseStep | null;
  timeRemaining: number;
  totalTimeElapsed: number;
  isPaused: boolean;
  isVoiceEnabled: boolean;
  feedbackRating: FeedbackRating | null;
}

export interface SessionActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  skipStep: () => void;
  endSession: () => void;
  toggleVoice: () => void;
  submitFeedback: (rating: FeedbackRating) => void;
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
  const { speak, stop: stopSpeech } = useVoiceGuidance();

  // Core state
  const [phase, setPhase] = useState<SessionPhase>('loading');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRating | null>(null);

  // Refs for timer management
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false); // Prevent race conditions during phase transitions

  // Load exercise
  const exercise = useMemo(() => getExerciseById(breakId) || null, [breakId]);
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

  // Speak helper
  const speakInstruction = useCallback(
    (text: string) => {
      if (isVoiceEnabled) {
        speak(text);
      }
    },
    [isVoiceEnabled, speak]
  );

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
          speakInstruction(currentStep.voiceInstruction || currentStep.instruction);
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
          speakInstruction('Great job! You completed the exercise.');
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
          speakInstruction(nextStepData.voiceInstruction || nextStepData.instruction);
        }
        isTransitioningRef.current = false;
        break;

      default:
        isTransitioningRef.current = false;
        break;
    }
  }, [phase, exercise, currentStep, currentStepIndex, clearTimer, speakInstruction]);

  // Timer effect
  useEffect(() => {
    if (isPaused || phase === 'loading' || phase === 'completion' || phase === 'feedback') {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          moveToNextPhase();
          return 0;
        }
        return prev - 1;
      });
      setTotalTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearTimer();
  }, [phase, isPaused, moveToNextPhase, clearTimer]);

  // Initialize session when exercise loads
  useEffect(() => {
    if (exercise && phase === 'loading') {
      setPhase('preparation');
      setTimeRemaining(PREPARATION_DURATION);
      startTimeRef.current = Date.now();
      speakInstruction(`Get ready for ${exercise.title}`);
    }
  }, [exercise, phase, speakInstruction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopSpeech();
    };
  }, [clearTimer, stopSpeech]);

  // Actions
  const start = useCallback(() => {
    if (phase === 'loading' && exercise) {
      setPhase('preparation');
      setTimeRemaining(PREPARATION_DURATION);
      speakInstruction(`Get ready for ${exercise.title}`);
    }
  }, [phase, exercise, speakInstruction]);

  const pause = useCallback(() => {
    setIsPaused(true);
    stopSpeech();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [stopSpeech]);

  const resume = useCallback(() => {
    setIsPaused(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const skipStep = useCallback(() => {
    // Prevent race condition with timer-based transitions
    if (!exercise || phase === 'completion' || phase === 'feedback' || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    clearTimer();
    stopSpeech();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStepIndex < exercise.steps.length - 1) {
      const newStepIndex = currentStepIndex + 1;
      const nextStepToPlay = exercise.steps[newStepIndex];
      setCurrentStepIndex(newStepIndex);
      setPhase('instruction');
      setTimeRemaining(INSTRUCTION_DURATION);
      if (nextStepToPlay) {
        speakInstruction(nextStepToPlay.voiceInstruction || nextStepToPlay.instruction);
      }
    } else {
      setPhase('completion');
      speakInstruction('Exercise complete!');
    }
    isTransitioningRef.current = false;
  }, [exercise, phase, currentStepIndex, clearTimer, stopSpeech, speakInstruction]);

  const endSession = useCallback(() => {
    clearTimer();
    stopSpeech();
    setPhase('completion');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [clearTimer, stopSpeech]);

  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled((prev) => {
      if (prev) {
        stopSpeech();
      }
      return !prev;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [stopSpeech]);

  const submitFeedback = useCallback((rating: FeedbackRating) => {
    setFeedbackRating(rating);
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
    isVoiceEnabled,
    feedbackRating,
  };

  const actions: SessionActions = {
    start,
    pause,
    resume,
    skipStep,
    endSession,
    toggleVoice,
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
