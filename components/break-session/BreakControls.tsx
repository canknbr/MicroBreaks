/**
 * Break Controls Component
 * Pause, skip step, and end session buttons
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useTranslation } from '@/i18n/hooks';
import { usePressScale } from '@/hooks/usePressScale';
import { useHapticChoreography } from '@/hooks/useHapticChoreography';

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
  const { t } = useTranslation();
  const { tapBack } = useHapticChoreography();
  // Slightly deeper press scale than the global default so the in-session
  // controls feel weighty — these are the most intentional taps in the app.
  const pausePress = usePressScale({ pressedScale: 0.9 });
  const skipPress = usePressScale({ pressedScale: 0.9 });
  const endPress = usePressScale({ pressedScale: 0.9 });

  const handlePauseToggle = () => {
    tapBack();
    if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  };

  const handleSkip = () => {
    tapBack();
    onSkip();
  };

  const handleEnd = () => {
    tapBack();
    onEnd();
  };

  return (
    <View style={styles.container} accessibilityRole="toolbar" accessibilityLabel={t('breakSession.controls.end')}>
      {/* End Button */}
      <Animated.View style={endPress.style}>
        <Pressable
          {...endPress.handlers}
          onPress={handleEnd}
          accessibilityRole="button"
          accessibilityLabel={t('breakSession.controls.end')}
          accessibilityHint="Ends the current exercise session and returns to home"
        >
          <View style={styles.secondaryButton}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
            )}
            <Ionicons name="stop" size={20} color="rgba(255, 255, 255, 0.85)" />
            <Text style={styles.secondaryButtonText}>{t('breakSession.controls.end').replace(' Session', '')}</Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Pause/Resume Button (Main) */}
      <Animated.View style={pausePress.style}>
        <Pressable
          {...pausePress.handlers}
          onPress={handlePauseToggle}
          accessibilityRole="button"
          accessibilityLabel={isPaused ? t('breakSession.controls.resume') : t('breakSession.controls.pause')}
          accessibilityHint={isPaused ? "Resumes the exercise" : "Pauses the current exercise"}
          accessibilityState={{ expanded: !isPaused }}
        >
          <View style={[styles.mainButton, { backgroundColor: color }]}>
            <Ionicons
              name={isPaused ? 'play' : 'pause'}
              size={32}
              color="#000"
            />
          </View>
        </Pressable>
      </Animated.View>

      {/* Skip Button */}
      <Animated.View style={skipPress.style}>
        <Pressable
          {...skipPress.handlers}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel={t('breakSession.controls.skip')}
          accessibilityHint="Skips to the next step in the exercise"
        >
          <View style={styles.secondaryButton}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
            )}
            <Ionicons name="play-skip-forward" size={20} color="rgba(255, 255, 255, 0.85)" />
            <Text style={styles.secondaryButtonText}>{t('breakSession.controls.skip')}</Text>
          </View>
        </Pressable>
      </Animated.View>
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
    color: 'rgba(255, 255, 255, 0.85)', // WCAG AA compliant
    marginTop: 2,
  },
});
