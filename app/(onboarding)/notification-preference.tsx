/**
 * ONB_009: Notification Preference
 * Choose notification style preference
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import OptionCard from './components/OptionCard';
import { Colors, Typography, Spacing } from '@/theme';
import { NOTIFICATION_STYLES } from '@/constants/onboarding';

export default function NotificationPreferenceScreen() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  useEffect(() => {
    // Track analytics: onb_notification_pref_viewed
    // console.log('[Analytics] onb_notification_pref_viewed');
  }, []);

  const handleContinue = () => {
    if (selectedStyle) {
      // Track analytics: onb_notification_style
      // console.log('[Analytics] onb_notification_style:', selectedStyle);
      router.push('./energy-pattern');
    }
  };

  return (
    <OnboardingLayout currentStep={9}>
      <View style={styles.container}>
        <Text style={styles.question}>How should we remind you?</Text>
        <Text style={styles.subtext}>
          Choose your notification style
        </Text>

        <View style={styles.options}>
          {NOTIFICATION_STYLES.map((style) => (
            <OptionCard
              key={style.id}
              title={style.label}
              description={style.description}
              selected={selectedStyle === style.id}
              onPress={() => setSelectedStyle(style.id)}
            />
          ))}
        </View>

        <Text style={styles.note}>
          💡 You can change this anytime in settings
        </Text>

        <View style={styles.spacer} />

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedStyle}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    marginBottom: Spacing.xxs,
  },
  subtext: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    marginBottom: Spacing.md,
  },
  options: {
    marginBottom: Spacing.sm,
  },
  note: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  spacer: {
    flex: 1,
  },
});
