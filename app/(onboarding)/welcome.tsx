/**
 * ONB_001: Welcome & Problem Recognition
 * Premium Zen welcome screen with smooth animations
 */

import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText, SubheadText, DisplayText } from './components/AnimatedText';
import { ZenColors, ZenSpacing } from './constants/design';
import { useOnboardingStore } from '@/store';

export default function WelcomeScreen() {
  const router = useRouter();
  const skipOnboarding = useOnboardingStore((s) => s.skipOnboarding);

  // Animation values
  const logoScale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(20);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);

    // Logo entrance - smooth timing
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing }));
    logoScale.value = withDelay(200, withTiming(1, { duration: 700, easing }));

    // Decorative ring
    ringOpacity.value = withDelay(350, withTiming(0.5, { duration: 700, easing }));
    ringScale.value = withDelay(350, withTiming(1, { duration: 800, easing }));

    // Buttons entrance
    buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 500, easing }));
    buttonsTranslateY.value = withDelay(600, withTiming(0, { duration: 500, easing }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const handleStart = () => {
    router.push('./social-proof');
  };

  const handleBrowse = () => {
    skipOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingLayout
      currentStep={1}
      scrollable={false}
      showAmbient={true}
      ambientColor="teal"
    >
      <View style={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          {/* Decorative Ring */}
          <Animated.View style={[styles.decorativeRing, ringAnimatedStyle]}>
            <LinearGradient
              colors={[ZenColors.primary.glow, 'transparent']}
              style={styles.ringGradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>

          {/* Logo Icon */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoInner}>
              <LinearGradient
                colors={[ZenColors.primary.main, ZenColors.primary.dark]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.logoIconContainer}>
                  {/* Stylized M icon */}
                  <View style={styles.logoM}>
                    <View style={[styles.mBar, styles.mBarLeft]} />
                    <View style={[styles.mBar, styles.mBarMiddle]} />
                    <View style={[styles.mBar, styles.mBarRight]} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>
        </View>

        {/* Text Content */}
        <View style={styles.content}>
          <DisplayText delay={300} style={styles.brandText}>
            MicroBreaks
          </DisplayText>

          <HeadlineText delay={500} style={styles.headline}>
            Your Desk Wellness Companion
          </HeadlineText>

          <SubheadText delay={700} style={styles.subhead}>
            Take smart breaks throughout your day to stay energized, focused, and pain-free
          </SubheadText>
        </View>

        {/* Actions */}
        <Animated.View style={[styles.actions, buttonsAnimatedStyle]}>
          <PrimaryButton
            title="Get Started"
            onPress={handleStart}
            size="large"
            variant="primary"
            style={styles.primaryButton}
          />
          <SecondaryButton
            title="Skip setup"
            onPress={handleBrowse}
            variant="muted"
          />
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: ZenSpacing.xl,
  },
  // Logo Section
  logoSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginTop: ZenSpacing.xl,
  },
  decorativeRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: ZenColors.primary.glow,
  },
  ringGradient: {
    flex: 1,
    borderRadius: 100,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    padding: 2,
    shadowColor: ZenColors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  logoInner: {
    flex: 1,
    borderRadius: 26,
    overflow: 'hidden',
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoM: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 36,
    gap: 4,
  },
  mBar: {
    width: 8,
    backgroundColor: ZenColors.background.pure,
    borderRadius: 4,
  },
  mBarLeft: {
    height: 36,
  },
  mBarMiddle: {
    height: 24,
  },
  mBarRight: {
    height: 36,
  },
  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ZenSpacing.md,
  },
  brandText: {
    textAlign: 'center',
    marginBottom: ZenSpacing.lg,
  },
  headline: {
    textAlign: 'center',
    marginBottom: ZenSpacing.md,
  },
  subhead: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  // Actions
  actions: {
    width: '100%',
    paddingTop: ZenSpacing.lg,
  },
  primaryButton: {
    marginBottom: ZenSpacing.sm,
  },
});
