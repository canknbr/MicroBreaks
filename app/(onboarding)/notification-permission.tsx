/**
 * ONB_017: Notification Permission
 * Request notification permissions with soft pre-prompt
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Track analytics: onb_notification_pre_prompt_shown
    console.log('[Analytics] onb_notification_pre_prompt_shown');
  }, []);

  const handleEnable = async () => {
    // Track analytics: onb_notification_pre_prompt_accepted
    console.log('[Analytics] onb_notification_pre_prompt_accepted');

    // Request system permission
    // In real implementation, use expo-notifications
    const granted = true; // Simulated

    // Track analytics: onb_notification_system_prompt_result
    console.log('[Analytics] onb_notification_system_prompt_result:', granted);
    setPermissionGranted(granted);

    setTimeout(() => {
      router.push('/(onboarding)/calendar-integration');
    }, 500);
  };

  const handleLater = () => {
    // Track analytics: onb_notification_denied
    console.log('[Analytics] onb_notification_denied');
    router.push('/(onboarding)/calendar-integration');
  };

  return (
    <OnboardingLayout currentStep={17}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>

        <Text style={styles.headline}>
          Stay healthy without thinking about it
        </Text>

        <Text style={styles.subtext}>
          Get gentle reminders for your break times
        </Text>

        {/* Benefits */}
        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>
              Gentle reminders between tasks
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>Skip when in meetings</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.benefitText}>Full control over frequency</Text>
          </View>
        </View>

        {/* Trust builders */}
        <View style={styles.trustContainer}>
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>🚫 No spam, ever</Text>
          </View>
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>⏰ Snooze anytime</Text>
          </View>
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>🧠 Smart detection</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Enable Smart Reminders"
          onPress={handleEnable}
        />
        <SecondaryButton title="Maybe later" onPress={handleLater} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  icon: {
    fontSize: 80,
  },
  headline: {
    ...Typography.titleLarge,
    color: Colors.light.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtext: {
    ...Typography.bodyLarge,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  benefits: {
    backgroundColor: Colors.light.background.secondary,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  checkmark: {
    fontSize: 20,
    color: Colors.light.status.success,
    marginRight: Spacing.xs,
  },
  benefitText: {
    ...Typography.bodyMedium,
    color: Colors.light.text.primary,
    flex: 1,
  },
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  trustBadge: {
    backgroundColor: Colors.light.status.successLight,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.sm,
    margin: Spacing.xxs,
  },
  trustText: {
    ...Typography.bodySmall,
    color: Colors.light.text.primary,
  },
  spacer: {
    flex: 1,
  },
});
