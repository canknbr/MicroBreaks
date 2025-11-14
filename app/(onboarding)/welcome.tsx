/**
 * ONB_001: Welcome & Problem Recognition
 * Modern black-themed welcome screen with animations
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, Gradients } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const iconScale = useSharedValue(0.8);
  const iconRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    // Track analytics: onb_welcome_viewed
    console.log('[Analytics] onb_welcome_viewed');

    // Entrance animations
    iconScale.value = withSpring(1, { damping: 12 });
    iconRotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    textOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    textTranslateY.value = withSpring(0, { damping: 15 });
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const handleStart = () => {
    // Track analytics: onb_welcome_cta_tapped
    console.log('[Analytics] onb_welcome_cta_tapped');
    router.push('/(onboarding)/social-proof');
  };

  const handleBrowse = () => {
    // Track analytics: onb_welcome_dismissed
    console.log('[Analytics] onb_welcome_dismissed');
    router.push('/(tabs)');
  };

  return (
    <OnboardingLayout currentStep={1} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Animated illustration with gradient background */}
          <View style={styles.illustrationContainer}>
            <LinearGradient
              colors={['rgba(0, 217, 255, 0.2)', 'rgba(180, 126, 255, 0.2)']}
              style={styles.illustrationGlow}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Animated.Text style={[styles.illustration, iconAnimatedStyle]}>
              🧘‍♀️
            </Animated.Text>
          </View>

          <Animated.View style={textAnimatedStyle}>
            <LinearGradient
              colors={Gradients.special.neon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headlineGradient}>
              <Text style={styles.headline}>Your desk doesn't have to hurt</Text>
            </LinearGradient>

            <Text style={styles.subhead}>
              Join 100,000+ workers who've eliminated daily pain
            </Text>

            {/* Feature highlights */}
            <View style={styles.features}>
              {['⚡ Smart breaks', '💪 Feel better', '🎯 Stay focused'].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            title="Start Feeling Better"
            onPress={handleStart}
            style={styles.primaryButton}
          />
          <SecondaryButton
            title="I'm just browsing"
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
    paddingVertical: Spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    position: 'relative',
    marginBottom: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
  },
  illustration: {
    fontSize: 120,
  },
  headlineGradient: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 8,
  },
  headline: {
    ...Typography.headlineLarge,
    color: Colors.dark.text.primary,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 36,
    lineHeight: 44,
  },
  subhead: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  featureItem: {
    backgroundColor: 'rgba(0, 217, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
  },
  featureText: {
    ...Typography.bodySmall,
    color: Colors.dark.text.primary,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: Spacing.sm,
  },
});
