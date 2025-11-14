/**
 * ONB_008: Ergonomic Setup Assessment
 * Quick checklist for ergonomic evaluation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';
import { ERGONOMIC_CHECKLIST } from '@/constants/onboarding';

export default function ErgonomicSetupScreen() {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Track analytics: onb_ergo_assessment_viewed
    console.log('[Analytics] onb_ergo_assessment_viewed');
  }, []);

  const toggleItem = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  const getScore = () => checkedItems.size;
  const getTotalItems = () => ERGONOMIC_CHECKLIST.length;

  const getScoreColor = () => {
    const score = getScore();
    if (score >= 4) return Colors.light.status.success;
    if (score >= 3) return Colors.light.status.warning;
    return Colors.light.status.error;
  };

  const getScoreLabel = () => {
    const score = getScore();
    if (score >= 4) return 'Good setup! 👍';
    if (score >= 3) return 'Room for improvement';
    return 'High risk - needs attention';
  };

  const handleContinue = () => {
    // Track analytics: onb_ergo_score
    console.log('[Analytics] onb_ergo_score:', getScore());
    console.log('[Analytics] onb_ergo_items:', Array.from(checkedItems));
    router.push('/(onboarding)/notification-preference');
  };

  return (
    <OnboardingLayout currentStep={8}>
      <View style={styles.container}>
        <Text style={styles.question}>Check your setup basics</Text>
        <Text style={styles.subtext}>
          Select what applies to your current workspace
        </Text>

        {/* Checklist */}
        <View style={styles.checklist}>
          {ERGONOMIC_CHECKLIST.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.checklistItem}
                onPress={() => toggleItem(item.id)}
                activeOpacity={0.7}>
                <View style={[
                  styles.checkbox,
                  isChecked && styles.checkboxChecked
                ]}>
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checklistLabel}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Score Display */}
        <View style={[styles.scoreContainer, { borderColor: getScoreColor() }]}>
          <Text style={styles.scoreTitle}>Your setup score</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
            {getScore()}/{getTotalItems()}
          </Text>
          <Text style={[styles.scoreLabel, { color: getScoreColor() }]}>
            {getScoreLabel()}
          </Text>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton title="Continue" onPress={handleContinue} />
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
    color: Colors.light.text.primary,
    marginBottom: Spacing.xxs,
  },
  subtext: {
    ...Typography.bodyMedium,
    color: Colors.light.text.secondary,
    marginBottom: Spacing.md,
  },
  checklist: {
    marginBottom: Spacing.lg,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.light.background.secondary,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.border.default,
    marginRight: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.interactive.primary,
    borderColor: Colors.light.interactive.primary,
  },
  checkmark: {
    color: Colors.light.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checklistLabel: {
    ...Typography.bodyMedium,
    color: Colors.light.text.primary,
    flex: 1,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.light.background.secondary,
    borderRadius: BorderRadius.card,
    borderWidth: 3,
  },
  scoreTitle: {
    ...Typography.bodyMedium,
    color: Colors.light.text.secondary,
    marginBottom: Spacing.xxs,
  },
  scoreValue: {
    ...Typography.displayMedium,
    fontWeight: 'bold',
    marginBottom: Spacing.xxs,
  },
  scoreLabel: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
});
