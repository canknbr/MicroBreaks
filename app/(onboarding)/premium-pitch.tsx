/**
 * ONB_020: Premium Soft Pitch
 * Premium zen design with smooth animations
 */

import React, { useEffect, useState } from 'react';
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
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { PREMIUM_FEATURES } from '@/constants/onboarding';

export default function PremiumPitchScreen() {
  const router = useRouter();
  const [timeLeft] = useState(24 * 60);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.95);
  const comparisonOpacity = useSharedValue(0);
  const offerOpacity = useSharedValue(0);
  const offerScale = useSharedValue(0.95);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 500, easing }));
    headerScale.value = withDelay(100, withTiming(1, { duration: 600, easing }));
    comparisonOpacity.value = withDelay(250, withTiming(1, { duration: 400, easing }));
    offerOpacity.value = withDelay(400, withTiming(1, { duration: 500, easing }));
    offerScale.value = withDelay(400, withTiming(1, { duration: 600, easing }));
    buttonsOpacity.value = withDelay(550, withTiming(1, { duration: 400, easing }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const comparisonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: comparisonOpacity.value,
    transform: [{ translateY: interpolate(comparisonOpacity.value, [0, 1], [10, 0]) }],
  }));

  const offerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: offerScale.value }],
    opacity: offerOpacity.value,
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleStartTrial = () => {
    router.push('./completion');
  };

  const handleContinueFree = () => {
    router.push('./completion');
  };

  const formatTimeLeft = () => {
    const hours = Math.floor(timeLeft / 60);
    return `${hours} hours`;
  };

  return (
    <OnboardingLayout currentStep={20} ambientColor="gold">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color={ZenColors.accent.main} />
            <Text style={styles.badgeText}>LIMITED TIME OFFER</Text>
          </View>
          <Text style={styles.headline}>Your personalized plan is ready!</Text>
        </Animated.View>

        {/* Comparison Table */}
        <Animated.View style={[styles.comparison, comparisonAnimatedStyle]}>
          <View style={styles.comparisonHeader}>
            <View style={styles.comparisonLabel} />
            <View style={styles.comparisonColumn}>
              <Text style={styles.columnTitle}>Free</Text>
            </View>
            <View style={[styles.comparisonColumn, styles.premiumColumn]}>
              <LinearGradient
                colors={[ZenColors.primary.glow, 'transparent']}
                style={styles.premiumGlow}
              />
              <Text style={[styles.columnTitle, styles.premiumTitle]}>Premium</Text>
            </View>
          </View>

          {PREMIUM_FEATURES.map((item, index) => (
            <View key={index} style={styles.comparisonRow}>
              <View style={styles.featureLabel}>
                <Text style={styles.featureName}>{item.feature}</Text>
              </View>
              <View style={styles.comparisonColumn}>
                <Text style={styles.featureValue}>
                  {typeof item.free === 'boolean' ? (
                    <Ionicons
                      name={item.free ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={item.free ? ZenColors.primary.main : ZenColors.text.muted}
                    />
                  ) : item.free}
                </Text>
              </View>
              <View style={styles.comparisonColumn}>
                <Text style={styles.featureValue}>
                  {typeof item.premium === 'boolean' ? (
                    <Ionicons
                      name={item.premium ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={item.premium ? ZenColors.primary.main : ZenColors.text.muted}
                    />
                  ) : item.premium}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Special Offer */}
        <Animated.View style={[styles.offerCard, offerAnimatedStyle]}>
          <LinearGradient
            colors={[ZenColors.primary.main, ZenColors.secondary.main]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.offerGradient}
          >
            <Text style={styles.offerTitle}>Special Offer</Text>
            <Text style={styles.offerPrice}>7-day free trial</Text>
            <Text style={styles.offerDetails}>Then $4.99/month • Cancel anytime</Text>
            <View style={styles.urgencyBadge}>
              <Ionicons name="time-outline" size={14} color={ZenColors.accent.main} />
              <Text style={styles.urgencyText}>
                50% off first month - Expires in {formatTimeLeft()}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Social Proof */}
        <View style={styles.socialProof}>
          <Text style={styles.socialProofText}>
            Join <Text style={styles.highlight}>100,000+</Text> users who chose Premium
          </Text>
        </View>

        <Animated.View style={buttonsAnimatedStyle}>
          <PrimaryButton
            title="Start 7-Day Free Trial"
            onPress={handleStartTrial}
            size="large"
            variant="accent"
          />
          <SecondaryButton
            title="Continue with Free"
            onPress={handleContinueFree}
            variant="muted"
          />
        </Animated.View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    paddingBottom: ZenSpacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: ZenSpacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ZenSpacing.xxs,
    backgroundColor: ZenColors.background.card,
    paddingHorizontal: ZenSpacing.sm,
    paddingVertical: ZenSpacing.xs,
    borderRadius: ZenRadius.full,
    marginBottom: ZenSpacing.sm,
    borderWidth: 1,
    borderColor: ZenColors.accent.glow,
  },
  badgeText: {
    ...ZenTypography.caption,
    color: ZenColors.accent.main,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headline: {
    ...ZenTypography.headline.medium,
    color: ZenColors.text.primary,
    textAlign: 'center',
  },
  comparison: {
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    padding: ZenSpacing.sm,
    marginBottom: ZenSpacing.md,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingBottom: ZenSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ZenColors.border.subtle,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: ZenSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: ZenColors.border.subtle,
  },
  comparisonLabel: {
    flex: 2,
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumColumn: {
    backgroundColor: ZenColors.background.cardHover,
    borderRadius: ZenRadius.md,
    marginVertical: -ZenSpacing.xxs,
    overflow: 'hidden',
  },
  premiumGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  columnTitle: {
    ...ZenTypography.label.medium,
    color: ZenColors.text.secondary,
  },
  premiumTitle: {
    color: ZenColors.primary.main,
  },
  featureLabel: {
    flex: 2,
    justifyContent: 'center',
  },
  featureName: {
    ...ZenTypography.body.small,
    color: ZenColors.text.primary,
  },
  featureValue: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.primary,
  },
  offerCard: {
    borderRadius: ZenRadius.xl,
    overflow: 'hidden',
    marginBottom: ZenSpacing.md,
  },
  offerGradient: {
    padding: ZenSpacing.lg,
    alignItems: 'center',
  },
  offerTitle: {
    ...ZenTypography.label.large,
    color: ZenColors.text.inverse,
    marginBottom: ZenSpacing.xs,
  },
  offerPrice: {
    ...ZenTypography.display.small,
    color: ZenColors.text.inverse,
    marginBottom: ZenSpacing.xs,
  },
  offerDetails: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.inverse,
    opacity: 0.9,
    marginBottom: ZenSpacing.md,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZenColors.background.card,
    paddingHorizontal: ZenSpacing.sm,
    paddingVertical: ZenSpacing.xs,
    borderRadius: ZenRadius.full,
    gap: ZenSpacing.xxs,
  },
  urgencyText: {
    ...ZenTypography.caption,
    color: ZenColors.text.secondary,
  },
  socialProof: {
    alignItems: 'center',
    marginBottom: ZenSpacing.md,
  },
  socialProofText: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
  },
  highlight: {
    ...ZenTypography.label.medium,
    color: ZenColors.primary.main,
  },
});
