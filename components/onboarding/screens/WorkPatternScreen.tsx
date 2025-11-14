/**
 * Work Pattern Screen (Screen 7)
 * How user typically works
 * Phase 2: Profile Building
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingContainer } from '../OnboardingContainer';
import { OnboardingButton } from '../OnboardingButton';
import { ScreenHeader } from '../ScreenHeader';
import { SelectionCard } from '../SelectionCard';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import type { WorkPattern } from '../../../types/onboarding';
import { Spacing } from '../../../theme';

const WORK_PATTERNS: Array<{ value: WorkPattern; label: string; subtitle: string; icon: string }> = [
  { value: 'deep_focus', label: 'Deep Focus Blocks', subtitle: 'Long uninterrupted sessions', icon: '🎯' },
  { value: 'task_switching', label: 'Task Switching', subtitle: 'Jumping between many tasks', icon: '🔄' },
  { value: 'meeting_heavy', label: 'Meeting Heavy', subtitle: 'Lots of calls and meetings', icon: '📞' },
  { value: 'flexible', label: 'Flexible', subtitle: 'It changes daily', icon: '🌊' },
];

export const WorkPatternScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const [selectedPattern, setSelectedPattern] = useState<WorkPattern | null>(null);

  const handleContinue = () => {
    if (selectedPattern) {
      updateData({ workPattern: selectedPattern });
      goToNextScreen();
    }
  };

  const handleSkip = () => {
    updateData({ workPattern: 'flexible' });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader
          title="How do you typically work?"
          subtitle="This helps us time your breaks perfectly"
        />

        <View style={styles.content}>
          {WORK_PATTERNS.map((pattern, index) => (
            <Animated.View
              key={pattern.value}
              entering={FadeInDown.delay(200 + index * 100).duration(600)}
            >
              <SelectionCard
                title={pattern.label}
                subtitle={pattern.subtitle}
                icon={pattern.icon}
                selected={selectedPattern === pattern.value}
                onPress={() => setSelectedPattern(pattern.value)}
              />
            </Animated.View>
          ))}
        </View>

        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.actions}
        >
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            disabled={!selectedPattern}
          />
          <OnboardingButton title="Skip this" onPress={handleSkip} variant="ghost" />
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
    gap: 0,
  },
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
