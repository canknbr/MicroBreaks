/**
 * TimerWidget Component
 * Large timer display for the home screen with controls
 */

import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useTimer } from '@/hooks/useTimer';
import { Spacing } from '@/theme';

interface TimerWidgetProps {
  onPresetPress: () => void;
}

function TimerWidget({ onPresetPress }: TimerWidgetProps) {
  const theme = useTheme();
  const {
    session,
    formattedTime,
    progress,
    phaseColor,
    phaseIcon,
    phaseLabel,
    activePreset,
    start,
    pause,
    resume,
    skip,
    reset,
  } = useTimer();

  // Pulse animation when active
  const pulseScale = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (session.isActive && !session.isPaused) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [pulseScale, session.isActive, session.isPaused]);

  useEffect(() => {
    progressWidth.value = withTiming(progress, { duration: 900 });
  }, [progress, progressWidth]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as `${number}%`,
  }));

  const handleMainButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!session.isActive) {
      start();
    } else if (session.isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    skip();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset();
  };

  const mainButtonIcon = !session.isActive ? 'play' : session.isPaused ? 'play' : 'pause';
  const mainButtonLabel = !session.isActive ? 'Start Focus' : session.isPaused ? 'Resume' : 'Pause';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: theme.isDark ? 0 : 0.1,
          shadowRadius: 12,
          elevation: theme.isDark ? 0 : 5,
        },
        pulseStyle,
      ]}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`${phaseLabel} timer: ${formattedTime} remaining. Session ${session.currentSession}. ${session.isActive ? (session.isPaused ? 'Paused' : 'Running') : 'Stopped'}`}
    >
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
        )
      )}

      {/* Phase indicator + preset selector */}
      <View style={styles.headerRow}>
        <View style={styles.phaseInfo}>
          <Text style={styles.phaseIcon}>{phaseIcon}</Text>
          <Text style={[styles.phaseLabel, { color: phaseColor }]}>{phaseLabel}</Text>
          <Text style={[styles.sessionCount, { color: theme.text.muted }]}>
            #{session.currentSession}
          </Text>
        </View>
        <Pressable
          style={[styles.presetButton, { backgroundColor: `${phaseColor}20` }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPresetPress();
          }}
          accessibilityRole="button"
          accessibilityLabel={`Current preset: ${activePreset.name}. Tap to change`}
        >
          <Text style={styles.presetEmoji}>{activePreset.icon}</Text>
          <Text style={[styles.presetName, { color: phaseColor }]}>{activePreset.name}</Text>
        </Pressable>
      </View>

      {/* Timer display */}
      <Pressable onPress={handleMainButton} style={styles.timerDisplay}>
        <Text style={[styles.timerText, { color: theme.text.primary }]}>
          {formattedTime}
        </Text>
      </Pressable>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.border.subtle }]}>
        <Animated.View style={[styles.progressFill, { backgroundColor: phaseColor }, progressStyle]} />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {session.isActive && (
          <Pressable
            style={[styles.controlButton, { backgroundColor: 'rgba(255,107,107,0.15)' }]}
            onPress={handleReset}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
          >
            <Ionicons name="refresh" size={20} color="#FF6B6B" />
          </Pressable>
        )}

        <Pressable
          style={[styles.mainButton, { backgroundColor: phaseColor }]}
          onPress={handleMainButton}
          accessibilityRole="button"
          accessibilityLabel={mainButtonLabel}
        >
          <Ionicons name={mainButtonIcon} size={28} color="#000" />
        </Pressable>

        {session.isActive && (
          <Pressable
            style={[styles.controlButton, { backgroundColor: `${phaseColor}20` }]}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip to next phase"
          >
            <Ionicons name="play-skip-forward" size={20} color={phaseColor} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  phaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phaseIcon: {
    fontSize: 18,
  },
  phaseLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  sessionCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  presetEmoji: {
    fontSize: 14,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '600',
  },
  timerDisplay: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '200',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default memo(TimerWidget);
