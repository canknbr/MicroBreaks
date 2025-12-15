/**
 * ONB_011: Break Style Preference
 * Premium zen design with multi-select option cards
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import OptionCard from './components/OptionCard';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing } from './constants/design';
import { BREAK_STYLES } from '@/constants/onboarding';

export default function BreakStyleScreen() {
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());

  const toggleStyle = (styleId: string) => {
    const newSelected = new Set(selectedStyles);
    if (newSelected.has(styleId)) {
      newSelected.delete(styleId);
    } else {
      newSelected.add(styleId);
    }
    setSelectedStyles(newSelected);
  };

  const handleContinue = () => {
    if (selectedStyles.size > 0) {
      router.push('./recommendation');
    }
  };

  return (
    <OnboardingLayout currentStep={11} ambientColor="purple">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          What break style appeals to you?
        </HeadlineText>

        <SubheadText delay={100}>
          Select one or more styles you'd enjoy
        </SubheadText>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {BREAK_STYLES.map((style, index) => (
            <OptionCard
              key={style.id}
              title={style.label}
              description={style.description}
              selected={selectedStyles.has(style.id)}
              onPress={() => toggleStyle(style.id)}
            />
          ))}
        </ScrollView>

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={selectedStyles.size === 0}
        />
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
