/**
 * Active Exercise Animation
 * Timer with motivational prompts for walking/active breaks
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AnimationType } from '@/data/exercises';
import { useTheme } from '@/hooks/useTheme';

const MOTIVATIONAL_MESSAGES = [
  'Keep going!',
  'You got this!',
  'Great pace!',
  'Stay strong!',
  'Almost there!',
  'Feeling good?',
  'Energy boost!',
  'Keep moving!',
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
  visualGuide,
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
        // Walking bounce animation
        bounceY.value = withRepeat(
          withSequence(
            withTiming(-10, { duration, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration, easing: Easing.in(Easing.quad) })
          ),
          -1
        );
        // Subtle side-to-side movement
        walkingX.value = withRepeat(
          withSequence(
            withTiming(5, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-5, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1
        );
        break;

      case 'active':
        // Energetic pulse
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
        // Gentle pulse for rest/other
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
  }, [animation]);

  const animatedStyle = useAnimatedStyle(() => ({
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
      {/* Main visual */}
      <Animated.View style={[styles.visualContainer, animatedStyle]}>
        <View style={[styles.iconCircle, { borderColor: color }]}>
          <LinearGradient
            colors={[`${color}40`, `${color}10`]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.emoji}>{visualGuide}</Text>
        </View>
      </Animated.View>

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timer, { color }]}>{formatTime(timeRemaining)}</Text>
        <Text style={[styles.timerLabel, { color: theme.text.muted }]}>remaining</Text>
      </View>

      {/* Motivational message */}
      {(isWalking || isActive) && (
        <View style={[styles.motivationBadge, { backgroundColor: `${color}20` }]}>
          <Ionicons name="sparkles" size={16} color={color} />
          <Text style={[styles.motivationText, { color }]}>
            {MOTIVATIONAL_MESSAGES[motivationIndex]}
          </Text>
        </View>
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
  }, []);

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
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 60,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timer: {
    fontSize: 48,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: -4,
  },
  motivationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  motivationText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  instruction: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
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
