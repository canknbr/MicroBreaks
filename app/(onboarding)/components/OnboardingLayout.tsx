/**
 * Onboarding Layout Component
 * Modern black-themed layout with blur effects and animations
 */

import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Gradients } from '@/theme';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  scrollable?: boolean;
}

export default function OnboardingLayout({
  children,
  showProgress = true,
  currentStep = 1,
  totalSteps = 21,
  scrollable = true,
}: OnboardingLayoutProps) {
  const progressPercent = (currentStep / totalSteps) * 100;
  const progressWidth = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate progress bar
    progressWidth.value = withSpring(progressPercent, {
      damping: 15,
      stiffness: 100,
    });

    // Fade in content
    contentOpacity.value = withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [currentStep]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={Gradients.background.dark}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
          {showProgress && (
            <BlurView intensity={20} tint="dark" style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, animatedProgressStyle]}>
                  <LinearGradient
                    colors={Gradients.primary.cyan}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
            </BlurView>
          )}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}>
            <Animated.View style={[styles.animatedWrapper, animatedContentStyle]}>
              {scrollable ? (
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled">
                  {children}
                </ScrollView>
              ) : (
                <View style={styles.content}>{children}</View>
              )}
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.progress.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  keyboardView: {
    flex: 1,
  },
  animatedWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
});
