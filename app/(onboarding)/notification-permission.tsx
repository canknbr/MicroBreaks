/**
 * ONB_017: Notification Permission
 * Premium zen design with smooth animations
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { ACTIVE_ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';
import { useOnboardingStore } from '@/store';
import {
  requestNotificationPermissions,
  saveNotificationSettings,
} from '@/services/notifications';
import { getCurrentUserId } from '@/services/firebase/auth';
import { registerForPushNotifications } from '@/services/firebase/messaging';
import { applyOnboardingNotificationChoice } from '@/features/onboarding/runtime';

const BENEFITS = [
  { icon: 'eye-outline', text: 'Stay focused without burning out your eyes' },
  { icon: 'options-outline', text: 'Mute or change frequency in one tap' },
  { icon: 'moon-outline', text: 'Silenced on weekends and in quiet hours' },
];

const SAMPLE_NOTIFICATION = {
  appName: 'MicroBreaks',
  title: 'Time for a 30 sec reset',
  body: 'Look 20 feet away for 20 seconds — your eyes will thank you.',
  meta: 'now',
};

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const updateData = useOnboardingStore((state) => state.updateData);
  const [, setPermissionGranted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const bellOpacity = useSharedValue(0);
  const bellScale = useSharedValue(0.9);
  const benefitsOpacity = useSharedValue(0);
  const trustOpacity = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    bellOpacity.value = withDelay(200, withTiming(1, { duration: 500, easing }));
    bellScale.value = withDelay(200, withTiming(1, { duration: 600, easing }));
    benefitsOpacity.value = withDelay(350, withTiming(1, { duration: 400, easing }));
    trustOpacity.value = withDelay(500, withTiming(1, { duration: 400, easing }));
  }, [bellOpacity, bellScale, benefitsOpacity, trustOpacity]);

  const bellAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bellOpacity.value,
    transform: [{ scale: bellScale.value }],
  }));

  const benefitsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: benefitsOpacity.value,
    transform: [{ translateY: interpolate(benefitsOpacity.value, [0, 1], [20, 0]) }],
  }));

  const trustAnimatedStyle = useAnimatedStyle(() => ({
    opacity: trustOpacity.value,
  }));

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
    <OnboardingLayout
      currentStep={6}
      totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}
      ambientColor="purple"
    >
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Do you want reset reminders on by default?
        </HeadlineText>
        <SubheadText delay={100}>
          They help the habit stick, but you stay in control and can change this later.
        </SubheadText>

        {/* Sample notification preview — sets accurate expectations about
            cadence and tone before the user grants permission. */}
        <Animated.View
          style={[styles.sampleContainer, bellAnimatedStyle]}
          accessible
          accessibilityRole="image"
          accessibilityLabel={`Preview: ${SAMPLE_NOTIFICATION.title}. ${SAMPLE_NOTIFICATION.body}`}
        >
          <Text style={styles.sampleHint}>You&apos;ll see something like this:</Text>
          <View style={styles.sampleBanner}>
            <View style={styles.sampleIcon}>
              <Ionicons name="notifications" size={20} color={ZenColors.primary.main} />
            </View>
            <View style={styles.sampleContent}>
              <View style={styles.sampleHeader}>
                <Text style={styles.sampleAppName}>{SAMPLE_NOTIFICATION.appName}</Text>
                <Text style={styles.sampleMeta}>{SAMPLE_NOTIFICATION.meta}</Text>
              </View>
              <Text style={styles.sampleTitle}>{SAMPLE_NOTIFICATION.title}</Text>
              <Text style={styles.sampleBody}>{SAMPLE_NOTIFICATION.body}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Benefits */}
        <Animated.View style={[styles.benefits, benefitsAnimatedStyle]}>
          {BENEFITS.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon as any} size={20} color={ZenColors.primary.main} />
              </View>
              <Text style={styles.benefitText}>{benefit.text}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Trust builders */}
        <Animated.View style={[styles.trustContainer, trustAnimatedStyle]}>
          <View style={styles.trustBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={ZenColors.text.muted} />
            <Text style={styles.trustText}>Easy to mute</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="pause-outline" size={14} color={ZenColors.text.muted} />
            <Text style={styles.trustText}>Adjust anytime</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="time-outline" size={14} color={ZenColors.text.muted} />
            <Text style={styles.trustText}>Built for workdays</Text>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Enable Reminders"
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
  sampleContainer: {
    marginTop: ZenSpacing.lg,
    marginBottom: ZenSpacing.md,
  },
  sampleHint: {
    ...ZenTypography.caption,
    color: ZenColors.text.muted,
    textAlign: 'center',
    marginBottom: ZenSpacing.xs,
  },
  sampleBanner: {
    flexDirection: 'row',
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.lg,
    padding: ZenSpacing.sm,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
    gap: ZenSpacing.sm,
  },
  sampleIcon: {
    width: 36,
    height: 36,
    borderRadius: ZenRadius.sm,
    backgroundColor: ZenColors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleContent: {
    flex: 1,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  sampleAppName: {
    ...ZenTypography.caption,
    color: ZenColors.text.muted,
    fontWeight: '600',
  },
  sampleMeta: {
    ...ZenTypography.caption,
    color: ZenColors.text.muted,
  },
  sampleTitle: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.primary,
    fontWeight: '600',
  },
  sampleBody: {
    ...ZenTypography.caption,
    color: ZenColors.text.secondary,
    marginTop: 1,
  },
  benefits: {
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    padding: ZenSpacing.md,
    marginBottom: ZenSpacing.md,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ZenSpacing.sm,
  },
  benefitIcon: {
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
  trustContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: ZenSpacing.xs,
    marginBottom: ZenSpacing.sm,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZenColors.background.card,
    paddingHorizontal: ZenSpacing.sm,
    paddingVertical: ZenSpacing.xs,
    borderRadius: ZenRadius.full,
    gap: ZenSpacing.xxs,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  trustText: {
    ...ZenTypography.caption,
    color: ZenColors.text.muted,
  },
  spacer: {
    flex: 1,
  },
});
