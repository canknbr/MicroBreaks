/**
 * Onboarding completion — editorial. No emoji / badge card / ring: a bold
 * "you're all set" statement + a type-list of what to expect + white CTA.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { useOnboardingStore, useUserStore, useNotificationStore } from '@/store';
import { useTimerStore } from '@/store/timerStore';
import { ACTIVE_ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';
import { calculateWeeklyGoalFromBreakInterval } from '@/utils/validation';
import { saveNotificationSettings } from '@/services/notifications';
import { syncOnboardingRuntimeState } from '@/features/onboarding/runtime';

function getRecoveryFocusLabel(painAreas: string[]): string {
  if (painAreas.includes('eyes')) return 'Eye relief';
  if (painAreas.includes('neck') || painAreas.includes('shoulders')) return 'Neck reset';
  if (painAreas.includes('lower_back') || painAreas.includes('upper_back')) return 'Posture recovery';
  if (painAreas.includes('wrists') || painAreas.includes('hands')) return 'Hand relief';
  return 'Starter plan';
}

export default function CompletionScreen() {
  const router = useRouter();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const onboardingData = useOnboardingStore((s) => s.data);

  const setWeeklyGoal = useUserStore((s) => s.setWeeklyGoal);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const unlockAchievement = useUserStore((s) => s.unlockAchievement);
  const addXP = useUserStore((s) => s.addXP);
  const setCustomDurations = useTimerStore((s) => s.setCustomDurations);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const weeklyGoal = calculateWeeklyGoalFromBreakInterval(onboardingData.breakInterval);
  const recoveryFocusLabel = getRecoveryFocusLabel(onboardingData.painAreas);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleGoToDashboard = async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      const result = await syncOnboardingRuntimeState(onboardingData, {
        setWeeklyGoal,
        saveNotificationSettings,
        setCustomDurations,
        updateProfile,
        unlockAchievement,
        addXP,
        addNotification,
      });
      if (__DEV__ && result.errors.length > 0) {
        console.warn('Onboarding runtime sync completed with non-fatal issues:', result.errors);
      }
    } catch (error) {
      if (__DEV__) console.warn('Unexpected onboarding completion failure:', error);
    }
    try {
      completeOnboarding();
    } finally {
      router.replace('/(tabs)');
    }
  };

  const METRICS = [
    { value: `${onboardingData.breakInterval}`, unit: 'min', label: 'FIRST BREAK IN', mono: true },
    { value: recoveryFocusLabel, unit: '', label: 'RECOVERY FOCUS', mono: false },
    { value: `${weeklyGoal}`, unit: 'breaks', label: 'WEEKLY GOAL', mono: true },
  ];

  return (
    <OnboardingLayout
      currentStep={ACTIVE_ONBOARDING_TOTAL_STEPS}
      totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}
      showProgress={false}
      scrollable={false}
    >
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.eyebrow}>YOU&apos;RE ALL SET</Text>
          <Text style={styles.headline}>Your recovery starts now.</Text>
          <Text style={styles.subhead}>
            We&apos;ve tuned a plan around how you work. Here&apos;s what to expect.
          </Text>

          <View style={styles.list}>
            {METRICS.map((m, i) => (
              <View key={m.label} style={[styles.row, i > 0 && styles.divider]}>
                <Text style={m.mono ? styles.rowValueMono : styles.rowValueText}>
                  {m.value}
                  {m.unit ? <Text style={styles.rowUnit}> {m.unit}</Text> : null}
                </Text>
                <Text style={styles.rowLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.tip}>
            Reminders help you come back, but you can start a reset anytime from Home.
          </Text>
        </ScrollView>

        <PrimaryButton
          title="Go to home"
          onPress={handleGoToDashboard}
          size="large"
          variant="primary"
          disabled={isCompleting}
          loading={isCompleting}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 16 },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 14,
  },
  headline: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -1.2,
    color: '#FFFFFF',
  },
  subhead: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    marginBottom: 12,
  },
  list: { marginTop: 12 },
  row: { paddingVertical: 18 },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  rowValueMono: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 30,
    letterSpacing: -1,
    color: '#FFFFFF',
  },
  rowValueText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 26,
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  rowUnit: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  rowLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 6,
  },
  tip: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 24,
  },
});
