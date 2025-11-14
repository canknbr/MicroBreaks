/**
 * Simple Selection Screen
 * Reusable component for simple selection screens
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { ScreenHeader } from '@/components/onboarding/ScreenHeader';
import { SelectionCard } from '@/components/onboarding/SelectionCard';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Spacing } from '@/theme';

interface Option {
  value: string;
  label: string;
  subtitle?: string;
  icon?: string;
}

interface SimpleSelectionScreenProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  options: Option[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  allowSkip?: boolean;
  skipLabel?: string;
}

export const SimpleSelectionScreen: React.FC<SimpleSelectionScreenProps> = ({
  title,
  subtitle,
  emoji,
  options,
  onSelect,
  multiSelect = false,
  allowSkip = false,
  skipLabel = 'Skip',
}) => {
  const { goToNextScreen, progress } = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (value: string) => {
    if (multiSelect) {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    } else {
      setSelected([value]);
    }
  };

  const handleContinue = () => {
    if (selected.length > 0) {
      onSelect(multiSelect ? selected.join(',') : selected[0]);
      goToNextScreen();
    }
  };

  const handleSkip = () => {
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader title={title} subtitle={subtitle} emoji={emoji} />

        <View style={styles.content}>
          {options.map((option, index) => (
            <Animated.View
              key={option.value}
              entering={FadeInDown.delay(200 + index * 100).duration(600)}
            >
              <SelectionCard
                title={option.label}
                subtitle={option.subtitle}
                icon={option.icon}
                selected={selected.includes(option.value)}
                onPress={() => handleToggle(option.value)}
                multiSelect={multiSelect}
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
            disabled={selected.length === 0}
          />
          {allowSkip && (
            <OnboardingButton title={skipLabel} onPress={handleSkip} variant="ghost" />
          )}
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
