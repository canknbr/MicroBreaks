/**
 * ONB_001: Welcome & Problem Recognition
 * Clean, minimalist welcome screen inspired by "How We Feel" design
 */

import { Colors, Spacing, Typography } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';

export default function WelcomeScreen() {
  const router = useRouter();
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    // Track analytics: onb_welcome_viewed
    // console.log('[Analytics] onb_welcome_viewed');

    // Entrance animations
    textOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    textTranslateY.value = withSpring(0, { damping: 50 });
  }, []);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const handleStart = () => {
    // Track analytics: onb_welcome_cta_tapped
    // console.log('[Analytics] onb_welcome_cta_tapped');
    router.push('./social-proof');
  };

  const handleBrowse = () => {
    // Track analytics: onb_welcome_dismissed
    // console.log('[Analytics] onb_welcome_dismissed');
    router.replace('/(tabs)/index' as any);
  };

  return (
    <OnboardingLayout currentStep={1} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <Text style={styles.headline}>
              MicroBreaks{'\n'}{'\n'}{'\n'}Your Desk Wellness{'\n'}Companion
            </Text>

            <Text style={styles.subhead}>
              Take smart breaks throughout your day to stay energized, focused, and pain-free
            </Text>
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Get Started"
            onPress={handleStart}
            style={styles.primaryButton}
          />
          <SecondaryButton
            title="Skip setup"
            onPress={handleBrowse}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  textContainer: {
    alignItems: 'center',
  },
  headline: {
    ...Typography.displaySmall,
    color: Colors.dark.text.primary,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  subhead: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
});
