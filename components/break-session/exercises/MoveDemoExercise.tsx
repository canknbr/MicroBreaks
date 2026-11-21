/**
 * Move Demo
 * Session visual for drawn moves: the looping animated demo (transparent
 * WebP from scripts/generate-move-library.mjs) with the current instruction.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { ImageSourcePropType } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';

interface MoveDemoExerciseProps {
  source: ImageSourcePropType;
  instruction: string;
  color: string;
  /** True on the long "follow the animation" block — shows the live badge. */
  isFlowStep: boolean;
}

export default function MoveDemoExercise({
  source,
  instruction,
  color,
  isFlowStep,
}: MoveDemoExerciseProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={styles.container}>
      {/* Demo card — dark plate behind the transparent drawing */}
      <View
        style={[
          styles.gifCard,
          {
            borderColor: `${color}45`,
            shadowColor: color,
          },
        ]}
      >
        <Image
          source={source}
          style={styles.gif}
          contentFit="contain"
          accessibilityIgnoresInvertColors
          accessible
          accessibilityLabel={instruction}
        />
      </View>

      {/* Follow-along badge during the flow block */}
      {isFlowStep && (
        <View
          style={[
            styles.flowBadge,
            {
              backgroundColor: theme.isDark
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <Animated.View style={[styles.flowDot, { backgroundColor: color }, pulseStyle]} />
          <Text style={[styles.flowText, { color }]}>
            {t('library.session.followAlong')}
          </Text>
        </View>
      )}

      {/* Instruction */}
      <Text style={[styles.instruction, { color: theme.text.secondary }]}>
        {instruction}
      </Text>

      {/* Form tip */}
      {!isFlowStep && (
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle" size={16} color={theme.text.muted} />
          <Text style={[styles.tipText, { color: theme.text.muted }]}>
            {t('library.session.formTip')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  gifCard: {
    width: 264,
    height: 264,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: '#F6F4EF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  gif: {
    width: 244,
    height: 244,
  },
  flowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  flowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  flowText: {
    fontSize: 13,
    fontWeight: '600',
  },
  instruction: {
    marginTop: 28,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 12,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  tipText: {
    fontSize: 12,
    marginLeft: 6,
  },
});
