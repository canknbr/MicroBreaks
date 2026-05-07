import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ACTIVE_ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';
import { PaywallContent } from '@/components/subscription';
import { useOnboardingStore } from '@/store';

function getOutcomeLabel(painAreas: string[]): string {
  if (painAreas.includes('eyes')) return 'eye-strain recovery';
  if (painAreas.includes('neck') || painAreas.includes('shoulders')) return 'neck and shoulder relief';
  if (painAreas.includes('lower_back') || painAreas.includes('upper_back')) return 'desk posture recovery';
  return 'desk recovery';
}

export default function PremiumPitchScreen() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state.data);
  const outcomeLabel = getOutcomeLabel(onboardingData.painAreas);

  return (
    <OnboardingLayout
      currentStep={7}
      totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}
      ambientColor="gold"
    >
      <View style={styles.container}>
        <HeadlineText delay={0}>{`Keep building your ${outcomeLabel}`}</HeadlineText>
        <SubheadText delay={100}>
          Free gets you the starter flow. Pro unlocks deeper guided programs, better timing, and stronger weekly recovery insight.
        </SubheadText>

        <View style={styles.paywallContainer}>
          <PaywallContent
            placement="onboarding"
            compactHeader={true}
            onContinueFree={() => router.replace('./completion')}
            onPurchaseSuccess={() => router.replace('./completion')}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  paywallContainer: {
    flex: 1,
    marginTop: 20,
  },
});
