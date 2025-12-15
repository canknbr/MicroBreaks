/**
 * ONB_018: Calendar Integration (Optional)
 * Premium zen design with smooth animations
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import OptionCard from './components/OptionCard';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';

const CALENDAR_PROVIDERS = [
  { id: 'google', label: 'Google Calendar', icon: '📅' },
  { id: 'outlook', label: 'Outlook / Office 365', icon: '📆' },
  { id: 'apple', label: 'Apple Calendar', icon: '🍎' },
];

const BENEFITS = [
  { icon: 'pause-circle-outline', text: 'Auto-pause during meetings' },
  { icon: 'calendar-outline', text: 'Smart break scheduling' },
  { icon: 'document-text-outline', text: 'Daily summary in calendar' },
];

export default function CalendarIntegrationScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Animation values
  const benefitsOpacity = useSharedValue(0);
  const privacyOpacity = useSharedValue(0);
  const providersOpacity = useSharedValue(0);

  useEffect(() => {
    benefitsOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    privacyOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    providersOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
  }, []);

  const benefitsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: benefitsOpacity.value,
    transform: [{ translateY: interpolate(benefitsOpacity.value, [0, 1], [20, 0]) }],
  }));

  const privacyAnimatedStyle = useAnimatedStyle(() => ({
    opacity: privacyOpacity.value,
  }));

  const providersAnimatedStyle = useAnimatedStyle(() => ({
    opacity: providersOpacity.value,
    transform: [{ translateY: interpolate(providersOpacity.value, [0, 1], [20, 0]) }],
  }));

  const handleConnect = () => {
    if (selectedProvider) {
      setTimeout(() => {
        router.push('./first-session');
      }, 1000);
    }
  };

  const handleSkip = () => {
    router.push('./first-session');
  };

  return (
    <OnboardingLayout currentStep={18} ambientColor="teal">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Breaks that respect your calendar
        </HeadlineText>
        <SubheadText delay={100}>
          Optional, but highly recommended
        </SubheadText>

        {/* Benefits */}
        <Animated.View style={[styles.benefitsCard, benefitsAnimatedStyle]}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.benefitIconContainer}>
                <Ionicons name={benefit.icon as any} size={20} color={ZenColors.primary.main} />
              </View>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Privacy Note */}
        <Animated.View style={[styles.privacyNote, privacyAnimatedStyle]}>
          <Ionicons name="shield-checkmark-outline" size={16} color={ZenColors.primary.main} />
          <Text style={styles.privacyText}>
            We only check busy/free status, never read event details
          </Text>
        </Animated.View>

        {/* Calendar Providers */}
        <Animated.View style={providersAnimatedStyle}>
          <ScrollView
            style={styles.providersScroll}
            contentContainerStyle={styles.providers}
            showsVerticalScrollIndicator={false}
          >
            {CALENDAR_PROVIDERS.map((provider) => (
              <OptionCard
                key={provider.id}
                icon={provider.icon}
                title={provider.label}
                selected={selectedProvider === provider.id}
                onPress={() => setSelectedProvider(provider.id)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Connect Calendar"
          onPress={handleConnect}
          disabled={!selectedProvider}
          variant="primary"
        />
        <SecondaryButton title="Skip for now" onPress={handleSkip} variant="muted" />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  benefitsCard: {
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    padding: ZenSpacing.md,
    marginTop: ZenSpacing.md,
    marginBottom: ZenSpacing.md,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ZenSpacing.sm,
  },
  benefitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: ZenRadius.md,
    backgroundColor: ZenColors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ZenSpacing.sm,
  },
  benefitText: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.primary,
    flex: 1,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZenColors.background.card,
    padding: ZenSpacing.sm,
    borderRadius: ZenRadius.lg,
    marginBottom: ZenSpacing.md,
    gap: ZenSpacing.xs,
    borderWidth: 1,
    borderColor: ZenColors.primary.glow,
  },
  privacyText: {
    ...ZenTypography.body.small,
    color: ZenColors.text.secondary,
    flex: 1,
  },
  providersScroll: {
    flex: 1,
  },
  providers: {
    paddingBottom: ZenSpacing.md,
  },
  spacer: {
    flex: 1,
  },
});
