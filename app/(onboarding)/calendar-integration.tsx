/**
 * ONB_018: Calendar Integration (Optional)
 * Optional calendar integration for smart scheduling
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import OptionCard from './components/OptionCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

const CALENDAR_PROVIDERS = [
  { id: 'google', label: 'Google Calendar', icon: '📅' },
  { id: 'outlook', label: 'Outlook / Office 365', icon: '📆' },
  { id: 'apple', label: 'Apple Calendar', icon: '🍎' },
];

export default function CalendarIntegrationScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    // Track analytics: onb_calendar_integration_viewed
    console.log('[Analytics] onb_calendar_integration_viewed');
  }, []);

  const handleConnect = () => {
    if (selectedProvider) {
      // Track analytics: onb_calendar_integration_started
      console.log('[Analytics] onb_calendar_integration_started:', selectedProvider);
      // Simulate OAuth flow
      setTimeout(() => {
        // Track analytics: onb_calendar_integration_completed
        console.log('[Analytics] onb_calendar_integration_completed');
        router.push('/(onboarding)/first-session');
      }, 1000);
    }
  };

  const handleSkip = () => {
    // Track analytics: onb_calendar_integration_skipped
    console.log('[Analytics] onb_calendar_integration_skipped');
    router.push('/(onboarding)/first-session');
  };

  return (
    <OnboardingLayout currentStep={18}>
      <View style={styles.container}>
        <Text style={styles.headline}>Breaks that respect your calendar</Text>
        <Text style={styles.subtext}>Optional, but highly recommended</Text>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🎯</Text>
            <Text style={styles.benefitText}>Auto-pause during meetings</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>🧠</Text>
            <Text style={styles.benefitText}>Smart break scheduling</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>📊</Text>
            <Text style={styles.benefitText}>Daily summary in calendar</Text>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyText}>
            🔒 We only check busy/free status, never read event details
          </Text>
        </View>

        {/* Calendar Providers */}
        <View style={styles.providers}>
          {CALENDAR_PROVIDERS.map((provider) => (
            <OptionCard
              key={provider.id}
              icon={provider.icon}
              title={provider.label}
              selected={selectedProvider === provider.id}
              onPress={() => setSelectedProvider(provider.id)}
            />
          ))}
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Connect Calendar"
          onPress={handleConnect}
          disabled={!selectedProvider}
        />
        <SecondaryButton title="Skip for now" onPress={handleSkip} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headline: {
    ...Typography.titleLarge,
    color: Colors.light.text.primary,
    marginBottom: Spacing.xxs,
  },
  subtext: {
    ...Typography.bodyMedium,
    color: Colors.light.text.secondary,
    marginBottom: Spacing.md,
  },
  benefitsCard: {
    backgroundColor: Colors.light.background.secondary,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: Spacing.xs,
  },
  benefitText: {
    ...Typography.bodyMedium,
    color: Colors.light.text.primary,
    flex: 1,
  },
  privacyNote: {
    backgroundColor: Colors.light.status.successLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  privacyText: {
    ...Typography.bodySmall,
    color: Colors.light.text.primary,
    textAlign: 'center',
  },
  providers: {
    marginBottom: Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
});
