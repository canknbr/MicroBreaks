/**
 * Welcome Screen (Screen 1)
 * First screen: Welcome & Pain Recognition
 * Phase 1: Hook
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { OnboardingContainer } from '../OnboardingContainer';
import { OnboardingButton } from '../OnboardingButton';
import { ScreenHeader } from '../ScreenHeader';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { Spacing } from '../../../theme';

export const WelcomeScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();

  const illustrationScale = useSharedValue(1);
  const illustrationRotate = useSharedValue(0);

  useEffect(() => {
    // Mark onboarding as started
    updateData({ startedAt: new Date() });

    // Animate illustration
    illustrationScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );

    illustrationRotate.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 1500 }),
        withTiming(3, { duration: 3000 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const illustrationStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: illustrationScale.value },
      { rotate: `${illustrationRotate.value}deg` },
    ],
  }));

  const handleStart = () => {
    goToNextScreen();
  };

  const handleBrowse = () => {
    // Navigate to app without onboarding (skip)
    console.log('User chose to browse');
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <Animated.View entering={FadeIn.duration(800)} style={styles.illustrationContainer}>
          <Animated.View style={[styles.illustration, illustrationStyle]}>
            <Animated.Text style={styles.illustrationEmoji}>🧘‍♀️</Animated.Text>
          </Animated.View>
        </Animated.View>

        <ScreenHeader
          title="Your desk doesn't have to hurt"
          subtitle="Join 100,000+ workers who've eliminated daily pain"
        />

        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.actions}
        >
          <OnboardingButton
            title="Start Feeling Better"
            onPress={handleStart}
            variant="primary"
          />
          <OnboardingButton
            title="I'm just browsing"
            onPress={handleBrowse}
            variant="ghost"
          />
        </Animated.View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  illustration: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 120,
  },
  actions: {
    gap: Spacing.sm,
  },
});
