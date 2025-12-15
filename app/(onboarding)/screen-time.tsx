/**
 * ONB_005: Daily Screen Time
 * Premium zen design with animated slider
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';

export default function ScreenTimeScreen() {
  const router = useRouter();
  const [hours, setHours] = useState(8);
  const [trackWidth, setTrackWidth] = useState(0);

  // Animation values
  const characterScale = useSharedValue(0.9);
  const characterOpacity = useSharedValue(0);
  const displayScale = useSharedValue(0.9);
  const sliderOpacity = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    characterOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing }));
    characterScale.value = withDelay(200, withTiming(1, { duration: 600, easing }));
    displayScale.value = withDelay(350, withTiming(1, { duration: 600, easing }));
    sliderOpacity.value = withDelay(500, withTiming(1, { duration: 400, easing }));
  }, []);

  const characterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: characterOpacity.value,
    transform: [{ scale: characterScale.value }],
  }));

  const displayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: displayScale.value }],
    opacity: displayScale.value,
  }));

  const sliderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sliderOpacity.value,
    transform: [{ translateY: interpolate(sliderOpacity.value, [0, 1], [20, 0]) }],
  }));

  const handleContinue = () => {
    router.push('./pain-assessment');
  };

  const handleSkip = () => {
    router.push('./pain-assessment');
  };

  const getColor = (value: number) => {
    if (value <= 4) return ZenColors.primary.main;
    if (value <= 8) return ZenColors.accent.main;
    return ZenColors.secondary.main;
  };

  const getFeedback = (value: number) => {
    if (value <= 4) return "That's within recommended limits";
    if (value <= 8) return "That's about average for desk workers";
    if (value <= 10) return `That's ${Math.round((value / 8 - 1) * 100)}% more than recommended`;
    return 'Consider taking extra breaks';
  };

  const handleHourSelect = (value: number) => {
    if (isNaN(value) || value < 0 || value > 14) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHours(Math.round(value));
  };

  const handleTrackPress = (e: any) => {
    if (!trackWidth) return;
    const { locationX } = e.nativeEvent;
    if (locationX === undefined || isNaN(locationX)) return;

    const percentage = Math.max(0, Math.min(1, locationX / trackWidth));
    const newValue = Math.round(percentage * 14);
    handleHourSelect(newValue);
  };

  return (
    <OnboardingLayout currentStep={5} ambientColor="gold">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          How many hours at your screen daily?
        </HeadlineText>

        {/* Character showing fatigue level */}
        <Animated.View style={[styles.characterContainer, characterAnimatedStyle]}>
          <View style={styles.characterBg}>
            <LinearGradient
              colors={[getColor(hours) + '20', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.character}>
              {hours <= 4 ? '😊' : hours <= 8 ? '😐' : hours <= 10 ? '😓' : '😵'}
            </Text>
          </View>
        </Animated.View>

        {/* Hour Display */}
        <Animated.View style={[styles.displayContainer, displayAnimatedStyle]}>
          <Text style={[styles.hoursDisplay, { color: getColor(hours) }]}>
            {isNaN(hours) ? 8 : hours}
          </Text>
          <Text style={styles.hoursLabel}>hours per day</Text>
        </Animated.View>

        {/* Slider */}
        <Animated.View style={[styles.sliderContainer, sliderAnimatedStyle]}>
          <Pressable
            style={styles.sliderTrack}
            onLayout={(e) => {
              const { width } = e.nativeEvent.layout;
              if (width && !isNaN(width)) {
                setTrackWidth(width);
              }
            }}
            onPress={handleTrackPress}>
            <LinearGradient
              colors={[ZenColors.primary.main, ZenColors.accent.main, ZenColors.secondary.main]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.sliderFill,
                { width: `${Math.max(0, Math.min(100, (hours / 14) * 100))}%` },
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: `${Math.max(0, Math.min(100, (hours / 14) * 100))}%`, backgroundColor: getColor(hours) },
              ]}
            />
          </Pressable>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>0h</Text>
            <Text style={styles.sliderLabel}>7h</Text>
            <Text style={styles.sliderLabel}>14h</Text>
          </View>
        </Animated.View>

        {/* Feedback */}
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedback}>{getFeedback(hours)}</Text>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton title="Continue" onPress={handleContinue} />
        <SecondaryButton title="It varies" onPress={handleSkip} variant="muted" />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  characterContainer: {
    alignItems: 'center',
    marginTop: ZenSpacing.lg,
    marginBottom: ZenSpacing.lg,
  },
  characterBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ZenColors.background.card,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  character: {
    fontSize: 72,
  },
  displayContainer: {
    alignItems: 'center',
    marginBottom: ZenSpacing.xl,
  },
  hoursDisplay: {
    ...ZenTypography.display.large,
  },
  hoursLabel: {
    ...ZenTypography.body.large,
    color: ZenColors.text.secondary,
    marginTop: ZenSpacing.xs,
  },
  sliderContainer: {
    marginBottom: ZenSpacing.lg,
    paddingHorizontal: ZenSpacing.sm,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: ZenColors.background.elevated,
    borderRadius: ZenRadius.full,
    marginBottom: ZenSpacing.sm,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: ZenRadius.full,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    ...ZenTypography.caption,
    color: ZenColors.text.muted,
  },
  feedbackContainer: {
    backgroundColor: ZenColors.background.card,
    padding: ZenSpacing.md,
    borderRadius: ZenRadius.lg,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  feedback: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
});
