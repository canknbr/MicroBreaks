/**
 * ONB_019: First Session Start
 * Ready to start the first work session
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

export default function FirstSessionScreen() {
  const router = useRouter();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);

  useEffect(() => {
    // Track analytics: onb_first_session_viewed
    // console.log('[Analytics] onb_first_session_viewed');
  }, []);

  const handleStart = () => {
    // Track analytics: onb_first_session_started
    // console.log('[Analytics] onb_first_session_started', {
      // notifications: notificationsOn,
      // sound: soundOn,
      // vibration: vibrationOn,
    // });
    router.push('./premium-pitch');
  };

  const handleExplore = () => {
    // Track analytics: onb_first_session_deferred
    // console.log('[Analytics] onb_first_session_deferred');
    router.push('./premium-pitch');
  };

  return (
    <OnboardingLayout currentStep={19}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headline}>
            Ready for your first focused session?
          </Text>
        </View>

        {/* Timer Display */}
        <View style={styles.timerCard}>
          <Text style={styles.timerValue}>50:00</Text>
          <Text style={styles.timerLabel}>Deep Work Session</Text>
          <Text style={styles.timerSubtext}>Your first break in 50 minutes</Text>
        </View>

        {/* Quick Settings */}
        <View style={styles.settings}>
          <Text style={styles.settingsTitle}>Quick Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={setNotificationsOn}
              trackColor={{
                false: Colors.dark.border.default,
                true: Colors.dark.brand.primary,
              }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound</Text>
            </View>
            <Switch
              value={soundOn}
              onValueChange={setSoundOn}
              trackColor={{
                false: Colors.dark.border.default,
                true: Colors.dark.brand.primary,
              }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Vibration</Text>
            </View>
            <Switch
              value={vibrationOn}
              onValueChange={setVibrationOn}
              trackColor={{
                false: Colors.dark.border.default,
                true: Colors.dark.brand.primary,
              }}
            />
          </View>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton title="Start Working" onPress={handleStart} />
        <SecondaryButton title="Explore first" onPress={handleExplore} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  headline: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  timerCard: {
    backgroundColor: Colors.dark.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  timerValue: {
    ...Typography.displayLarge,
    color: Colors.dark.brand.primary,
    fontWeight: 'bold',
  },
  timerLabel: {
    ...Typography.titleMedium,
    color: Colors.dark.text.primary,
    marginTop: Spacing.xs,
  },
  timerSubtext: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    marginTop: Spacing.xxs,
  },
  settings: {
    backgroundColor: Colors.dark.background.secondary,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
  },
  settingsTitle: {
    ...Typography.bodyLargeBold,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.primary,
  },
  spacer: {
    flex: 1,
  },
});
