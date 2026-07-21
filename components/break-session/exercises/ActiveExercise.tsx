/**
 * Active Exercise Animation — editorial. A bouncing mark for movement rhythm,
 * a big mono countdown as the hero, and quiet rotating encouragement. No
 * emoji / gradient circle / badge pill.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { AnimationType } from '@/data/exercises';
import { useTheme } from '@/hooks/useTheme';

const MOTIVATIONAL_MESSAGES = [
  'Keep going',
  'You got this',
  'Great pace',
  'Stay strong',
  'Almost there',
  'Feeling good?',
  'Energy boost',
  'Keep moving',
];

interface ActiveExerciseProps {
  animation: AnimationType;
  instruction: string;
  color: string;
  visualGuide: string;
  timeRemaining: number;
}

export default function ActiveExercise({
  animation,
  instruction,
  color,
  timeRemaining,
}: ActiveExerciseProps) {
  const theme = useTheme();
  const [motivationIndex, setMotivationIndex] = useState(0);
  const bounceY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const walkingX = useSharedValue(0);

  // Rotate motivational messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationIndex((prev) => (prev + 1) % MOTIVATIONAL_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const duration = 500;

    switch (animation) {
      case 'walk':
        bounceY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration, easing: Easing.in(Easing.quad) })
          ),
          -1
        );
        walkingX.value = withRepeat(
          withSequence(
            withTiming(5, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-5, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1
        );
        break;

      case 'active':
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 300, easing: Easing.out(Easing.quad) }),
            withTiming(1, { duration: 300, easing: Easing.in(Easing.quad) })
          ),
          -1
        );
        bounceY.value = withRepeat(
          withSequence(
            withTiming(-15, { duration: 300, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })
          ),
          -1
        );
        break;

      default:
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
    }
  }, [animation, bounceY, pulseScale, walkingX]);

  const markStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounceY.value },
      { translateX: walkingX.value },
      { scale: pulseScale.value },
    ],
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWalking = animation === 'walk';
  const isActive = animation === 'active';

  return (
    <View style={styles.container}>
      {/* Bouncing rhythm mark */}
      <View style={styles.markStage}>
        <Animated.View style={[styles.mark, { backgroundColor: color, shadowColor: color }, markStyle]} />
        <View style={[styles.markBase, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
      </View>

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timer, { color }]}>{formatTime(timeRemaining)}</Text>
        <Text style={[styles.timerLabel, { color: theme.text.muted }]}>REMAINING</Text>
      </View>

      {/* Motivational message */}
      {(isWalking || isActive) && (
        <Text style={[styles.motivationText, { color }]}>
          {MOTIVATIONAL_MESSAGES[motivationIndex]}
        </Text>
      )}

      {/* Instruction */}
      <Text style={[styles.instruction, { color: theme.text.secondary }]}>{instruction}</Text>

      {/* Activity indicator dots */}
      {(isWalking || isActive) && (
        <View style={styles.activityDots}>
          {[0, 1, 2].map((i) => (
            <ActivityDot key={i} color={color} />
          ))}
        </View>
      )}
    </View>
  );
}

function ActivityDot({ color }: { color: string }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      ),
      -1
    );
  }, [opacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.activityDot, { backgroundColor: color }, dotStyle]} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  markStage: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 5,
  },
  markBase: {
    width: 64,
    height: 10,
    borderRadius: 5,
    marginTop: 12,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 60,
    letterSpacing: -2,
  },
  timerLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.6,
    marginTop: 2,
  },
  motivationText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    letterSpacing: -0.2,
    marginBottom: 18,
  },
  instruction: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  activityDots: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
