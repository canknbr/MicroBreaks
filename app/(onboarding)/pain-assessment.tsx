/**
 * ONB_006: Current Pain Assessment — editorial multi-select. A type-list of
 * body areas (dim → white + pink em-dash when picked); a selected area reveals
 * an inline 3-dot intensity control. No cards / shape-icons / gradient glow.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import SecondaryButton from './components/SecondaryButton';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import {
  ACTIVE_ONBOARDING_TOTAL_STEPS,
  PAIN_AREAS,
} from '@/constants/onboarding';
import { useOnboardingStore } from '@/store';

type Severity = 'mild' | 'moderate' | 'severe';
const SEVERITY_LEVELS: Severity[] = ['mild', 'moderate', 'severe'];

function PainRow({
  area,
  isSelected,
  severity,
  first,
  onToggle,
  onSeverityChange,
}: {
  area: { id: string; label: string };
  isSelected: boolean;
  severity?: Severity;
  first: boolean;
  onToggle: () => void;
  onSeverityChange: (_level: Severity) => void;
}) {
  const activeLevel = severity ? SEVERITY_LEVELS.indexOf(severity) : 0;
  const showSeverity = isSelected && area.id !== 'none';

  return (
    <View style={[styles.row, !first && styles.divider]}>
      <Pressable
        style={styles.rowMain}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={area.label}
      >
        <View style={styles.lead}>{isSelected ? <View style={styles.bar} /> : null}</View>
        <Text style={[styles.label, isSelected ? styles.labelOn : styles.labelOff]}>
          {area.label}
        </Text>
      </Pressable>

      {showSeverity && (
        <View style={styles.severity} accessibilityLabel={`Intensity for ${area.label}`}>
          {SEVERITY_LEVELS.map((level, i) => (
            <Pressable
              key={level}
              hitSlop={8}
              onPress={() => onSeverityChange(level)}
              accessibilityRole="button"
              accessibilityLabel={level}
            >
              <View style={[styles.sevDot, i <= activeLevel ? styles.sevDotOn : styles.sevDotOff]} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function PainAssessmentScreen() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state.data);
  const updateData = useOnboardingStore((state) => state.updateData);
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    new Set(onboardingData.painAreas)
  );
  const [severity, setSeverity] = useState<Record<string, Severity>>(
    onboardingData.painSeverity
  );

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
    const painAreas = selectedAreas.size > 0 ? Array.from(selectedAreas) : ['none'];
    const painSeverity = painAreas.includes('none')
      ? {}
      : painAreas.reduce<Record<string, Severity>>((acc, areaId) => {
          if (severity[areaId]) {
            acc[areaId] = severity[areaId];
          }
          return acc;
        }, {});

    updateData({ painAreas, painSeverity });
    router.push('./recommendation');
  };

  const handleNoPain = () => {
    setSelectedAreas(new Set(['none']));
    setSeverity({});
    updateData({ painAreas: ['none'], painSeverity: {} });
    router.push('./recommendation');
  };

  return (
    <OnboardingLayout currentStep={3} totalSteps={ACTIVE_ONBOARDING_TOTAL_STEPS}>
      <View style={styles.container}>
        <HeadlineText delay={0}>
          What usually bothers you during screen-heavy work?
        </HeadlineText>
        <SubheadText delay={100}>
          Pick what needs relief most often — dots set intensity. You can change this later.
        </SubheadText>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {PAIN_AREAS.map((area, i) => (
            <PainRow
              key={area.id}
              area={area}
              first={i === 0}
              isSelected={selectedAreas.has(area.id)}
              severity={severity[area.id]}
              onToggle={() => toggleArea(area.id)}
              onSeverityChange={(level) => setSeverityForArea(area.id, level)}
            />
          ))}
        </ScrollView>

        <PrimaryButton title="Build my starting plan" onPress={handleContinue} />
        <SecondaryButton
          title="Nothing specific today"
          onPress={handleNoPain}
          variant="muted"
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
    marginTop: 16,
  },
  list: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lead: {
    width: 30,
    justifyContent: 'center',
  },
  bar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
  },
  label: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  labelOn: {
    color: '#FFFFFF',
  },
  labelOff: {
    color: 'rgba(255,255,255,0.3)',
  },
  severity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingLeft: 12,
  },
  sevDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  sevDotOn: {
    backgroundColor: '#FF2472',
  },
  sevDotOff: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
});
