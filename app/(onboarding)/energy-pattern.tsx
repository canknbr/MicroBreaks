/**
 * ONB_010: Energy Pattern
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
import { ENERGY_PATTERNS } from '@/constants/onboarding';

export default function EnergyPatternScreen() {
  const router = useRouter();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedPattern) {
      router.push('./break-style');
    }
  };

  const handleSkip = () => {
    router.push('./break-style');
  };

  return (
    <OnboardingLayout currentStep={10} ambientColor="gold">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          When do you feel most/least energetic?
        </HeadlineText>

        <SubheadText delay={100}>
          This helps us time your breaks optimally
        </SubheadText>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {ENERGY_PATTERNS.map((pattern) => (
            <OptionCard
              key={pattern.id}
              icon={pattern.icon}
              title={pattern.label}
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
        <SecondaryButton title="I'm not sure" onPress={handleSkip} variant="muted" />
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
