/**
 * Break Feedback Component
 * Rating selection for break experience
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
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

const FEEDBACK_OPTIONS: { rating: FeedbackRating; emoji: string; labelKey: string; fallback: string }[] = [
  { rating: 'good', emoji: '😊', labelKey: 'breakSession.feedback.buttons.good', fallback: 'Helpful' },
  { rating: 'neutral', emoji: '😐', labelKey: 'breakSession.feedback.buttons.neutral', fallback: 'Okay' },
  { rating: 'bad', emoji: '😟', labelKey: 'breakSession.feedback.buttons.bad', fallback: 'Not helpful' },
];

const RELIEF_OPTIONS: { score: ReliefScore; emoji: string; labelKey: string; fallback: string }[] = [
  { score: 'worse', emoji: '😣', labelKey: 'breakSession.feedback.relief.worse', fallback: 'Worse' },
  { score: 'same', emoji: '🙂', labelKey: 'breakSession.feedback.relief.same', fallback: 'Same' },
  { score: 'better', emoji: '😌', labelKey: 'breakSession.feedback.relief.better', fallback: 'Better' },
  { score: 'much_better', emoji: '🤩', labelKey: 'breakSession.feedback.relief.muchBetter', fallback: 'Much better' },
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
      <Text style={styles.subtitle}>
        {t('breakSession.feedback.subtitle', {
          defaultValue: 'Your feedback helps us personalize better resets',
        })}
      </Text>

      <View
        style={styles.options}
        accessibilityRole="radiogroup"
        accessibilityLabel={t('breakSession.feedback.heading', { defaultValue: 'How did that feel?' })}
      >
        {FEEDBACK_OPTIONS.map((option) => (
          <FeedbackButton
            key={option.rating}
            emoji={option.emoji}
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
            style={[styles.options, styles.reliefOptions]}
            accessibilityRole="radiogroup"
            accessibilityLabel={t('breakSession.feedback.reliefHeading', {
              defaultValue: 'How much better do you feel now?',
            })}
          >
            {RELIEF_OPTIONS.map((option) => (
              <FeedbackButton
                key={option.score}
                emoji={option.emoji}
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

function FeedbackButton({
  emoji,
  label,
  isSelected,
  onPress,
  color,
  compact = false,
}: {
  emoji: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
  compact?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected, checked: isSelected }}
    >
      <Animated.View
        style={[
          styles.button,
          compact && styles.compactButton,
          isSelected && { borderColor: color, backgroundColor: `${color}20` },
          animatedStyle,
        ]}
      >
        {Platform.OS === 'ios' && !isSelected ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : !isSelected ? (
          <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
        ) : null}
        <Text
          style={styles.emoji}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {emoji}
        </Text>
        <Text
          style={[styles.label, isSelected && { color }]}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 32,
    textAlign: 'center',
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 28,
    marginBottom: 14,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  reliefOptions: {
    gap: 10,
  },
  button: {
    width: 100,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
  },
  compactButton: {
    width: 88,
    paddingVertical: 16,
  },
  androidFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
    borderRadius: 16,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
