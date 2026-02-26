/**
 * ONB_015: Break Impact Education
 * Premium zen design with smooth card animations
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';

const EDUCATION_CARDS = [
  {
    icon: 'eye-outline',
    title: '20-20-20 Rule',
    description: 'Look 20ft away, for 20 seconds, every 20 minutes',
    color: ZenColors.primary.main,
  },
  {
    icon: 'body-outline',
    title: 'Muscle Relief',
    description: 'Regular stretches may help reduce tension buildup',
    color: ZenColors.secondary.main,
  },
  {
    icon: 'flash-outline',
    title: 'Focus Boost',
    description: 'Short breaks can help restore focus and energy',
    color: ZenColors.accent.main,
  },
  {
    icon: 'trending-up-outline',
    title: 'Compound Effect',
    description: 'Small breaks add up throughout the day',
    color: ZenColors.primary.main,
  },
];

export default function ImpactEducationScreen() {
  const router = useRouter();
  const [currentCard, setCurrentCard] = useState(0);

  // Animation values
  const cardOpacity = useSharedValue(1);
  const cardTranslateX = useSharedValue(0);

  const animateToNext = () => {
    cardOpacity.value = withTiming(0, { duration: 200 });
    cardTranslateX.value = withTiming(-50, { duration: 200 }, () => {
      runOnJS(updateCard)();
    });
  };

  const updateCard = () => {
    if (currentCard < EDUCATION_CARDS.length - 1) {
      setCurrentCard(currentCard + 1);
      cardTranslateX.value = 30;
      cardOpacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
      cardTranslateX.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) });
    } else {
      handleContinue();
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardTranslateX.value }],
  }));

  const handleNext = () => {
    animateToNext();
  };

  const handleSkip = () => {
    router.push('./timer-config');
  };

  const handleContinue = () => {
    router.push('./timer-config');
  };

  const card = EDUCATION_CARDS[currentCard];

  return (
    <OnboardingLayout currentStep={15} ambientColor="purple">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Why micro-breaks matter
        </HeadlineText>

        {/* Educational Card */}
        <View style={styles.cardContainer}>
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            <LinearGradient
              colors={[card.color + '30', 'transparent']}
              style={styles.cardGlow}
            />
            <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
              <Ionicons name={card.icon as any} size={48} color={card.color} />
            </View>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDescription}>{card.description}</Text>
          </Animated.View>

          {/* Dots indicator */}
          <View style={styles.dotsContainer}>
            {EDUCATION_CARDS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentCard && [styles.dotActive, { backgroundColor: card.color }],
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title={currentCard < EDUCATION_CARDS.length - 1 ? 'Next' : 'Got it'}
          onPress={handleNext}
        />
        <SecondaryButton title="Skip" onPress={handleSkip} variant="muted" />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: ZenSpacing.lg,
  },
  card: {
    width: '100%',
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    padding: ZenSpacing.xl,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
    overflow: 'hidden',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ZenSpacing.lg,
  },
  cardTitle: {
    ...ZenTypography.headline.medium,
    color: ZenColors.text.primary,
    textAlign: 'center',
    marginBottom: ZenSpacing.sm,
  },
  cardDescription: {
    ...ZenTypography.body.large,
    color: ZenColors.text.secondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: ZenSpacing.lg,
    gap: ZenSpacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ZenColors.border.default,
  },
  dotActive: {
    width: 24,
  },
  spacer: {
    height: ZenSpacing.md,
  },
});
