import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import WheelSelect from './components/WheelSelect';
import { HeadlineText, SubheadText } from './components/AnimatedText';
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

  const [selectedRole, setSelectedRole] = useState<string>(
    onboardingData.workRole ?? WORK_ROLES[0].id
  );
  const [selectedScreenTime, setSelectedScreenTime] = useState<number>(
    onboardingData.screenTime ?? 8
  );
  const [selectedPattern, setSelectedPattern] = useState<string>(
    onboardingData.workPattern ?? WORK_PATTERNS[0].id
  );

  const roleOptions = useMemo(() => WORK_ROLES.map((r) => ({ id: r.id, label: r.label })), []);
  const screenOptions = useMemo(
    () => SCREEN_TIME_BANDS.map((b) => ({ id: b.id, label: b.label })),
    []
  );
  const patternOptions = useMemo(
    () => WORK_PATTERNS.map((p) => ({ id: p.id, label: p.label })),
    []
  );

  const selectedScreenBandId = useMemo(
    () =>
      SCREEN_TIME_BANDS.find((band) => band.hours === selectedScreenTime)?.id ??
      SCREEN_TIME_BANDS[1].id,
    [selectedScreenTime]
  );

  const handleScreenChange = (id: string) => {
    const band = SCREEN_TIME_BANDS.find((b) => b.id === id);
    if (band) setSelectedScreenTime(band.hours);
  };

  const handleContinue = () => {
    updateData({
      workRole: selectedRole,
      screenTime: selectedScreenTime,
      workPattern: selectedPattern,
    });
    router.push('./pain-assessment');
  };

  return (
    <OnboardingLayout currentStep={2} totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}>
      <View style={styles.container}>
        <HeadlineText delay={0}>Set your work context</HeadlineText>
        <SubheadText delay={100}>
          Spin each dial to what fits your desk day — we tune the recommendations to it.
        </SubheadText>

        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>ROLE</Text>
            <WheelSelect
              options={roleOptions}
              value={selectedRole}
              onChange={setSelectedRole}
              itemHeight={44}
              visibleCount={3}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>DAILY SCREEN TIME</Text>
            <WheelSelect
              options={screenOptions}
              value={selectedScreenBandId}
              onChange={handleScreenChange}
              itemHeight={44}
              visibleCount={3}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>WORK PATTERN</Text>
            <WheelSelect
              options={patternOptions}
              value={selectedPattern}
              onChange={setSelectedPattern}
              itemHeight={44}
              visibleCount={3}
            />
          </View>
        </View>

        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fields: {
    flex: 1,
    justifyContent: 'space-around',
    marginVertical: 4,
  },
  field: {},
  fieldLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 2,
  },
});
