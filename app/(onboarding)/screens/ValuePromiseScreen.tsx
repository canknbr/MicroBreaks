/**
 * Value Promise Screen (Screen 3)
 * Value Promise & Expectation Setting
 * Phase 1: Hook
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { ScreenHeader } from '@/components/onboarding/ScreenHeader';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/theme';
import { useColorScheme } from '@/hooks/useColorScheme';

const BENEFITS = [
  {
    id: 1,
    emoji: '🎯',
    title: 'Personalized exercises',
    description: 'For your specific pain',
  },
  {
    id: 2,
    emoji: '🔔',
    title: 'Smart reminders',
    description: 'That respect your flow',
  },
  {
    id: 3,
    emoji: '📊',
    title: 'Track improvements',
    description: 'With health scores',
  },
];

export const ValuePromiseScreen: React.FC = () => {
  const { goToNextScreen, progress } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleStart = () => {
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader
          emoji="⏱️"
          title="3 minutes to a healthier workday"
          subtitle="Quick setup • No spam • Cancel anytime"
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.benefits}>
            {BENEFITS.map((benefit, index) => (
              <Animated.View
                key={benefit.id}
                entering={FadeInDown.delay(200 + index * 150).duration(600)}
                style={[
                  styles.benefitCard,
                  { backgroundColor: colors.background.secondary },
                  Shadows.md,
                ]}
              >
                <View style={styles.benefitIconContainer}>
                  <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
                </View>
                <View style={styles.benefitContent}>
                  <Text
                    style={[
                      styles.benefitTitle,
                      Typography.labelLarge,
                      { color: colors.text.primary },
                    ]}
                  >
                    {benefit.title}
                  </Text>
                  <Text
                    style={[
                      styles.benefitDescription,
                      Typography.bodyMedium,
                      { color: colors.text.secondary },
                    ]}
                  >
                    {benefit.description}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Trust indicators */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(600)}
            style={[
              styles.trustCard,
              { backgroundColor: `${colors.brand.primary}10` },
              Shadows.sm,
            ]}
          >
            <Text
              style={[
                styles.trustText,
                Typography.bodyMedium,
                { color: colors.text.secondary },
              ]}
            >
              ✓ Science-backed exercises
              {'\n'}
              ✓ Privacy-first approach
              {'\n'}
              ✓ Used by 100,000+ professionals
            </Text>
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInDown.delay(1000).duration(600)}
          style={styles.actions}
        >
          <OnboardingButton
            title="Personalize My Plan"
            onPress={handleStart}
            variant="primary"
          />
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
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  benefits: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  benefitCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  benefitEmoji: {
    fontSize: 32,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    marginBottom: 4,
  },
  benefitDescription: {
    opacity: 0.8,
  },
  trustCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
  },
  trustText: {
    lineHeight: 24,
  },
  actions: {
    marginTop: Spacing.lg,
  },
});
