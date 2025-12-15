/**
 * ONB_003: Value Promise & Expectation Setting
 * Premium zen design with animated benefits
 */

import React, { useEffect } from 'react';
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
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';

const BENEFITS = [
  {
    icon: 'fitness-outline',
    title: 'Personalized exercises',
    description: 'Tailored for your specific pain points',
  },
  {
    icon: 'notifications-outline',
    title: 'Smart reminders',
    description: 'That respect your flow state',
  },
  {
    icon: 'analytics-outline',
    title: 'Track improvements',
    description: 'Monitor your health progress',
  },
];

function BenefitCard({ benefit, index }: { benefit: typeof BENEFITS[0]; index: number }) {
  const cardOpacity = useSharedValue(0);
  const cardTranslateX = useSharedValue(-20);

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);
    cardOpacity.value = withDelay(250 + index * 100, withTiming(1, { duration: 400, easing }));
    cardTranslateX.value = withDelay(250 + index * 100, withTiming(0, { duration: 500, easing }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateX: cardTranslateX.value }],
  }));

  return (
    <Animated.View style={[styles.benefitCard, animatedStyle]}>
      <View style={styles.benefitIconContainer}>
        <LinearGradient
          colors={[ZenColors.primary.glow, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons name={benefit.icon as any} size={24} color={ZenColors.primary.main} />
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{benefit.title}</Text>
        <Text style={styles.benefitDescription}>{benefit.description}</Text>
      </View>
    </Animated.View>
  );
}

export default function ValuePromiseScreen() {
  const router = useRouter();

  // Animation values
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    buttonsOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
  }, []);

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handlePersonalize = () => {
    router.push('./work-role');
  };

  return (
    <OnboardingLayout currentStep={3} ambientColor="gold">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          3 minutes to a healthier workday
        </HeadlineText>

        <SubheadText delay={100}>
          Quick setup to personalize your break experience
        </SubheadText>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          {BENEFITS.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </View>

        {/* Trust signals */}
        <View style={styles.trustSignals}>
          <View style={styles.trustItem}>
            <Ionicons name="flash-outline" size={16} color={ZenColors.text.muted} />
            <Text style={styles.trustText}>Quick setup</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color={ZenColors.text.muted} />
            <Text style={styles.trustText}>No spam</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="close-circle-outline" size={16} color={ZenColors.text.muted} />
            <Text style={styles.trustText}>Cancel anytime</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <Animated.View style={buttonsAnimatedStyle}>
          <PrimaryButton
            title="Personalize My Plan"
            onPress={handlePersonalize}
            variant="accent"
          />
        </Animated.View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  benefitsContainer: {
    marginTop: ZenSpacing.xl,
    marginBottom: ZenSpacing.lg,
    gap: ZenSpacing.sm,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ZenColors.background.card,
    padding: ZenSpacing.md,
    borderRadius: ZenRadius.lg,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: ZenRadius.md,
    backgroundColor: ZenColors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ZenSpacing.md,
    overflow: 'hidden',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    ...ZenTypography.title.medium,
    color: ZenColors.text.primary,
    marginBottom: ZenSpacing.xxs,
  },
  benefitDescription: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
    lineHeight: 20,
  },
  trustSignals: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: ZenSpacing.lg,
    marginBottom: ZenSpacing.sm,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ZenSpacing.xxs,
  },
  trustText: {
    ...ZenTypography.body.small,
    color: ZenColors.text.muted,
  },
  spacer: {
    flex: 1,
  },
});
