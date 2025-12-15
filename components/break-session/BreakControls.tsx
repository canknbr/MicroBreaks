/**
 * Break Controls Component
 * Pause, skip step, and end session buttons
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface BreakControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onEnd: () => void;
  color: string;
}

export default function BreakControls({
  isPaused,
  onPause,
  onResume,
  onSkip,
  onEnd,
  color,
}: BreakControlsProps) {
  const pauseScale = useSharedValue(1);
  const skipScale = useSharedValue(1);
  const endScale = useSharedValue(1);

  const createPressHandlers = (
    scale: SharedValue<number>,
    onPress: () => void
  ) => ({
    onPressIn: () => {
      scale.value = withSpring(0.9);
    },
    onPressOut: () => {
      scale.value = withSpring(1);
    },
    onPress: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    },
  });

  const pauseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pauseScale.value }],
  }));

  const skipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: skipScale.value }],
  }));

  const endStyle = useAnimatedStyle(() => ({
    transform: [{ scale: endScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* End Button */}
      <Pressable {...createPressHandlers(endScale, onEnd)}>
        <Animated.View style={[styles.secondaryButton, endStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
          )}
          <Ionicons name="stop" size={20} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.secondaryButtonText}>End</Text>
        </Animated.View>
      </Pressable>

      {/* Pause/Resume Button (Main) */}
      <Pressable {...createPressHandlers(pauseScale, isPaused ? onResume : onPause)}>
        <Animated.View style={[styles.mainButton, { backgroundColor: color }, pauseStyle]}>
          <Ionicons
            name={isPaused ? 'play' : 'pause'}
            size={32}
            color="#000"
          />
        </Animated.View>
      </Pressable>

      {/* Skip Button */}
      <Pressable {...createPressHandlers(skipScale, onSkip)}>
        <Animated.View style={[styles.secondaryButton, skipStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
          )}
          <Ionicons name="play-skip-forward" size={20} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 20,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidFallback: {
    backgroundColor: 'rgba(30, 30, 40, 0.9)',
    borderRadius: 30,
  },
  secondaryButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
});
