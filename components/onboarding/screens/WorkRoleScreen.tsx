/**
 * Work Role Screen (Screen 4)
 * Work Role Selection
 * Phase 2: Profile Building
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { OnboardingContainer } from '../OnboardingContainer';
import { OnboardingButton } from '../OnboardingButton';
import { ScreenHeader } from '../ScreenHeader';
import { SelectionCard } from '../SelectionCard';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import type { WorkRole } from '../../../types/onboarding';
import { Spacing } from '../../../theme';

const WORK_ROLES: Array<{ value: WorkRole; label: string; icon: string }> = [
  { value: 'developer', label: 'Software Developer', icon: '💻' },
  { value: 'designer', label: 'Designer/Creative', icon: '🎨' },
  { value: 'analyst', label: 'Data Analyst', icon: '📊' },
  { value: 'student', label: 'Student', icon: '📚' },
  { value: 'manager', label: 'Manager/Executive', icon: '👔' },
  { value: 'writer', label: 'Writer/Editor', icon: '✍️' },
  { value: 'support', label: 'Customer Support', icon: '🎧' },
  { value: 'other', label: 'Other', icon: '➕' },
];

export const WorkRoleScreen: React.FC = () => {
  const { goToNextScreen, updateData, progress } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState<WorkRole | null>(null);

  const handleSelectRole = (role: WorkRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      updateData({ workRole: selectedRole });
      goToNextScreen();
    }
  };

  return (
    <OnboardingContainer progress={progress}>
      <View style={styles.container}>
        <ScreenHeader
          title="What best describes your work?"
          subtitle="This helps us personalize your breaks"
        />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={styles.options}
          >
            {WORK_ROLES.map((role, index) => (
              <Animated.View
                key={role.value}
                entering={FadeInDown.delay(300 + index * 50).duration(600)}
              >
                <SelectionCard
                  title={role.label}
                  icon={role.icon}
                  selected={selectedRole === role.value}
                  onPress={() => handleSelectRole(role.value)}
                />
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInDown.delay(800).duration(600)}
          style={styles.actions}
        >
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            disabled={!selectedRole}
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
  options: {
    gap: 0,
  },
  actions: {
    marginTop: Spacing.lg,
  },
});
