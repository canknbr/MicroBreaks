/**
 * Pain Assessment Screen (Screen 6)
 * Current Pain Assessment with Body Map
 * Phase 2: Profile Building
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingContainer } from '../OnboardingContainer';
import { OnboardingButton } from '../OnboardingButton';
import { ScreenHeader } from '../ScreenHeader';
import { SelectionCard } from '../SelectionCard';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import type { PainArea, PainAreaWithSeverity } from '../../../types/onboarding';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../theme';
import { useColorScheme } from '../../../hooks/useColorScheme';

const PAIN_AREAS: Array<{ value: PainArea; label: string; icon: string }> = [
  { value: 'eyes', label: 'Eyes', icon: '👁️' },
  { value: 'head', label: 'Head', icon: '🧠' },
  { value: 'neck', label: 'Neck', icon: '🦴' },
  { value: 'shoulders', label: 'Shoulders', icon: '💪' },
  { value: 'upper_back', label: 'Upper Back', icon: '🔺' },
  { value: 'lower_back', label: 'Lower Back', icon: '🔻' },
  { value: 'wrists', label: 'Wrists', icon: '🤝' },
  { value: 'hands', label: 'Hands', icon: '✋' },
];

export const PainAssessmentScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedAreas, setSelectedAreas] = useState<PainArea[]>([]);
  const [noPain, setNoPain] = useState(false);

  const handleToggleArea = (area: PainArea) => {
    setNoPain(false);
    setSelectedAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleNoPain = () => {
    setNoPain(true);
    setSelectedAreas([]);
  };

  const handleContinue = () => {
    const painAreasWithSeverity: PainAreaWithSeverity[] = selectedAreas.map((area) => ({
      area,
      severity: 'moderate' as const, // Default to moderate for simplicity
    }));
    updateData({ painAreas: painAreasWithSeverity });
    goToNextScreen();
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader
          title="Where do you feel discomfort?"
          subtitle="Select all areas that apply"
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* No Pain Option */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <SelectionCard
              title="I'm pain-free!"
              subtitle="Focus on prevention"
              icon="✨"
              selected={noPain}
              onPress={handleNoPain}
            />
          </Animated.View>

          {/* Divider */}
          {!noPain && (
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
              <Text
                style={[
                  styles.dividerText,
                  Typography.bodySmall,
                  { color: colors.text.secondary },
                ]}
              >
                or select pain areas
              </Text>
              <View style={[styles.divider, { backgroundColor: colors.border.default }]} />
            </View>
          )}

          {/* Pain Areas */}
          <View style={styles.painAreas}>
            {PAIN_AREAS.map((area, index) => (
              <Animated.View
                key={area.value}
                entering={FadeInDown.delay(300 + index * 50).duration(600)}
              >
                <SelectionCard
                  title={area.label}
                  icon={area.icon}
                  selected={selectedAreas.includes(area.value) && !noPain}
                  onPress={() => handleToggleArea(area.value)}
                  multiSelect
                />
              </Animated.View>
            ))}
          </View>

          {/* Selection Count */}
          {selectedAreas.length > 0 && !noPain && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={[
                styles.countCard,
                { backgroundColor: `${colors.brand.primary}15` },
                Shadows.sm,
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  Typography.bodyMedium,
                  { color: colors.text.primary },
                ]}
              >
                {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''} selected
              </Text>
            </Animated.View>
          )}
        </ScrollView>

        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.actions}
        >
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            disabled={!noPain && selectedAreas.length === 0}
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.sm,
    opacity: 0.6,
  },
  painAreas: {
    gap: 0,
  },
  countCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  countText: {
    textAlign: 'center',
  },
  actions: {
    marginTop: Spacing.lg,
  },
});
