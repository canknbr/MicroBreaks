/**
 * ONB_009: Notification Preference
 * Premium zen design with option cards
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import OptionCard from './components/OptionCard';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { NOTIFICATION_STYLES } from '@/constants/onboarding';

export default function NotificationPreferenceScreen() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedStyle) {
      router.push('./energy-pattern');
    }
  };

  return (
    <OnboardingLayout currentStep={9} ambientColor="purple">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          How should we remind you?
        </HeadlineText>
        <SubheadText delay={100}>
          Choose your notification style
        </SubheadText>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.options}
          showsVerticalScrollIndicator={false}
        >
          {NOTIFICATION_STYLES.map((style) => (
            <OptionCard
              key={style.id}
              title={style.label}
              description={style.description}
              selected={selectedStyle === style.id}
              onPress={() => setSelectedStyle(style.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.noteContainer}>
          <Ionicons name="bulb-outline" size={16} color={ZenColors.accent.main} />
          <Text style={styles.note}>
            You can change this anytime in settings
          </Text>
        </View>

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
  scrollView: {
    flex: 1,
    marginTop: ZenSpacing.md,
  },
  options: {
    paddingBottom: ZenSpacing.md,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ZenSpacing.xs,
    marginBottom: ZenSpacing.md,
    backgroundColor: ZenColors.background.card,
    padding: ZenSpacing.sm,
    borderRadius: ZenRadius.md,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  note: {
    ...ZenTypography.body.small,
    color: ZenColors.text.secondary,
  },
});
