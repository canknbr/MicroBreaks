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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';

const BENEFITS = [
  { icon: 'notifications-outline', text: 'Gentle reminders between tasks' },
  { icon: 'calendar-outline', text: 'Skip when in meetings' },
  { icon: 'options-outline', text: 'Full control over frequency' },
];

export default function NotificationPermissionScreen() {
  const router = useRouter();
  const [permissionGranted, setPermissionGranted] = useState(false);

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
  }, []);

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
    // In real implementation, use expo-notifications
    const granted = true;
    setPermissionGranted(granted);
    setTimeout(() => {
      router.push('./calendar-integration');
    }, 500);
  };

  const handleLater = () => {
    router.push('./calendar-integration');
  };

  return (
    <OnboardingLayout currentStep={17} ambientColor="purple">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Stay healthy without thinking about it
        </HeadlineText>
        <SubheadText delay={100}>
          Get gentle reminders for your break times
        </SubheadText>

        {/* Bell Icon */}
        <Animated.View style={[styles.bellContainer, bellAnimatedStyle]}>
          <LinearGradient
            colors={[ZenColors.primary.glow, 'transparent']}
            style={styles.bellGlow}
          />
          <View style={styles.bellInner}>
            <Ionicons name="notifications" size={64} color={ZenColors.primary.main} />
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
            <Text style={styles.trustText}>No spam</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="pause-outline" size={14} color={ZenColors.text.muted} />
            <Text style={styles.trustText}>Snooze anytime</Text>
          </View>
          <View style={styles.trustBadge}>
            <Ionicons name="sparkles-outline" size={14} color={ZenColors.text.muted} />
            <Text style={styles.trustText}>Smart detection</Text>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Enable Smart Reminders"
          onPress={handleEnable}
          variant="primary"
        />
        <SecondaryButton title="Maybe later" onPress={handleLater} variant="muted" />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bellContainer: {
    alignItems: 'center',
    marginTop: ZenSpacing.xl,
    marginBottom: ZenSpacing.lg,
  },
  bellGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  bellInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: ZenColors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
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
