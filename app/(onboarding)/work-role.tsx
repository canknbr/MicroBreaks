import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import OptionCard from './components/OptionCard';
import PrimaryButton from './components/PrimaryButton';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenTypography } from './constants/design';
import {
  ACTIVE_ONBOARDING_TOTAL_STEPS,
  SCREEN_TIME_BANDS,
  WORK_PATTERNS,
  WORK_ROLES,
} from '@/constants/onboarding';
import { useOnboardingStore } from '@/store';

export default function WorkRoleScreen() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state.data);
  const updateData = useOnboardingStore((state) => state.updateData);

  const [selectedRole, setSelectedRole] = useState<string | null>(onboardingData.workRole);
  const [selectedScreenTime, setSelectedScreenTime] = useState<number>(
    onboardingData.screenTime ?? 8
  );
  const [selectedPattern, setSelectedPattern] = useState<string>(
    onboardingData.workPattern ?? 'flexible'
  );

  const selectedScreenBandId = useMemo(
    () =>
      SCREEN_TIME_BANDS.find((band) => band.hours === selectedScreenTime)?.id ??
      SCREEN_TIME_BANDS[1].id,
    [selectedScreenTime]
  );

  const handleContinue = () => {
    updateData({
      workRole: selectedRole ?? 'other',
      screenTime: selectedScreenTime,
      workPattern: selectedPattern,
    });
    router.push('./pain-assessment');
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}
      ambientColor="teal"
    >
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Set your work context
        </HeadlineText>

        <SubheadText delay={100}>
          A few defaults help us recommend breaks that fit your actual desk day.
        </SubheadText>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Role</Text>
            <Text style={styles.sectionHelp}>
              Optional, but useful for tailoring language and defaults.
            </Text>
            {WORK_ROLES.map((item) => (
              <OptionCard
                key={item.id}
                icon={item.icon}
                title={item.label}
                selected={selectedRole === item.id}
                onPress={() => setSelectedRole(item.id)}
                variant="compact"
              />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Daily screen time</Text>
            <Text style={styles.sectionHelp}>
              Pick the band that feels closest to a normal workday.
            </Text>
            {SCREEN_TIME_BANDS.map((item) => (
              <OptionCard
                key={item.id}
                title={item.label}
                description={item.description}
                selected={selectedScreenBandId === item.id}
                onPress={() => setSelectedScreenTime(item.hours)}
                variant="compact"
              />
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Work pattern</Text>
            <Text style={styles.sectionHelp}>
              This drives reminder timing and the type of reset we lead with.
            </Text>
            {WORK_PATTERNS.map((pattern) => (
              <OptionCard
                key={pattern.id}
                title={pattern.label}
                description={pattern.description}
                selected={selectedPattern === pattern.id}
                onPress={() => setSelectedPattern(pattern.id)}
              />
            ))}
          </View>
        </ScrollView>

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
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
  section: {
    marginBottom: ZenSpacing.lg,
  },
  sectionLabel: {
    ...ZenTypography.label.large,
    color: ZenColors.text.primary,
    marginBottom: ZenSpacing.xxs,
  },
  sectionHelp: {
    ...ZenTypography.body.small,
    color: ZenColors.text.secondary,
    marginBottom: ZenSpacing.sm,
  },
});
