/**
 * ONB_007: Work Pattern
 * Premium zen design with option cards
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import OptionCard from './components/OptionCard';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenSpacing } from './constants/design';
import { WORK_PATTERNS } from '@/constants/onboarding';

export default function WorkPatternScreen() {
  const router = useRouter();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedPattern) {
      router.push('./ergonomic-setup');
    }
  };

  const handleSkip = () => {
    router.push('./ergonomic-setup');
  };

  return (
    <OnboardingLayout currentStep={7} ambientColor="teal">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          How do you typically work?
        </HeadlineText>

        <SubheadText delay={100}>
          We&apos;ll optimize your breaks for your work style
        </SubheadText>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {WORK_PATTERNS.map((pattern) => (
            <OptionCard
              key={pattern.id}
              title={pattern.label}
              description={pattern.description}
              selected={selectedPattern === pattern.id}
              onPress={() => setSelectedPattern(pattern.id)}
            />
          ))}
        </ScrollView>

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedPattern}
        />
        <SecondaryButton title="Skip this" onPress={handleSkip} variant="muted" />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginTop: ZenSpacing.md,
  },
  scrollContent: {
    paddingBottom: ZenSpacing.md,
  },
});
