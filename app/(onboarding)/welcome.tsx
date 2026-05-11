import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingLayout from './components/OnboardingLayout';
import OptionCard from './components/OptionCard';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText, SubheadText, DisplayText } from './components/AnimatedText';
import { ZenColors, ZenSpacing } from './constants/design';
import { AccountAccessModal, type AccountAccessMode } from '@/components/profile';
import {
  ACTIVE_ONBOARDING_TOTAL_STEPS,
  PRIMARY_NEEDS,
} from '@/constants/onboarding';
import { useOnboardingStore } from '@/store';

type PrimaryNeedId = (typeof PRIMARY_NEEDS)[number]['id'];

const NEED_DEFAULTS: Record<
  PrimaryNeedId,
  {
    painAreas: string[];
    breakStyle: string[];
    energyPattern?: string;
  }
> = {
  eyes: {
    painAreas: ['eyes'],
    breakStyle: ['quick'],
  },
  neck: {
    painAreas: ['neck', 'shoulders'],
    breakStyle: ['stretch'],
  },
  focus: {
    painAreas: [],
    breakStyle: ['mindful'],
  },
  energy: {
    painAreas: [],
    breakStyle: ['active'],
    energyPattern: 'afternoon_slump',
  },
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
  const [selectedNeed, setSelectedNeed] = useState<PrimaryNeedId | null>(
    deriveInitialNeed(
      onboardingData.painAreas,
      onboardingData.breakStyle,
      onboardingData.energyPattern
    )
  );
  const [showAccountAccess, setShowAccountAccess] = useState(false);
  const [accountAccessMode, setAccountAccessMode] = useState<AccountAccessMode>('sign_in');

  const logoScale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const actionsOpacity = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    logoOpacity.value = withDelay(120, withTiming(1, { duration: 450, easing }));
    logoScale.value = withDelay(120, withTiming(1, { duration: 500, easing }));
    contentOpacity.value = withDelay(220, withTiming(1, { duration: 420, easing }));
    actionsOpacity.value = withDelay(360, withTiming(1, { duration: 420, easing }));
  }, [actionsOpacity, contentOpacity, logoOpacity, logoScale]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const actionsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: actionsOpacity.value,
  }));

  const selectedNeedCopy = useMemo(
    () => PRIMARY_NEEDS.find((need) => need.id === selectedNeed),
    [selectedNeed]
  );

  const handleStart = () => {
    if (!selectedNeed) {
      return;
    }

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
    if (mode !== 'sign_in') {
      return;
    }

    skipOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}
      showAmbient={true}
      ambientColor="teal"
    >
      <View style={styles.container}>
        <Animated.View style={[styles.logoSection, logoAnimatedStyle]}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[ZenColors.primary.main, ZenColors.primary.dark]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <DisplayText style={styles.logoText}>M</DisplayText>
            </LinearGradient>
          </View>
        </Animated.View>

        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <DisplayText delay={0} style={styles.brandText}>
            MicroBreaks
          </DisplayText>
          <HeadlineText delay={80} style={styles.headline}>
            What do you want help with first?
          </HeadlineText>
          <SubheadText delay={140} style={styles.subhead}>
            We&apos;ll build a shorter setup around the work problem you want to fix right now.
          </SubheadText>

          <View style={styles.options}>
            {PRIMARY_NEEDS.map((need) => (
              <OptionCard
                key={need.id}
                icon={need.icon}
                title={need.label}
                description={need.description}
                selected={selectedNeed === need.id}
                onPress={() => setSelectedNeed(need.id)}
              />
            ))}
          </View>

          {selectedNeedCopy && (
            <View style={styles.selectedHint}>
              <View style={styles.selectedHintDot} />
              <SubheadText style={styles.selectedHintText}>
                {`We'll start with ${selectedNeedCopy.label.toLowerCase()} and tune the rest in a few quick steps.`}
              </SubheadText>
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.actions, actionsAnimatedStyle]}>
          <PrimaryButton
            title="Build My Plan"
            onPress={handleStart}
            size="large"
            variant="primary"
            disabled={!selectedNeed}
            style={styles.primaryButton}
          />
          <SecondaryButton
            title="Skip setup"
            onPress={handleBrowse}
            variant="muted"
          />
          <SecondaryButton
            title="Restore linked account"
            onPress={handleRestoreAccount}
            variant="accent"
          />
        </Animated.View>
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
    paddingVertical: ZenSpacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: ZenSpacing.md,
  },
  logoContainer: {
    width: 84,
    height: 84,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: ZenColors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: ZenColors.text.inverse,
    marginBottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  brandText: {
    textAlign: 'center',
    marginBottom: ZenSpacing.md,
  },
  headline: {
    textAlign: 'center',
    marginBottom: ZenSpacing.sm,
  },
  subhead: {
    textAlign: 'center',
    marginBottom: ZenSpacing.lg,
  },
  options: {
    marginBottom: ZenSpacing.md,
  },
  selectedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ZenSpacing.xs,
    paddingHorizontal: ZenSpacing.sm,
  },
  selectedHintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ZenColors.primary.main,
  },
  selectedHintText: {
    flex: 1,
    textAlign: 'center',
  },
  actions: {
    marginTop: ZenSpacing.lg,
  },
  primaryButton: {
    marginBottom: ZenSpacing.xs,
  },
});
