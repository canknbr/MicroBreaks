/**
 * Break Feedback — editorial. Ratings are a type menu (no emoji faces / blur
 * boxes): dim → white by selection, a short accent bar marks the choice.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/i18n/hooks';

export type FeedbackRating = 'good' | 'neutral' | 'bad';
export type ReliefScore = 'worse' | 'same' | 'better' | 'much_better';

interface BreakFeedbackProps {
  onSubmit: (_rating: FeedbackRating, _reliefScore: ReliefScore) => void;
  selectedRating: FeedbackRating | null;
  selectedReliefScore: ReliefScore | null;
  color: string;
}

const FEEDBACK_OPTIONS: { rating: FeedbackRating; labelKey: string; fallback: string }[] = [
  { rating: 'good', labelKey: 'breakSession.feedback.buttons.good', fallback: 'Helpful' },
  { rating: 'neutral', labelKey: 'breakSession.feedback.buttons.neutral', fallback: 'Okay' },
  { rating: 'bad', labelKey: 'breakSession.feedback.buttons.bad', fallback: 'Not helpful' },
];

const RELIEF_OPTIONS: { score: ReliefScore; labelKey: string; fallback: string }[] = [
  { score: 'worse', labelKey: 'breakSession.feedback.relief.worse', fallback: 'Worse' },
  { score: 'same', labelKey: 'breakSession.feedback.relief.same', fallback: 'Same' },
  { score: 'better', labelKey: 'breakSession.feedback.relief.better', fallback: 'Better' },
  { score: 'much_better', labelKey: 'breakSession.feedback.relief.muchBetter', fallback: 'Much better' },
];

export default function BreakFeedback({
  onSubmit,
  selectedRating,
  selectedReliefScore,
  color,
}: BreakFeedbackProps) {
  const { t } = useTranslation();
  const [pendingRating, setPendingRating] = React.useState<FeedbackRating | null>(selectedRating);
  const [pendingReliefScore, setPendingReliefScore] = React.useState<ReliefScore | null>(
    selectedReliefScore
  );

  React.useEffect(() => {
    setPendingRating(selectedRating);
  }, [selectedRating]);

  React.useEffect(() => {
    setPendingReliefScore(selectedReliefScore);
  }, [selectedReliefScore]);

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        {t('breakSession.feedback.heading', { defaultValue: 'How did that feel?' })}
      </Text>

      <View
        style={styles.options}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('breakSession.feedback.heading', { defaultValue: 'How did that feel?' })}
      >
        {FEEDBACK_OPTIONS.map((option) => (
          <FeedbackOption
            key={option.rating}
            label={t(option.labelKey, { defaultValue: option.fallback })}
            isSelected={pendingRating === option.rating}
            onPress={() => setPendingRating(option.rating)}
            color={color}
          />
        ))}
      </View>

      {pendingRating ? (
        <>
          <Text style={styles.secondaryTitle} accessibilityRole="header">
            {t('breakSession.feedback.reliefHeading', {
              defaultValue: 'How much better do you feel now?',
            })}
          </Text>
          <View
            style={styles.options}
            accessibilityRole="radiogroup"
            accessibilityLabel={t('breakSession.feedback.reliefHeading', {
              defaultValue: 'How much better do you feel now?',
            })}
          >
            {RELIEF_OPTIONS.map((option) => (
              <FeedbackOption
                key={option.score}
                label={t(option.labelKey, { defaultValue: option.fallback })}
                isSelected={pendingReliefScore === option.score}
                onPress={() => {
                  setPendingReliefScore(option.score);
                  onSubmit(pendingRating, option.score);
                }}
                color={color}
                compact
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

function FeedbackOption({
  label,
  isSelected,
  onPress,
  color,
  compact = false,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
  compact?: boolean;
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.option}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected, checked: isSelected }}
    >
      <Text
        style={[
          styles.optionLabel,
          compact && styles.optionLabelCompact,
          isSelected ? styles.optionOn : styles.optionOff,
        ]}
      >
        {label}
      </Text>
      <View style={[styles.optionBar, isSelected && { backgroundColor: color }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 18,
  },
  secondaryTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 28,
    marginBottom: 16,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 24,
    rowGap: 14,
    alignItems: 'flex-start',
  },
  option: {
    alignItems: 'flex-start',
  },
  optionLabel: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.4,
  },
  optionLabelCompact: {
    fontSize: 18,
  },
  optionOn: {
    color: '#FFFFFF',
  },
  optionOff: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  optionBar: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
});
