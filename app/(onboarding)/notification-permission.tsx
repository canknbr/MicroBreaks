/**
 * ONB_017: Notification permission — editorial. No banner card / icon-box
 * benefits / bordered trust pills: one example reminder shown as type, a
 * hairline type-list of reassurances, white pill CTA.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ACTIVE_ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';
import { useOnboardingStore } from '@/store';
import {
  requestNotificationPermissions,
  saveNotificationSettings,
} from '@/services/notifications';
import { getCurrentUserId } from '@/services/firebase/auth';
import { registerForPushNotifications } from '@/services/firebase/messaging';
import { applyOnboardingNotificationChoice } from '@/features/onboarding/runtime';

const REASSURANCES = [
  'A gentle nudge about every 30 minutes',
  'Silenced on weekends and in quiet hours',
  'Mute or change the rhythm in one tap',
];

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const updateData = useOnboardingStore((state) => state.updateData);
  const [, setPermissionGranted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnable = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await applyOnboardingNotificationChoice(
        true,
        requestNotificationPermissions,
        {
          updateData,
          saveNotificationSettings,
          getCurrentUserId,
          registerForPushNotifications,
        }
      );
      setPermissionGranted(result.granted);

      if (__DEV__ && result.errors.length > 0) {
        console.warn(
          'Onboarding notification opt-in completed with non-fatal issues:',
          result.errors
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Unexpected notification onboarding failure:', error);
      }
      updateData({ notificationsEnabled: false });
      setPermissionGranted(false);
    }

    setTimeout(() => {
      router.push('./premium-pitch');
    }, 500);
  };

  const handleLater = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await applyOnboardingNotificationChoice(
        false,
        requestNotificationPermissions,
        {
          updateData,
          saveNotificationSettings,
          getCurrentUserId,
          registerForPushNotifications,
        }
      );

      if (__DEV__ && result.errors.length > 0) {
        console.warn(
          'Onboarding notification deferral completed with non-fatal issues:',
          result.errors
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Unexpected notification deferral failure:', error);
      }
      updateData({ notificationsEnabled: false });
    }

    router.push('./premium-pitch');
  };

  return (
    <OnboardingLayout currentStep={6} totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}>
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Do you want reset reminders on by default?
        </HeadlineText>
        <SubheadText delay={100}>
          They help the habit stick, but you stay in control and can change this later.
        </SubheadText>

        {/* Example reminder as type — sets the tone without a fake banner. */}
        <View style={styles.sample}>
          <Text style={styles.sampleLabel}>A REMINDER READS LIKE</Text>
          <Text style={styles.sampleTitle}>Time for a 30-second reset</Text>
          <Text style={styles.sampleBody}>
            Look 20 feet away for 20 seconds — your eyes will thank you.
          </Text>
        </View>

        {/* Reassurances as a hairline type-list with a pink em-dash lead. */}
        <View style={styles.list}>
          {REASSURANCES.map((line, i) => (
            <View key={line} style={[styles.row, i > 0 && styles.divider]}>
              <View style={styles.lead}>
                <View style={styles.bar} />
              </View>
              <Text style={styles.rowText}>{line}</Text>
            </View>
          ))}
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Enable reminders"
          onPress={handleEnable}
          variant="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
        />
        <SecondaryButton
          title="No reminders, thanks"
          onPress={handleLater}
          variant="muted"
          disabled={isSubmitting}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sample: {
    marginTop: 32,
    marginBottom: 8,
  },
  sampleLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 10,
  },
  sampleTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  sampleBody: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
  },
  list: {
    marginTop: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  lead: {
    width: 30,
    justifyContent: 'center',
  },
  bar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
  },
  rowText: {
    flex: 1,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 17,
    letterSpacing: -0.2,
    color: 'rgba(255,255,255,0.85)',
  },
  spacer: {
    flex: 1,
  },
});
