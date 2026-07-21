/**
 * ONB break demo — editorial. No emoji / circles / cards: the instruction is
 * the hero (big type), the hold is a large mono countdown + thin progress,
 * feedback is a type menu.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from './components/OnboardingLayout';
import SecondaryButton from './components/SecondaryButton';
import { ACTIVE_ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';

type DemoPhase = 'preparation' | 'instruction' | 'execution' | 'feedback';

const PREPARATION_DURATION_MS = 2500;
const INSTRUCTION_DURATION_MS = 3500;
const EXECUTION_DURATION_MS = 10000;

const FEEDBACK = [
  { id: 'good', label: 'Helpful' },
  { id: 'neutral', label: 'Okay' },
  { id: 'bad', label: 'Not helpful' },
] as const;

export default function BreakDemoScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<DemoPhase>('preparation');
  const [countdown, setCountdown] = useState(EXECUTION_DURATION_MS / 1000);
  const [feedback, setFeedback] = useState<'good' | 'neutral' | 'bad' | null>(null);

  const contentOpacity = useSharedValue(1);
  const progress = useSharedValue(0);

  useEffect(() => {
    const timers: number[] = [];
    const fadeTo = (fn: () => void) => {
      contentOpacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(fn)();
        contentOpacity.value = withTiming(1, { duration: 300 });
      });
    };
    timers.push(window.setTimeout(() => fadeTo(() => setPhase('instruction')), PREPARATION_DURATION_MS));
    timers.push(
      window.setTimeout(
        () => fadeTo(() => setPhase('execution')),
        PREPARATION_DURATION_MS + INSTRUCTION_DURATION_MS
      )
    );
    timers.push(
      window.setTimeout(
        () => fadeTo(() => setPhase('feedback')),
        PREPARATION_DURATION_MS + INSTRUCTION_DURATION_MS + EXECUTION_DURATION_MS
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [contentOpacity]);

  useEffect(() => {
    if (phase === 'execution') {
      progress.value = 0;
      progress.value = withTiming(1, { duration: EXECUTION_DURATION_MS });
    }
  }, [phase, progress]);

  useEffect(() => {
    if (phase === 'execution' && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase, countdown]);

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const handleFeedback = (rating: 'good' | 'neutral' | 'bad') => {
    Haptics.selectionAsync();
    setFeedback(rating);
    setTimeout(() => router.push('./notification-permission'), 650);
  };
  const handleSkip = () => router.push('./notification-permission');

  const renderContent = () => {
    switch (phase) {
      case 'preparation':
        return (
          <Animated.View style={contentStyle}>
            <Text style={styles.eyebrow}>GET READY</Text>
            <Text style={styles.hero}>Let&apos;s try a quick neck stretch.</Text>
          </Animated.View>
        );
      case 'instruction':
        return (
          <Animated.View style={contentStyle}>
            <Text style={styles.eyebrow}>FOLLOW ALONG</Text>
            <Text style={styles.hero}>Tilt your head right, ear toward your shoulder.</Text>
            <Text style={styles.meta}>Hold for 5 seconds</Text>
          </Animated.View>
        );
      case 'execution':
        return (
          <Animated.View style={contentStyle}>
            <Text style={styles.eyebrow}>HOLD</Text>
            <Text style={styles.count}>{countdown}</Text>
            <View style={styles.track}>
              <Animated.View style={[styles.fill, barStyle]} />
            </View>
            <Text style={styles.meta}>Now switch to the other side…</Text>
          </Animated.View>
        );
      case 'feedback':
        return (
          <Animated.View style={contentStyle}>
            <Text style={styles.eyebrow}>NICE WORK</Text>
            <Text style={styles.hero}>How did that feel?</Text>
            <View style={styles.fbList}>
              {FEEDBACK.map((f) => {
                const on = feedback === f.id;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => handleFeedback(f.id)}
                    style={styles.fbRow}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <View style={styles.lead}>{on ? <View style={styles.bar} /> : null}</View>
                    <Text style={[styles.fbLabel, on ? styles.fbOn : styles.fbOff]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <OnboardingLayout currentStep={5} totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.center}>{renderContent()}</View>
        {phase !== 'feedback' && <SecondaryButton title="Skip" onPress={handleSkip} variant="muted" />}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 8 },
  center: { flex: 1, justifyContent: 'center' },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 18,
  },
  hero: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    color: '#FFFFFF',
  },
  meta: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 18,
  },
  count: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 104,
    letterSpacing: -4,
    color: '#FFFFFF',
    marginBottom: 26,
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#FF2472', borderRadius: 2 },
  fbList: { marginTop: 28 },
  fbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  lead: { width: 30, justifyContent: 'center' },
  bar: { width: 18, height: 3, borderRadius: 2, backgroundColor: '#FF2472' },
  fbLabel: { fontFamily: 'GeneralSans-Bold', fontSize: 26, letterSpacing: -0.5 },
  fbOn: { color: '#FFFFFF' },
  fbOff: { color: 'rgba(255,255,255,0.3)' },
});
