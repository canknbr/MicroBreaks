/**
 * ONB_004: Work Role Selection
 * Premium zen design with animated option cards
 */

import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import OptionCard from './components/OptionCard';
import PrimaryButton from './components/PrimaryButton';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing } from './constants/design';
import { WORK_ROLES } from '@/constants/onboarding';

export default function WorkRoleScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      router.push('./screen-time');
    }
  };

  return (
    <OnboardingLayout currentStep={4} scrollable={false} ambientColor="teal">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          What best describes your work?
        </HeadlineText>

        <SubheadText delay={100}>
          We'll customize your breaks for your role
        </SubheadText>

        <FlatList
          data={WORK_ROLES}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <OptionCard
              icon={item.icon}
              title={item.label}
              selected={selectedRole === item.id}
              onPress={() => setSelectedRole(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.list}
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
  list: {
    flex: 1,
    marginTop: ZenSpacing.md,
  },
  listContent: {
    paddingBottom: ZenSpacing.md,
  },
});
