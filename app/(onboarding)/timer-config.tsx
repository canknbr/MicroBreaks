/**
 * ONB_016: Timer Configuration
 * Premium zen design with animated presets
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import OptionCard from './components/OptionCard';
import { HeadlineText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { TIMER_PRESETS } from '@/constants/onboarding';

export default function TimerConfigScreen() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<string>('deep_work');

  // Animation values
  const bannerOpacity = useSharedValue(0);
  const commitmentOpacity = useSharedValue(0);

  useEffect(() => {
    bannerOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    commitmentOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
  }, []);

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ translateY: interpolate(bannerOpacity.value, [0, 1], [10, 0]) }],
  }));

  const commitmentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: commitmentOpacity.value,
    transform: [{ scale: interpolate(commitmentOpacity.value, [0, 1], [0.95, 1]) }],
  }));

  const handleContinue = () => {
    router.push('./notification-permission');
  };

  const selectedPresetData = TIMER_PRESETS.find((p) => p.id === selectedPreset);

  return (
    <OnboardingLayout currentStep={16} ambientColor="teal">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Choose your work rhythm
        </HeadlineText>

        {/* Smart Suggestion */}
        <Animated.View style={[styles.suggestionBanner, bannerAnimatedStyle]}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
          )}
          <LinearGradient
            colors={['rgba(6, 255, 165, 0.15)', 'transparent']}
            style={styles.suggestionGlow}
          />
          <Ionicons name="sparkles" size={18} color={ZenColors.primary.main} />
          <Text style={styles.suggestionText}>
            Based on your profile, we recommend{' '}
            <Text style={styles.suggestionBold}>Deep Work</Text>
          </Text>
        </Animated.View>

        {/* Presets */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.presets}
          showsVerticalScrollIndicator={false}
        >
          {TIMER_PRESETS.map((preset) => (
            <OptionCard
              key={preset.id}
              title={preset.label}
              description={preset.description}
              selected={selectedPreset === preset.id}
              onPress={() => setSelectedPreset(preset.id)}
            />
          ))}
        </ScrollView>

        {/* Time Commitment Display */}
        {selectedPresetData && (
          <Animated.View style={[styles.commitmentCard, commitmentAnimatedStyle]}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
            )}
            <View style={styles.commitmentIcon}>
              <Ionicons name="time-outline" size={24} color={ZenColors.primary.main} />
            </View>
            <View style={styles.commitmentContent}>
              <Text style={styles.commitmentLabel}>Daily commitment</Text>
              <Text style={styles.commitmentValue}>~16 breaks per day</Text>
              <Text style={styles.commitmentSubtext}>Based on 8-hour workday</Text>
            </View>
          </Animated.View>
        )}

        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  suggestionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 255, 165, 0.08)',
    padding: ZenSpacing.sm,
    borderRadius: ZenRadius.lg,
    marginTop: ZenSpacing.md,
    marginBottom: ZenSpacing.md,
    gap: ZenSpacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(6, 255, 165, 0.25)',
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: 'rgba(18, 18, 26, 0.92)',
    borderRadius: ZenRadius.lg,
  },
  suggestionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  suggestionText: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.primary,
    flex: 1,
  },
  suggestionBold: {
    ...ZenTypography.label.medium,
    color: ZenColors.primary.main,
  },
  scrollView: {
    flex: 1,
  },
  presets: {
    paddingBottom: ZenSpacing.sm,
  },
  commitmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    padding: ZenSpacing.md,
    borderRadius: ZenRadius.lg,
    marginBottom: ZenSpacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  commitmentIcon: {
    width: 48,
    height: 48,
    borderRadius: ZenRadius.md,
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ZenSpacing.md,
  },
  commitmentContent: {
    flex: 1,
  },
  commitmentLabel: {
    ...ZenTypography.caption,
    color: ZenColors.text.secondary,
  },
  commitmentValue: {
    ...ZenTypography.title.medium,
    color: ZenColors.text.primary,
    marginVertical: ZenSpacing.xxs,
  },
  commitmentSubtext: {
    ...ZenTypography.caption,
    color: ZenColors.text.muted,
  },
});
