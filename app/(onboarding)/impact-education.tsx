/**
 * ONB_015: Break Impact Education
 * Educational content about the science of micro-breaks
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

const EDUCATION_CARDS = [
  {
    title: '20-20-20 Rule',
    description: 'Look 20ft away, for 20 seconds, every 20 minutes',
    icon: '👁️',
  },
  {
    title: 'Muscle Memory',
    description: 'Regular stretches prevent chronic tension buildup',
    icon: '💪',
  },
  {
    title: 'Focus Boost',
    description: '2-min breaks improve concentration by 23%',
    icon: '🧠',
  },
  {
    title: 'Compound Effect',
    description: '10 daily breaks = 1 full yoga session',
    icon: '✨',
  },
];

export default function ImpactEducationScreen() {
  const router = useRouter();
  const [currentCard, setCurrentCard] = useState(0);

  useEffect(() => {
    // Track analytics: onb_education_viewed
    // console.log('[Analytics] onb_education_viewed');
  }, []);

  const handleNext = () => {
    if (currentCard < EDUCATION_CARDS.length - 1) {
      setCurrentCard(currentCard + 1);
      // Track analytics: onb_education_cards_swiped
      // console.log('[Analytics] onb_education_cards_swiped:', currentCard + 1);
    } else {
      handleContinue();
    }
  };

  const handleSkip = () => {
    // Track analytics: onb_education_skipped
    // console.log('[Analytics] onb_education_skipped');
    router.push('./timer-config');
  };

  const handleContinue = () => {
    router.push('./timer-config');
  };

  const card = EDUCATION_CARDS[currentCard];

  return (
    <OnboardingLayout currentStep={15}>
      <View style={styles.container}>
        <Text style={styles.headline}>The science behind micro-breaks</Text>

        {/* Educational Card */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>{card.icon}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </View>

          {/* Dots indicator */}
          <View style={styles.dotsContainer}>
            {EDUCATION_CARDS.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentCard && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title={currentCard < EDUCATION_CARDS.length - 1 ? 'Next' : 'Got it'}
          onPress={handleNext}
        />
        <SecondaryButton title="Skip" onPress={handleSkip} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headline: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.dark.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.headlineSmall,
    color: Colors.dark.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border.default,
  },
  dotActive: {
    backgroundColor: Colors.dark.brand.primary,
    width: 24,
  },
  spacer: {
    height: Spacing.md,
  },
});
