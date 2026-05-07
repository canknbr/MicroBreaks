/**
 * Break Feedback Component
 * Rating selection for break experience
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export type FeedbackRating = 'good' | 'neutral' | 'bad';

interface BreakFeedbackProps {
  onSubmit: (_rating: FeedbackRating) => void;
  selectedRating: FeedbackRating | null;
  color: string;
}

const FEEDBACK_OPTIONS: { rating: FeedbackRating; emoji: string; label: string }[] = [
  { rating: 'good', emoji: '😊', label: 'Helpful' },
  { rating: 'neutral', emoji: '😐', label: 'Okay' },
  { rating: 'bad', emoji: '😟', label: 'Not helpful' },
];

export default function BreakFeedback({
  onSubmit,
  selectedRating,
  color,
}: BreakFeedbackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How did that feel?</Text>
      <Text style={styles.subtitle}>Your feedback helps us improve</Text>

      <View style={styles.options}>
        {FEEDBACK_OPTIONS.map((option) => (
          <FeedbackButton
            key={option.rating}
            {...option}
            isSelected={selectedRating === option.rating}
            onPress={() => onSubmit(option.rating)}
            color={color}
          />
        ))}
      </View>
    </View>
  );
}

function FeedbackButton({
  emoji,
  label,
  isSelected,
  onPress,
  color,
}: {
  emoji: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          styles.button,
          isSelected && { borderColor: color, backgroundColor: `${color}20` },
          animatedStyle,
        ]}
      >
        {Platform.OS === 'ios' && !isSelected ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : !isSelected ? (
          <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
        ) : null}
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, isSelected && { color }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 32,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    width: 100,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
  },
  androidFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
    borderRadius: 16,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
