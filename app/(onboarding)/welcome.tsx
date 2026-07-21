import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import WheelSelect from './components/WheelSelect';
import { AccountAccessModal, type AccountAccessMode } from '@/components/profile';
import {
  ACTIVE_ONBOARDING_TOTAL_STEPS,
  PRIMARY_NEEDS,
} from '@/constants/onboarding';
import { useOnboardingStore } from '@/store';

type PrimaryNeedId = (typeof PRIMARY_NEEDS)[number]['id'];

const NEED_DEFAULTS: Record<
  PrimaryNeedId,
  { painAreas: string[]; breakStyle: string[]; energyPattern?: string }
> = {
  eyes: { painAreas: ['eyes'], breakStyle: ['quick'] },
  neck: { painAreas: ['neck', 'shoulders'], breakStyle: ['stretch'] },
  focus: { painAreas: [], breakStyle: ['mindful'] },
  energy: { painAreas: [], breakStyle: ['active'], energyPattern: 'afternoon_slump' },
};

function deriveInitialNeed(
  painAreas: string[],
  breakStyle: string[],
  energyPattern?: string | null
): PrimaryNeedId | null {
  if (painAreas.includes('eyes')) return 'eyes';
  if (painAreas.includes('neck') || painAreas.includes('shoulders')) return 'neck';
  if (breakStyle.includes('mindful')) return 'focus';
  if (breakStyle.includes('active')) return 'energy';
  if (energyPattern === 'afternoon_slump') return 'energy';
  return null;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const skipOnboarding = useOnboardingStore((state) => state.skipOnboarding);
  const onboardingData = useOnboardingStore((state) => state.data);
  const updateData = useOnboardingStore((state) => state.updateData);
  const [selectedNeed, setSelectedNeed] = useState<PrimaryNeedId>(
    deriveInitialNeed(
      onboardingData.painAreas,
      onboardingData.breakStyle,
      onboardingData.energyPattern
    ) ?? (PRIMARY_NEEDS[0].id as PrimaryNeedId)
  );
  const [showAccountAccess, setShowAccountAccess] = useState(false);
  const [accountAccessMode, setAccountAccessMode] = useState<AccountAccessMode>('sign_in');

  const handleStart = () => {
    if (!selectedNeed) return;
    const defaults = NEED_DEFAULTS[selectedNeed];
    updateData({
      painAreas: defaults.painAreas,
      breakStyle: defaults.breakStyle,
      energyPattern: defaults.energyPattern ?? onboardingData.energyPattern,
    });
    router.push('./work-role');
  };

  const handleBrowse = () => {
    skipOnboarding();
    router.replace('/(tabs)');
  };

  const handleRestoreAccount = () => {
    setAccountAccessMode('sign_in');
    setShowAccountAccess(true);
  };

  const handleAccountAccessSuccess = (mode: AccountAccessMode) => {
    if (mode !== 'sign_in') return;
    skipOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}
      showAmbient={false}
      scrollable={false}
    >
      <View style={styles.container}>
        {/* Editorial opening — the app's job, in one line */}
        <View style={styles.top}>
          <Text style={styles.brand}>UNWIND</Text>
          <Text style={styles.headline}>What&apos;s the desk doing to you?</Text>
        </View>

        {/* Choices as a subtle wheel — centered = selected */}
        <View style={styles.menu}>
          <WheelSelect
            options={PRIMARY_NEEDS.map((n) => ({ id: n.id, label: n.label }))}
            value={selectedNeed}
            onChange={(id) => setSelectedNeed(id as PrimaryNeedId)}
          />
        </View>

        {/* Action */}
        <View style={styles.actions}>
          <PrimaryButton
            title="Continue"
            onPress={handleStart}
            size="large"
            variant="primary"
            disabled={!selectedNeed}
          />
          <View style={styles.links}>
            <SecondaryButton title="Skip for now" onPress={handleBrowse} variant="muted" />
            <SecondaryButton title="Restore account" onPress={handleRestoreAccount} variant="accent" />
          </View>
        </View>
      </View>

      <AccountAccessModal
        visible={showAccountAccess}
        mode={accountAccessMode}
        onModeChange={setAccountAccessMode}
        onSuccess={handleAccountAccessSuccess}
        onClose={() => setShowAccountAccess(false)}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 8,
  },
  top: {},
  brand: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 18,
  },
  headline: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
    color: '#FFFFFF',
  },
  menu: {
    marginVertical: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  lead: {
    width: 34,
    justifyContent: 'center',
  },
  bar: {
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
  },
  choice: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 30,
    letterSpacing: -0.6,
  },
  choiceOn: {
    color: '#FFFFFF',
  },
  choiceOff: {
    color: 'rgba(255,255,255,0.3)',
  },
  actions: {
    gap: 6,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
});
