/**
 * ONB_021: Completion Celebration
 * Success state and transition to app
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

export default function CompletionScreen() {
  const router = useRouter();

  useEffect(() => {
    // Track analytics: onb_completed
    console.log('[Analytics] onb_completed', {
      completion_time: Date.now(),
      screens_completed: 21,
    });
  }, []);

  const handleGoToDashboard = () => {
    // Track analytics: onb_dashboard_entered
    console.log('[Analytics] onb_dashboard_entered');
    router.replace('/(tabs)');
  };

  return (
    <OnboardingLayout currentStep={21} showProgress={false}>
      <View style={styles.container}>
        {/* Confetti animation placeholder */}
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebration}>🎉</Text>
          <Text style={styles.headline}>You're all set!</Text>
        </View>

        {/* Achievement Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>🏆</Text>
            <Text style={styles.badgeTitle}>Health Pioneer</Text>
            <Text style={styles.badgeSubtext}>First badge earned</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>⏰</Text>
            <Text style={styles.summaryValue}>50 min</Text>
            <Text style={styles.summaryLabel}>First break in</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryValue}>Starting</Text>
            <Text style={styles.summaryLabel}>Health score</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🎯</Text>
            <Text style={styles.summaryValue}>10 breaks</Text>
            <Text style={styles.summaryLabel}>Weekly goal</Text>
          </View>
        </View>

        {/* Progress Ring */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRing}>
            <Text style={styles.progressValue}>0%</Text>
          </View>
          <Text style={styles.progressLabel}>
            Your journey to better health starts now
          </Text>
        </View>

        {/* Tip */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>
            💡 Keep the app open for best results
          </Text>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton title="Go to Dashboard" onPress={handleGoToDashboard} />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  celebration: {
    fontSize: 80,
    marginBottom: Spacing.sm,
  },
  headline: {
    ...Typography.headlineLarge,
    color: Colors.light.text.primary,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  badge: {
    backgroundColor: Colors.light.status.warningLight,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: 'center',
    width: '80%',
    borderWidth: 3,
    borderColor: Colors.light.status.warning,
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: Spacing.xs,
  },
  badgeTitle: {
    ...Typography.titleMedium,
    color: Colors.light.text.primary,
    marginBottom: Spacing.xxs,
  },
  badgeSubtext: {
    ...Typography.bodySmall,
    color: Colors.light.text.secondary,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.light.background.secondary,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: Spacing.xxs,
  },
  summaryValue: {
    ...Typography.bodyLargeBold,
    color: Colors.light.text.primary,
    marginBottom: 2,
  },
  summaryLabel: {
    ...Typography.bodySmall,
    color: Colors.light.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.background.secondary,
    borderWidth: 8,
    borderColor: Colors.light.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  progressValue: {
    ...Typography.headlineLarge,
    color: Colors.light.brand.primary,
    fontWeight: 'bold',
  },
  progressLabel: {
    ...Typography.bodyMedium,
    color: Colors.light.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  tipContainer: {
    backgroundColor: Colors.light.status.infoLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  tipText: {
    ...Typography.bodySmall,
    color: Colors.light.text.primary,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
});
