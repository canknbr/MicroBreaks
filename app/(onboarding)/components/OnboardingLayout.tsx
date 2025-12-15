/**
 * Premium Zen Onboarding Layout
 *
 * Features:
 * - Ambient glow effects
 * - Breathing animation background
 * - Smooth progress bar with glow
 * - Elegant entrance animations
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ZenColors, ZenSpacing, ZenGradients } from '../constants/design';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  scrollable?: boolean;
  showAmbient?: boolean;
  ambientColor?: 'teal' | 'purple' | 'gold';
}

export default function OnboardingLayout({
  children,
  showProgress = true,
  currentStep = 1,
  totalSteps = 21,
  scrollable = true,
  showAmbient = true,
  ambientColor = 'teal',
}: OnboardingLayoutProps) {
  const progressPercent = (currentStep / totalSteps) * 100;

  // Reanimated values
  const progressWidth = useSharedValue(0);
  const progressGlow = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(20);

  // RN Animated for ambient breathing
  const ambientAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    // Ambient breathing animation
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(ambientAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        RNAnimated.timing(ambientAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => ambientAnim.stopAnimation();
  }, []);

  useEffect(() => {
    // Reset animations on step change
    contentOpacity.value = 0;
    contentTranslateY.value = 12;

    // Progress bar animation - smooth timing
    progressWidth.value = withTiming(progressPercent, { duration: 400, easing: Easing.out(Easing.cubic) });
    progressGlow.value = withTiming(1, { duration: 500 });

    // Content entrance - smooth fade
    contentOpacity.value = withDelay(
      50,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    contentTranslateY.value = withDelay(
      50,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, [currentStep]);

  // Animated styles
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedProgressGlowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progressGlow.value, [0, 1], [0, 0.6]),
    transform: [{ scaleX: progressWidth.value / 100 }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Ambient animation interpolations
  const ambientScale = ambientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  const ambientOpacity = ambientAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.5],
  });

  const ambientColors = {
    teal: ZenColors.primary.main,
    purple: ZenColors.secondary.main,
    gold: ZenColors.accent.main,
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.background}>
        {/* Gradient Background */}
        <LinearGradient
          colors={ZenGradients.background.default}
          style={StyleSheet.absoluteFill}
        />

        {/* Ambient Glow Effects */}
        {showAmbient && (
          <>
            <RNAnimated.View
              style={[
                styles.ambientGlow,
                styles.ambientTopRight,
                {
                  backgroundColor: ambientColors[ambientColor],
                  opacity: ambientOpacity,
                  transform: [{ scale: ambientScale }],
                },
              ]}
            />
            <RNAnimated.View
              style={[
                styles.ambientGlow,
                styles.ambientBottomLeft,
                {
                  backgroundColor: ZenColors.secondary.main,
                  opacity: RNAnimated.multiply(ambientOpacity, 0.6),
                  transform: [{ scale: ambientScale }],
                },
              ]}
            />
          </>
        )}

        <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
          {/* Progress Bar */}
          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                {/* Glow effect behind progress */}
                <Animated.View
                  style={[styles.progressGlow, animatedProgressGlowStyle]}
                />
                {/* Progress fill */}
                <Animated.View style={[styles.progressFill, animatedProgressStyle]}>
                  <LinearGradient
                    colors={[ZenColors.primary.main, ZenColors.primary.dark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              {/* Step indicator */}
              <View style={styles.stepIndicator}>
                <RNAnimated.Text style={[styles.stepText, { opacity: ambientOpacity }]}>
                  {currentStep}/{totalSteps}
                </RNAnimated.Text>
              </View>
            </View>
          )}

          {/* Content */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <Animated.View style={[styles.animatedWrapper, animatedContentStyle]}>
              {scrollable ? (
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
              ) : (
                <View style={styles.content}>{children}</View>
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: ZenColors.background.pure,
  },
  container: {
    flex: 1,
  },
  // Ambient glows
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
  },
  ambientTopRight: {
    top: -100,
    right: -100,
    width: 350,
    height: 350,
  },
  ambientBottomLeft: {
    bottom: -80,
    left: -100,
    width: 300,
    height: 300,
  },
  // Progress bar
  progressContainer: {
    paddingHorizontal: ZenSpacing.lg,
    paddingTop: ZenSpacing.sm,
    paddingBottom: ZenSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ZenSpacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: ZenColors.border.subtle,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressGlow: {
    position: 'absolute',
    top: -4,
    left: 0,
    right: 0,
    height: 11,
    backgroundColor: ZenColors.primary.main,
    borderRadius: 6,
    transformOrigin: 'left',
  },
  stepIndicator: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
    color: ZenColors.text.muted,
    letterSpacing: 0.5,
  },
  // Content
  keyboardView: {
    flex: 1,
  },
  animatedWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: ZenSpacing.lg,
    paddingBottom: ZenSpacing.xxl,
  },
  content: {
    flex: 1,
    paddingHorizontal: ZenSpacing.lg,
  },
});
