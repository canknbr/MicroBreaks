/**
 * ONB_013: Live Break Demo
 * Interactive exercise demonstration
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

type DemoPhase = 'preparation' | 'instruction' | 'execution' | 'feedback';

export default function BreakDemoScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<DemoPhase>('preparation');
  const [countdown, setCountdown] = useState(15);
  const [feedback, setFeedback] = useState<'good' | 'neutral' | 'bad' | null>(null);

  useEffect(() => {
    // Track analytics: onb_demo_started
    // console.log('[Analytics] onb_demo_started');

    // Phase timing
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => setPhase('instruction'), 5000)
    );
    timers.push(
      window.setTimeout(() => setPhase('execution'), 10000)
    );
    timers.push(
      window.setTimeout(() => setPhase('feedback'), 25000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase === 'execution' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, countdown]);

  const handleFeedback = (rating: 'good' | 'neutral' | 'bad') => {
    setFeedback(rating);
    // Track analytics: onb_demo_feedback
    // console.log('[Analytics] onb_demo_feedback:', rating);
    setTimeout(() => {
      // Track analytics: onb_demo_completed
      // console.log('[Analytics] onb_demo_completed');
      router.push('./value-display');
    }, 1000);
  };

  const handleSkip = () => {
    // Track analytics: onb_demo_skipped
    // console.log('[Analytics] onb_demo_skipped:', phase);
    router.push('./value-display');
  };

  const renderContent = () => {
    switch (phase) {
      case 'preparation':
        return (
          <>
            <Text style={styles.title}>Let's try a quick neck stretch</Text>
            <Text style={styles.subtitle}>Get ready...</Text>
            <View style={styles.illustration}>
              <Text style={styles.illustrationText}>🧘‍♀️</Text>
            </View>
          </>
        );

      case 'instruction':
        return (
          <>
            <Text style={styles.title}>Follow along</Text>
            <View style={styles.illustration}>
              <Text style={styles.illustrationText}>🔄</Text>
            </View>
            <Text style={styles.instruction}>
              Gently tilt your head to the right, bringing your ear toward your
              shoulder. Hold for 5 seconds.
            </Text>
          </>
        );

      case 'execution':
        return (
          <>
            <Text style={styles.title}>Keep going!</Text>
            <View style={styles.progressRing}>
              <Text style={styles.countdown}>{countdown}</Text>
              <Text style={styles.countdownLabel}>seconds</Text>
            </View>
            <Text style={styles.instruction}>
              Nice! Now switch to the other side...
            </Text>
          </>
        );

      case 'feedback':
        return (
          <>
            <Text style={styles.title}>Great job! 🎉</Text>
            <Text style={styles.subtitle}>How did that feel?</Text>
            <View style={styles.feedbackButtons}>
              <View
                style={[
                  styles.feedbackButton,
                  feedback === 'good' && styles.feedbackButtonSelected,
                ]}
                onTouchEnd={() => handleFeedback('good')}>
                <Text style={styles.feedbackEmoji}>😊</Text>
                <Text style={styles.feedbackLabel}>Helpful</Text>
              </View>
              <View
                style={[
                  styles.feedbackButton,
                  feedback === 'neutral' && styles.feedbackButtonSelected,
                ]}
                onTouchEnd={() => handleFeedback('neutral')}>
                <Text style={styles.feedbackEmoji}>😐</Text>
                <Text style={styles.feedbackLabel}>Okay</Text>
              </View>
              <View
                style={[
                  styles.feedbackButton,
                  feedback === 'bad' && styles.feedbackButtonSelected,
                ]}
                onTouchEnd={() => handleFeedback('bad')}>
                <Text style={styles.feedbackEmoji}>😟</Text>
                <Text style={styles.feedbackLabel}>Not helpful</Text>
              </View>
            </View>
          </>
        );
    }
  };

  return (
    <OnboardingLayout currentStep={13} showProgress={false}>
      <View style={styles.container}>
        {renderContent()}
        <View style={styles.spacer} />
        {phase !== 'feedback' && (
          <SecondaryButton title="Skip" onPress={handleSkip} />
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
    paddingVertical: Spacing.xl,
  },
  title: {
    ...Typography.headlineMedium,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  illustrationText: {
    fontSize: 120,
  },
  instruction: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.primary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 28,
  },
  progressRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.dark.background.secondary,
    borderWidth: 8,
    borderColor: Colors.dark.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  countdown: {
    ...Typography.displayLarge,
    color: Colors.dark.brand.primary,
    fontWeight: 'bold',
  },
  countdownLabel: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  feedbackButton: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.dark.background.secondary,
    borderRadius: BorderRadius.card,
    borderWidth: 2,
    borderColor: Colors.dark.border.default,
  },
  feedbackButtonSelected: {
    borderColor: Colors.dark.brand.primary,
    backgroundColor: Colors.dark.status.infoLight,
  },
  feedbackEmoji: {
    fontSize: 48,
    marginBottom: Spacing.xxs,
  },
  feedbackLabel: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.primary,
  },
  spacer: {
    flex: 1,
  },
});
