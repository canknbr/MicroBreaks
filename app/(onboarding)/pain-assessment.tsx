/**
 * ONB_006: Current Pain Assessment
 * Interactive body map for pain area selection
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';
import { PAIN_AREAS } from '@/constants/onboarding';

type Severity = 'mild' | 'moderate' | 'severe';

export default function PainAssessmentScreen() {
  const router = useRouter();
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [severity, setSeverity] = useState<Record<string, Severity>>({});

  useEffect(() => {
    // Track analytics: onb_pain_assessment_viewed
    // console.log('[Analytics] onb_pain_assessment_viewed');
  }, []);

  const toggleArea = (areaId: string) => {
    const newSelected = new Set(selectedAreas);
    if (newSelected.has(areaId)) {
      newSelected.delete(areaId);
      const newSeverity = { ...severity };
      delete newSeverity[areaId];
      setSeverity(newSeverity);
    } else {
      if (areaId === 'none') {
        newSelected.clear();
        setSeverity({});
      } else {
        newSelected.delete('none');
      }
      newSelected.add(areaId);
      setSeverity({ ...severity, [areaId]: 'mild' });
    }
    setSelectedAreas(newSelected);
  };

  const setSeverityForArea = (areaId: string, level: Severity) => {
    setSeverity({ ...severity, [areaId]: level });
  };

  const handleContinue = () => {
    if (selectedAreas.size > 0) {
      // Track analytics: onb_pain_areas_selected
      // console.log('[Analytics] onb_pain_areas_selected:', Array.from(selectedAreas));
      router.push('./work-pattern');
    }
  };

  return (
    <OnboardingLayout currentStep={6}>
      <View style={styles.container}>
        <Text style={styles.question}>Where do you feel discomfort?</Text>
        <Text style={styles.subtext}>
          Select all areas that apply
        </Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.areaGrid}
          showsVerticalScrollIndicator={false}>
          {PAIN_AREAS.map((area) => {
            const isSelected = selectedAreas.has(area.id);
            return (
              <View key={area.id} style={styles.areaContainer}>
                <View
                  style={[
                    styles.areaCard,
                    isSelected && styles.areaCardSelected,
                  ]}
                  onTouchEnd={() => toggleArea(area.id)}>
                  <Text style={styles.areaIcon}>{area.icon}</Text>
                  <Text style={[
                    styles.areaLabel,
                    isSelected && styles.areaLabelSelected
                  ]}>
                    {area.label}
                  </Text>
                </View>

                {/* Severity selector */}
                {isSelected && area.id !== 'none' && (
                  <View style={styles.severityContainer}>
                    {(['mild', 'moderate', 'severe'] as Severity[]).map((level) => (
                      <View
                        key={level}
                        style={[
                          styles.severityDot,
                          severity[area.id] === level && styles.severityDotActive,
                          level === 'severe' && styles.severityDotSevere,
                        ]}
                        onTouchEnd={() => setSeverityForArea(area.id, level)}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.legend}>
          <Text style={styles.legendText}>
            Tap again to adjust intensity
          </Text>
        </View>

        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
          disabled={selectedAreas.size === 0}
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
  scrollView: {
    flex: 1,
  },
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
  },
  areaContainer: {
    width: '48%',
    marginBottom: Spacing.sm,
  },
  areaCard: {
    backgroundColor: Colors.dark.card.background,
    borderWidth: 2,
    borderColor: Colors.dark.border.default,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  areaCardSelected: {
    borderColor: Colors.dark.brand.primary,
    backgroundColor: Colors.dark.background.secondary,
  },
  areaIcon: {
    fontSize: 32,
    marginBottom: Spacing.xxs,
  },
  areaLabel: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.primary,
    textAlign: 'center',
  },
  areaLabelSelected: {
    ...Typography.bodyMediumBold,
    color: Colors.dark.brand.primary,
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxs,
    gap: Spacing.xxs,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.status.warning,
    opacity: 0.3,
  },
  severityDotActive: {
    opacity: 1,
  },
  severityDotSevere: {
    backgroundColor: Colors.dark.status.error,
  },
  legend: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  legendText: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
  },
});
