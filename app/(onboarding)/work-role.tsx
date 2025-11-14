/**
 * ONB_004: Work Role Selection
 * Collect user's work role for personalization
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import OptionCard from './components/OptionCard';
import { Colors, Typography, Spacing } from '@/theme';
import { WORK_ROLES } from '@/constants/onboarding';

export default function WorkRoleScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    // Track analytics: onb_role_screen_viewed
    console.log('[Analytics] onb_role_screen_viewed');
  }, []);

  const handleContinue = () => {
    if (selectedRole) {
      // Track analytics: onb_role_selected
      console.log('[Analytics] onb_role_selected:', selectedRole);
      router.push('/(onboarding)/screen-time');
    }
  };

  return (
    <OnboardingLayout currentStep={4} scrollable={false}>
      <View style={styles.container}>
        <Text style={styles.question}>What best describes your work?</Text>

        <FlatList
          data={WORK_ROLES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OptionCard
              icon={item.icon}
              title={item.label}
              selected={selectedRole === item.id}
              onPress={() => setSelectedRole(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedRole}
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
    color: Colors.light.text.primary,
    marginBottom: Spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.sm,
  },
});
