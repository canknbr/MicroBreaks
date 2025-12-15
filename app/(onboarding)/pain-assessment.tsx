/**
 * ONB_006: Current Pain Assessment
 * Premium zen design with animated body area selection
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { PAIN_AREAS } from '@/constants/onboarding';

type Severity = 'mild' | 'moderate' | 'severe';

function PainAreaCard({ area, isSelected, severity, onToggle, onSeverityChange, index }: {
  area: { id: string; icon: string; label: string };
  isSelected: boolean;
  severity?: Severity;
  onToggle: () => void;
  onSeverityChange: (level: Severity) => void;
  index: number;
}) {
  const cardScale = useSharedValue(1);

  const handlePress = () => {
    cardScale.value = withTiming(0.97, { duration: 80, easing: Easing.out(Easing.cubic) });
    setTimeout(() => {
      cardScale.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.cubic) });
    }, 80);
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const getSeverityColor = (level: Severity) => {
    switch (level) {
      case 'mild': return ZenColors.primary.main;
      case 'moderate': return ZenColors.accent.main;
      case 'severe': return ZenColors.secondary.main;
    }
  };

  return (
    <Animated.View style={[styles.areaContainer, animatedStyle]}>
      <Pressable
        style={[styles.areaCard, isSelected && styles.areaCardSelected]}
        onPress={handlePress}
      >
        {isSelected && (
          <LinearGradient
            colors={[ZenColors.primary.glow, 'transparent']}
            style={styles.areaCardGlow}
          />
        )}
        <Text style={styles.areaIcon}>{area.icon}</Text>
        <Text style={[styles.areaLabel, isSelected && styles.areaLabelSelected]}>
          {area.label}
        </Text>
      </Pressable>

      {/* Severity selector */}
      {isSelected && area.id !== 'none' && (
        <View style={styles.severityContainer}>
          {(['mild', 'moderate', 'severe'] as Severity[]).map((level) => (
            <Pressable
              key={level}
              style={[
                styles.severityDot,
                { backgroundColor: getSeverityColor(level) },
                severity !== level && styles.severityDotInactive,
              ]}
              onPress={() => onSeverityChange(level)}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
}

export default function PainAssessmentScreen() {
  const router = useRouter();
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [severity, setSeverity] = useState<Record<string, Severity>>({});

  const toggleArea = (areaId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSeverity({ ...severity, [areaId]: level });
  };

  const handleContinue = () => {
    if (selectedAreas.size > 0) {
      router.push('./work-pattern');
    }
  };

  return (
    <OnboardingLayout currentStep={6} ambientColor="purple">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Where do you feel discomfort?
        </HeadlineText>
        <SubheadText delay={100}>
          Select all areas that apply
        </SubheadText>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.areaGrid}
          showsVerticalScrollIndicator={false}
        >
          {PAIN_AREAS.map((area, index) => (
            <PainAreaCard
              key={area.id}
              area={area}
              isSelected={selectedAreas.has(area.id)}
              severity={severity[area.id]}
              onToggle={() => toggleArea(area.id)}
              onSeverityChange={(level) => setSeverityForArea(area.id, level)}
              index={index}
            />
          ))}
        </ScrollView>

        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>
            Dots show intensity level
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
  scrollView: {
    flex: 1,
    marginTop: ZenSpacing.md,
  },
  areaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: ZenSpacing.sm,
  },
  areaContainer: {
    width: '48%',
    marginBottom: ZenSpacing.sm,
  },
  areaCard: {
    backgroundColor: ZenColors.background.card,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
    borderRadius: ZenRadius.lg,
    padding: ZenSpacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  areaCardSelected: {
    borderColor: ZenColors.primary.main,
    backgroundColor: ZenColors.background.cardHover,
  },
  areaCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  areaIcon: {
    fontSize: 32,
    marginBottom: ZenSpacing.xs,
  },
  areaLabel: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.primary,
    textAlign: 'center',
  },
  areaLabelSelected: {
    ...ZenTypography.label.medium,
    color: ZenColors.text.primary,
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: ZenSpacing.xs,
    gap: ZenSpacing.xs,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  severityDotInactive: {
    opacity: 0.3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: ZenSpacing.sm,
    gap: ZenSpacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ZenColors.text.muted,
  },
  legendText: {
    ...ZenTypography.body.small,
    color: ZenColors.text.muted,
  },
});
