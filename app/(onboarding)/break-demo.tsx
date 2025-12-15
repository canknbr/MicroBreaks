/**
 * ONB_013: Live Break Demo
 * Premium zen design with animated exercise demo
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from './components/OnboardingLayout';
import SecondaryButton from './components/SecondaryButton';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';

type DemoPhase = 'preparation' | 'instruction' | 'execution' | 'feedback';

export default function BreakDemoScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<DemoPhase>('preparation');
  const [countdown, setCountdown] = useState(15);
  const [feedback, setFeedback] = useState<'good' | 'neutral' | 'bad' | null>(null);

  // Animation values
  const pulseScale = useSharedValue(1);
  const ringProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    // Pulse animation for preparation phase
    if (phase === 'preparation') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }

    // Phase transition helpers
    const goToInstruction = () => setPhase('instruction');
    const goToExecution = () => setPhase('execution');
    const goToFeedback = () => setPhase('feedback');

    // Phase timing
    const timers: number[] = [];
    timers.push(window.setTimeout(() => {
      contentOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(goToInstruction)();
        contentOpacity.value = withTiming(1, { duration: 300 });
      });
    }, 5000));
    timers.push(window.setTimeout(() => {
      contentOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(goToExecution)();
        contentOpacity.value = withTiming(1, { duration: 300 });
      });
    }, 10000));
    timers.push(window.setTimeout(() => {
      contentOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(goToFeedback)();
        contentOpacity.value = withTiming(1, { duration: 300 });
      });
    }, 25000));

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === 'execution') {
      ringProgress.value = withTiming(100, {
        duration: 15000,
        easing: Easing.linear,
      });
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'execution' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [phase, countdown]);

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleFeedback = (rating: 'good' | 'neutral' | 'bad') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFeedback(rating);
    setTimeout(() => {
      router.push('./value-display');
    }, 1000);
  };

  const handleSkip = () => {
    router.push('./value-display');
  };

  const renderContent = () => {
    switch (phase) {
      case 'preparation':
        return (
          <Animated.View style={[styles.phaseContent, contentAnimatedStyle]}>
            <Text style={styles.title}>Let's try a quick neck stretch</Text>
            <Text style={styles.subtitle}>Get ready...</Text>
            <Animated.View style={[styles.illustration, pulseAnimatedStyle]}>
              <LinearGradient
                colors={[ZenColors.primary.glow, 'transparent']}
                style={styles.illustrationGlow}
              />
              <Text style={styles.illustrationText}>🧘‍♀️</Text>
            </Animated.View>
          </Animated.View>
        );

      case 'instruction':
        return (
          <Animated.View style={[styles.phaseContent, contentAnimatedStyle]}>
            <Text style={styles.title}>Follow along</Text>
            <View style={styles.illustration}>
              <Text style={styles.illustrationText}>🔄</Text>
            </View>
            <Text style={styles.instruction}>
              Gently tilt your head to the right, bringing your ear toward your
              shoulder. Hold for 5 seconds.
            </Text>
          </Animated.View>
        );

      case 'execution':
        return (
          <Animated.View style={[styles.phaseContent, contentAnimatedStyle]}>
            <Text style={styles.title}>Keep going!</Text>
            <View style={styles.progressRing}>
              <LinearGradient
                colors={[ZenColors.primary.main, ZenColors.secondary.main]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ringGradient}
              />
              <View style={styles.ringInner}>
                <Text style={styles.countdown}>{countdown}</Text>
                <Text style={styles.countdownLabel}>seconds</Text>
              </View>
            </View>
            <Text style={styles.instruction}>
              Nice! Now switch to the other side...
            </Text>
          </Animated.View>
        );

      case 'feedback':
        return (
          <Animated.View style={[styles.phaseContent, contentAnimatedStyle]}>
            <Text style={styles.title}>Great job!</Text>
            <Text style={styles.subtitle}>How did that feel?</Text>
            <View style={styles.feedbackButtons}>
              <Pressable
                style={[
                  styles.feedbackButton,
                  feedback === 'good' && styles.feedbackButtonSelected,
                ]}
                onPress={() => handleFeedback('good')}>
                {Platform.OS === 'ios' ? (
                  <BlurView
                    intensity={feedback === 'good' ? 40 : 25}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
                )}
                <Text style={styles.feedbackEmoji}>😊</Text>
                <Text style={[styles.feedbackLabel, feedback === 'good' && styles.feedbackLabelSelected]}>Helpful</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.feedbackButton,
                  feedback === 'neutral' && styles.feedbackButtonSelected,
                ]}
                onPress={() => handleFeedback('neutral')}>
                {Platform.OS === 'ios' ? (
                  <BlurView
                    intensity={feedback === 'neutral' ? 40 : 25}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
                )}
                <Text style={styles.feedbackEmoji}>😐</Text>
                <Text style={[styles.feedbackLabel, feedback === 'neutral' && styles.feedbackLabelSelected]}>Okay</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.feedbackButton,
                  feedback === 'bad' && styles.feedbackButtonSelected,
                ]}
                onPress={() => handleFeedback('bad')}>
                {Platform.OS === 'ios' ? (
                  <BlurView
                    intensity={feedback === 'bad' ? 40 : 25}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
                )}
                <Text style={styles.feedbackEmoji}>😟</Text>
                <Text style={[styles.feedbackLabel, feedback === 'bad' && styles.feedbackLabelSelected]}>Not helpful</Text>
              </Pressable>
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <OnboardingLayout currentStep={13} showProgress={false} ambientColor="teal">
      <View style={styles.container}>
        {renderContent()}
        <View style={styles.spacer} />
        {phase !== 'feedback' && (
          <SecondaryButton title="Skip" onPress={handleSkip} variant="muted" />
        )}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: ZenSpacing.xl,
  },
  phaseContent: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...ZenTypography.headline.large,
    color: ZenColors.text.primary,
    textAlign: 'center',
    marginBottom: ZenSpacing.xs,
  },
  subtitle: {
    ...ZenTypography.body.large,
    color: ZenColors.text.secondary,
    textAlign: 'center',
    marginBottom: ZenSpacing.lg,
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: ZenSpacing.xl,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: ZenColors.background.card,
    overflow: 'hidden',
  },
  illustrationGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  illustrationText: {
    fontSize: 100,
  },
  instruction: {
    ...ZenTypography.body.large,
    color: ZenColors.text.primary,
    textAlign: 'center',
    paddingHorizontal: ZenSpacing.md,
    lineHeight: 28,
  },
  progressRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    padding: 6,
    marginVertical: ZenSpacing.xl,
  },
  ringGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 90,
  },
  ringInner: {
    flex: 1,
    backgroundColor: ZenColors.background.pure,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdown: {
    ...ZenTypography.display.large,
    color: ZenColors.primary.main,
  },
  countdownLabel: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: ZenSpacing.sm,
    marginTop: ZenSpacing.lg,
    paddingHorizontal: ZenSpacing.md,
  },
  feedbackButton: {
    flex: 1,
    alignItems: 'center',
    padding: ZenSpacing.md,
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    borderRadius: ZenRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  feedbackButtonSelected: {
    borderColor: 'rgba(6, 255, 165, 0.5)',
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
  },
  androidFallback: {
    backgroundColor: 'rgba(18, 18, 26, 0.92)',
    borderRadius: ZenRadius.lg,
  },
  feedbackEmoji: {
    fontSize: 40,
    marginBottom: ZenSpacing.xs,
  },
  feedbackLabel: {
    ...ZenTypography.label.medium,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  feedbackLabelSelected: {
    color: ZenColors.primary.main,
  },
  spacer: {
    flex: 1,
  },
});
