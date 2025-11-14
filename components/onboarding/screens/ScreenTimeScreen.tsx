/**
 * Screen Time Screen (Screen 5)
 * Daily Screen Time Input
 * Phase 2: Profile Building
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { OnboardingContainer } from '../OnboardingContainer';
import { OnboardingButton } from '../OnboardingButton';
import { ScreenHeader } from '../ScreenHeader';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { useColorScheme } from '../../../hooks/useColorScheme';

export const ScreenTimeScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress, data } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [screenHours, setScreenHours] = useState(data.screenHours || 8);

  const handleContinue = () => {
    updateData({ screenHours });
    goToNextScreen();
  };

  const handleSkip = () => {
    updateData({ screenHours: 8 });
    goToNextScreen();
  };

  const getColorForHours = (hours: number) => {
    if (hours <= 4) return colors.status.success;
    if (hours <= 8) return colors.status.warning;
    return colors.status.error;
  };

  const getFeedbackMessage = (hours: number) => {
    if (hours <= 4) return "That's healthy!";
    if (hours <= 6) return 'Moderate screen time';
    if (hours <= 8) return 'Above average';
    if (hours <= 10) return 'High screen time';
    return 'Very high - breaks are crucial!';
  };

  const getEmojiForHours = (hours: number) => {
    if (hours <= 4) return '😊';
    if (hours <= 6) return '😐';
    if (hours <= 8) return '😅';
    if (hours <= 10) return '😰';
    return '🤯';
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader
          title="How many hours at your screen daily?"
          subtitle="This helps us determine break frequency"
        />

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.content}
        >
          {/* Hour Display */}
          <View
            style={[
              styles.displayCard,
              { backgroundColor: colors.background.secondary },
              Shadows.md,
            ]}
          >
            <Text style={styles.emojiLarge}>{getEmojiForHours(screenHours)}</Text>
            <Text
              style={[
                styles.hoursText,
                Typography.displayLarge,
                { color: getColorForHours(screenHours) },
              ]}
            >
              {screenHours}
            </Text>
            <Text
              style={[
                styles.hoursLabel,
                Typography.headlineSmall,
                { color: colors.text.primary },
              ]}
            >
              hours per day
            </Text>
            <Text
              style={[
                styles.feedback,
                Typography.bodyMedium,
                { color: colors.text.secondary },
              ]}
            >
              {getFeedbackMessage(screenHours)}
            </Text>
          </View>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={14}
              step={1}
              value={screenHours}
              onValueChange={setScreenHours}
              minimumTrackTintColor={getColorForHours(screenHours)}
              maximumTrackTintColor={colors.border.default}
              thumbTintColor={getColorForHours(screenHours)}
            />
            <View style={styles.sliderLabels}>
              <Text
                style={[
                  styles.sliderLabel,
                  Typography.bodySmall,
                  { color: colors.text.secondary },
                ]}
              >
                1h
              </Text>
              <Text
                style={[
                  styles.sliderLabel,
                  Typography.bodySmall,
                  { color: colors.text.secondary },
                ]}
              >
                14h
              </Text>
            </View>
          </View>

          {/* Info */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={[
              styles.infoCard,
              { backgroundColor: `${colors.brand.primary}10` },
              Shadows.sm,
            ]}
          >
            <Text
              style={[
                styles.infoText,
                Typography.bodySmall,
                { color: colors.text.secondary },
              ]}
            >
              💡 The average desk worker spends 9+ hours looking at screens daily
            </Text>
          </Animated.View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          style={styles.actions}
        >
          <OnboardingButton title="Continue" onPress={handleContinue} variant="primary" />
          <OnboardingButton title="It varies" onPress={handleSkip} variant="ghost" />
        </Animated.View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  displayCard: {
    padding: Spacing.xxl,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emojiLarge: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  hoursText: {
    marginBottom: 4,
  },
  hoursLabel: {
    marginBottom: Spacing.xs,
  },
  feedback: {
    opacity: 0.8,
  },
  sliderContainer: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },
  sliderLabel: {
    opacity: 0.6,
  },
  infoCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
  },
  infoText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
