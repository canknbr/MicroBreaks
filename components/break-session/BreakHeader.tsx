/**
 * Break Header Component
 * Title, timer, and close button for break session
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface BreakHeaderProps {
  title: string;
  icon: string;
  color: string;
  timeRemaining: number;
  isPaused: boolean;
  onClose: () => void;
  onToggleVoice: () => void;
  isVoiceEnabled: boolean;
}

export default function BreakHeader({
  title,
  icon,
  color,
  timeRemaining,
  isPaused,
  onClose,
  onToggleVoice,
  isVoiceEnabled,
}: BreakHeaderProps) {
  const pulseScale = useSharedValue(1);

  // Pulse animation when not paused
  React.useEffect(() => {
    if (!isPaused) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isPaused, pulseScale]);

  const timerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const handleToggleVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleVoice();
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Close Button */}
        <Pressable
          style={styles.closeButton}
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="End session"
          accessibilityHint="Ends the current break session"
        >
          <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.7)" />
        </Pressable>

        {/* Title Section */}
        <View
          style={styles.titleSection}
          accessibilityRole="header"
          accessibilityLabel={title}
        >
          <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
            {icon}
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Timer */}
        <Animated.View
          style={[styles.timerContainer, timerStyle]}
          accessibilityLiveRegion="polite"
          accessibilityLabel={
            isPaused
              ? `Timer paused at ${formatTime(timeRemaining)}`
              : `Time remaining ${Math.floor(timeRemaining / 60)} minutes ${timeRemaining % 60} seconds`
          }
        >
          <Text style={[styles.timer, { color }]}>{formatTime(timeRemaining)}</Text>
          {isPaused && (
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedText}>PAUSED</Text>
            </View>
          )}
        </Animated.View>

        {/* Voice Toggle */}
        <Pressable
          style={[styles.voiceButton, !isVoiceEnabled && styles.voiceButtonDisabled]}
          onPress={handleToggleVoice}
          accessibilityRole="button"
          accessibilityLabel={isVoiceEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
          accessibilityState={{ selected: isVoiceEnabled }}
        >
          <Ionicons
            name={isVoiceEnabled ? 'volume-high' : 'volume-mute'}
            size={20}
            color={isVoiceEnabled ? color : 'rgba(255, 255, 255, 0.4)'}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  androidFallback: {
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timerContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timer: {
    fontSize: 24,
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
  pausedBadge: {
    position: 'absolute',
    bottom: -14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pausedText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
