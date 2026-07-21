/**
 * Break Header — editorial. Close · title · mono timer · voice toggle in a
 * plain row. No blur pill / emoji icon / filled circle buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
    <View style={styles.content}>
      {/* Close Button */}
      <Pressable
        style={styles.iconButton}
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="End session"
        accessibilityHint="Ends the current break session"
        hitSlop={8}
      >
        <Ionicons name="close" size={26} color="rgba(255, 255, 255, 0.6)" />
      </Pressable>

      {/* Title Section */}
      <View
        style={styles.titleSection}
        accessibilityRole="header"
        accessibilityLabel={title}
      >
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
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
        {isPaused && <Text style={styles.pausedText}>PAUSED</Text>}
      </Animated.View>

      {/* Voice Toggle */}
      <Pressable
        style={styles.iconButton}
        onPress={handleToggleVoice}
        accessibilityRole="button"
        accessibilityLabel={isVoiceEnabled ? 'Disable voice guidance' : 'Enable voice guidance'}
        accessibilityState={{ selected: isVoiceEnabled }}
        hitSlop={8}
      >
        <Ionicons
          name={isVoiceEnabled ? 'volume-high' : 'volume-mute'}
          size={22}
          color={isVoiceEnabled ? color : 'rgba(255, 255, 255, 0.4)'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 17,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  timerContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  timer: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  pausedText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginTop: 1,
  },
});
