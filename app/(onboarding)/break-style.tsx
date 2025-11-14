/**
 * ONB_011: Break Style Preference
 * Swipeable cards for break style selection
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import OptionCard from './components/OptionCard';
import { Colors, Typography, Spacing } from '@/theme';
import { BREAK_STYLES } from '@/constants/onboarding';

export default function BreakStyleScreen() {
  const router = useRouter();
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Track analytics: onb_break_style_viewed
    // console.log('[Analytics] onb_break_style_viewed');
  }, []);

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
      // Track analytics: onb_break_styles_liked
      // console.log('[Analytics] onb_break_styles_liked:', Array.from(selectedStyles));
      router.push('./recommendation');
    }
  };

  return (
    <OnboardingLayout currentStep={11}>
      <View style={styles.container}>
        <Text style={styles.question}>What break style appeals to you?</Text>
        <Text style={styles.subtext}>
          Select one or more (at least 1 required)
        </Text>

        <View style={styles.styles}>
          {BREAK_STYLES.map((style) => (
            <OptionCard
              key={style.id}
              title={style.label}
              description={style.description}
              selected={selectedStyles.has(style.id)}
              onPress={() => toggleStyle(style.id)}
            />
          ))}
        </View>

        <View style={styles.spacer} />

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
  question: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    marginBottom: Spacing.xxs,
  },
  subtext: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    marginBottom: Spacing.md,
  },
  styles: {
    marginBottom: Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
});
