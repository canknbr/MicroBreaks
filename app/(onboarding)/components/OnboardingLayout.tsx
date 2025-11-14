/**
 * Onboarding Layout Component
 * Pure black background layout inspired by "How We Feel" design
 */

import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/theme';

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
      <View style={styles.background}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
              </View>
            </View>
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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Colors.dark.background.primary,
  },
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.dark.border.default,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.interactive.primary,
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
});
