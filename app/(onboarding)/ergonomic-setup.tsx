/**
 * ONB_008: Ergonomic Setup Assessment
 * Premium zen design with animated checklist
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import OnboardingLayout from './components/OnboardingLayout';
import PrimaryButton from './components/PrimaryButton';
import { HeadlineText, SubheadText } from './components/AnimatedText';
import { ZenColors, ZenSpacing, ZenRadius, ZenTypography } from './constants/design';
import { ERGONOMIC_CHECKLIST } from '@/constants/onboarding';

function ChecklistItem({ item, isChecked, onToggle, index }: {
  item: { id: string; label: string };
  isChecked: boolean;
  onToggle: () => void;
  index: number;
}) {
  const checkScale = useSharedValue(isChecked ? 1 : 0);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    checkScale.value = withTiming(isChecked ? 0 : 1, { duration: 200, easing: Easing.out(Easing.cubic) });
    onToggle();
  };

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <TouchableOpacity
      style={[styles.checklistItem, isChecked && styles.checklistItemChecked]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
        <Animated.View style={checkAnimatedStyle}>
          <Ionicons name="checkmark" size={16} color={ZenColors.text.inverse} />
        </Animated.View>
      </View>
      <Text style={[styles.checklistLabel, isChecked && styles.checklistLabelChecked]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ErgonomicSetupScreen() {
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

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
    if (score >= 4) return ZenColors.primary.main;
    if (score >= 3) return ZenColors.accent.main;
    return ZenColors.secondary.main;
  };

  const getScoreLabel = () => {
    const score = getScore();
    if (score >= 4) return 'Great setup!';
    if (score >= 3) return 'Room for improvement';
    return 'Needs attention';
  };

  const handleContinue = () => {
    router.push('./notification-preference');
  };

  return (
    <OnboardingLayout currentStep={8} ambientColor="teal">
      <View style={styles.container}>
        <HeadlineText delay={0}>
          Check your setup basics
        </HeadlineText>
        <SubheadText delay={100}>
          Select what applies to your current workspace
        </SubheadText>

        {/* Checklist */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.checklist}
          showsVerticalScrollIndicator={false}
        >
          {ERGONOMIC_CHECKLIST.map((item, index) => (
            <ChecklistItem
              key={item.id}
              item={item}
              isChecked={checkedItems.has(item.id)}
              onToggle={() => toggleItem(item.id)}
              index={index}
            />
          ))}
        </ScrollView>

        {/* Score Display */}
        <View style={[styles.scoreContainer, { borderColor: getScoreColor() }]}>
          <LinearGradient
            colors={[getScoreColor() + '20', 'transparent']}
            style={styles.scoreGlow}
          />
          <Text style={styles.scoreTitle}>Your setup score</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
            {getScore()}/{getTotalItems()}
          </Text>
          <Text style={[styles.scoreLabel, { color: getScoreColor() }]}>
            {getScoreLabel()}
          </Text>
        </View>

        <PrimaryButton title="Continue" onPress={handleContinue} />
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
  checklist: {
    paddingBottom: ZenSpacing.md,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ZenSpacing.sm,
    paddingHorizontal: ZenSpacing.md,
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.lg,
    marginBottom: ZenSpacing.sm,
    borderWidth: 1,
    borderColor: ZenColors.border.subtle,
  },
  checklistItemChecked: {
    backgroundColor: ZenColors.background.cardHover,
    borderColor: ZenColors.primary.main,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: ZenRadius.sm,
    borderWidth: 2,
    borderColor: ZenColors.border.default,
    marginRight: ZenSpacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: ZenColors.primary.main,
    borderColor: ZenColors.primary.main,
  },
  checklistLabel: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.primary,
    flex: 1,
  },
  checklistLabelChecked: {
    color: ZenColors.text.primary,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: ZenSpacing.lg,
    backgroundColor: ZenColors.background.card,
    borderRadius: ZenRadius.xl,
    borderWidth: 2,
    marginBottom: ZenSpacing.md,
    overflow: 'hidden',
  },
  scoreGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  scoreTitle: {
    ...ZenTypography.body.medium,
    color: ZenColors.text.secondary,
    marginBottom: ZenSpacing.xxs,
  },
  scoreValue: {
    ...ZenTypography.display.medium,
    marginBottom: ZenSpacing.xxs,
  },
  scoreLabel: {
    ...ZenTypography.label.large,
  },
});
