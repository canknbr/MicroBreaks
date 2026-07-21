/**
 * Break Controls — editorial. A single solid transport button (pause/resume)
 * flanked by plain icon+label controls. No blur circles / borders / shadows.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel={t('breakSession.controls.end')}
          accessibilityHint="Ends the current exercise session and returns to home"
        >
          <Ionicons name="stop" size={22} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.secondaryButtonText}>{t('breakSession.controls.end').replace(' Session', '')}</Text>
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
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel={t('breakSession.controls.skip')}
          accessibilityHint="Skips to the next step in the exercise"
        >
          <Ionicons name="play-skip-forward" size={22} color="rgba(255, 255, 255, 0.7)" />
          <Text style={styles.secondaryButtonText}>{t('breakSession.controls.skip')}</Text>
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
    gap: 36,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  secondaryButtonText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
