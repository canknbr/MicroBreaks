/**
 * Recommendation — editorial. The starting plan as type: a bold "start with"
 * hero + a hairline type-list of plan details. No cards / badges / icon boxes.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { ACTIVE_ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';
import { useOnboardingStore } from '@/store/onboardingStore';
import { generatePersonalizedPlan } from '@/services/recommendations/engine';

export default function RecommendationScreen() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state.data);
  const plan = generatePersonalizedPlan(onboardingData);
  const firstRecommendation = plan.topExercises[0] ?? null;

  const PLAN_ITEMS = [
    { label: 'Primary concern', value: plan.primaryConcern },
    { label: 'Recommended focus', value: plan.recommendedFocus },
    { label: 'Suggested rhythm', value: plan.optimalSchedule },
    { label: 'Week-one target', value: plan.weekGoal },
  ];

  const firstTitle = firstRecommendation?.exercise.title ?? 'A short guided reset';
  const firstMeta = firstRecommendation
    ? `${Math.max(1, Math.round(firstRecommendation.exercise.totalDuration / 60))} min · matches your preference`
    : 'A short session to build your first relief win';

  const handleTryBreak = () => router.push('./break-demo');
  const handleAdjust = () => router.back();

  return (
    <OnboardingLayout currentStep={4} totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS} scrollable={false}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.eyebrow}>YOUR STARTING PLAN</Text>
          <Text style={styles.headline}>Here&apos;s the plan we&apos;d start you on.</Text>

          <View style={styles.startBlock}>
            <Text style={styles.startLabel}>START WITH</Text>
            <Text style={styles.startTitle}>{firstTitle}</Text>
            <Text style={styles.startMeta}>{firstMeta}</Text>
            {firstRecommendation?.reason ? (
              <Text style={styles.startReason}>{firstRecommendation.reason}</Text>
            ) : null}
          </View>

          <View style={styles.list}>
            {PLAN_ITEMS.map((item, i) => (
              <View key={item.label} style={[styles.row, i > 0 && styles.divider]}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <PrimaryButton
            title="Try your first break"
            onPress={handleTryBreak}
            size="large"
            variant="primary"
          />
          <SecondaryButton title="Adjust plan" onPress={handleAdjust} variant="muted" />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 16 },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 14,
  },
  headline: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1,
    color: '#FFFFFF',
    marginBottom: 30,
  },
  startBlock: { marginBottom: 26 },
  startLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  startTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 28,
    letterSpacing: -0.6,
    color: '#FF2472',
  },
  startMeta: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  startReason: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 14,
  },
  list: {},
  row: { paddingVertical: 16 },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  rowLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  rowValue: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 18,
    letterSpacing: -0.2,
    color: '#FFFFFF',
  },
  actions: { gap: 6, paddingTop: 8 },
});
