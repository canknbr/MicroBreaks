/**
 * Countdown Timer Component
 * Next break countdown with pulse animation
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface CountdownTimerProps {
  targetMinutes: number; // Minutes until next break
  onComplete?: () => void;
}

function CountdownTimer({
  targetMinutes,
  onComplete,
}: CountdownTimerProps) {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(targetMinutes * 60);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const onCompleteRef = useRef(onComplete);

  // Keep ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const progress = ((targetMinutes * 60 - timeLeft) / (targetMinutes * 60)) * 100;
  const isUrgent = timeLeft < 60; // Less than 1 minute

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetMinutes]);

  useEffect(() => {
    // Pulse animation - more urgent when time is low
    const duration = isUrgent ? 500 : 1500;
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(isUrgent ? 1.05 : 1.02, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(isUrgent ? 0.6 : 0.4, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [glowOpacity, isUrgent, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
        backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: theme.isDark ? 0 : 0.1,
        shadowRadius: 12,
        elevation: theme.isDark ? 0 : 5,
      },
      pulseStyle,
    ]}>
      {/* Background - BlurView only for dark mode */}
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
        )
      )}

      {/* Glow effect - only for dark mode */}
      {theme.isDark && (
        <Animated.View
          style={[
            styles.glow,
            { backgroundColor: isUrgent ? '#FFD166' : '#06FFA5' },
            glowStyle,
          ]}
        />
      )}

      {/* Top highlight - only for dark mode */}
      {theme.isDark && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'transparent']}
          style={styles.highlight}
        />
      )}

      {/* Content */}
      <View
        style={styles.content}
        accessible
        accessibilityRole="timer"
        accessibilityLiveRegion="polite"
        accessibilityLabel={`Next break in ${Math.floor(timeLeft / 60)} minutes ${timeLeft % 60} seconds${isUrgent ? ', less than a minute remaining' : ''}`}
      >
        <View style={styles.header}>
          <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
            {isUrgent ? '⚡' : '⏱️'}
          </Text>
          <Text style={[styles.label, { color: theme.text.secondary }]}>Next break in</Text>
        </View>

        <Text
          style={[styles.time, { color: theme.text.primary }, isUrgent && { color: theme.accent.warning }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {formatTime(timeLeft)}
        </Text>

        {/* Progress bar */}
        <View style={styles.progressContainer} importantForAccessibility="no">
          <View style={[styles.progressTrack, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border.medium }]}>
            <LinearGradient
              colors={isUrgent ? ['#FFD166', '#FF9F1C'] : [theme.accent.primary, theme.accent.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.text.muted }]}>{Math.round(progress)}%</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default React.memo(CountdownTimer);

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
    borderRadius: 20,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  time: {
    fontSize: 42,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
});
