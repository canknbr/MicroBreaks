/**
 * Stretch Exercise Animation — editorial. An abstract torso capsule that
 * lengthens, leans and twists with the movement, a plain direction chevron,
 * and quiet type. No emoji / gradient circle / badge pills.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AnimationType } from '@/data/exercises';
import { useTheme } from '@/hooks/useTheme';

interface StretchExerciseProps {
  animation: AnimationType;
  instruction: string;
  color: string;
  visualGuide: string;
}

export default function StretchExercise({
  animation,
  instruction,
  color,
}: StretchExerciseProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.9);

  useEffect(() => {
    const duration = 2000;

    // Reset
    scale.value = withTiming(1, { duration: 100 });
    translateY.value = withTiming(0, { duration: 100 });
    rotate.value = withTiming(0, { duration: 100 });

    switch (animation) {
      case 'stretch-up':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-30, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-20, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.05, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'stretch-side':
        rotate.value = withRepeat(
          withSequence(
            withTiming(15, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-15, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'stretch-forward':
        translateY.value = withRepeat(
          withSequence(
            withTiming(20, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(10, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(0.95, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'hold':
        opacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(0.6, { duration: 1000 })
          ),
          -1,
          true
        );
        break;

      case 'rest':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'stretch-back':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-15, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-10, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(-8, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-5, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'cat-cow':
        translateY.value = withRepeat(
          withSequence(
            withTiming(15, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-15, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(10, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-10, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'seated-twist':
        rotate.value = withRepeat(
          withSequence(
            withTiming(25, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(-25, { duration: 2500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'hip-opener':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      default:
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
    }
  }, [animation, opacity, rotate, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scaleY: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const getDirectionIcon = (): keyof typeof Ionicons.glyphMap | null => {
    switch (animation) {
      case 'stretch-up':
      case 'stretch-back':
        return 'chevron-up';
      case 'stretch-side':
        return 'swap-horizontal';
      case 'stretch-forward':
        return 'chevron-down';
      case 'cat-cow':
        return 'sync';
      case 'seated-twist':
        return 'refresh';
      case 'hip-opener':
        return 'resize';
      default:
        return null;
    }
  };

  const isHolding = animation === 'hold';
  const directionIcon = getDirectionIcon();

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        {directionIcon ? (
          <Ionicons name={directionIcon} size={26} color={color} style={styles.directionHint} />
        ) : null}

        {/* Abstract torso */}
        <Animated.View style={[styles.torso, { backgroundColor: color }, animatedStyle]} />
        <View style={[styles.base, { backgroundColor: 'rgba(255,255,255,0.14)' }]} />
      </View>

      {isHolding && (
        <Text style={[styles.holdText, { color }]}>HOLD POSITION</Text>
      )}

      <Text style={[styles.instruction, { color: theme.text.secondary }]}>{instruction}</Text>

      {!isHolding && (
        <Text style={[styles.tipText, { color: theme.text.muted }]}>
          Breathe steadily while stretching
        </Text>
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
  stage: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  directionHint: {
    position: 'absolute',
    top: 20,
    opacity: 0.5,
  },
  torso: {
    width: 30,
    height: 104,
    borderRadius: 16,
  },
  base: {
    width: 88,
    height: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  holdText: {
    marginTop: 24,
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 1.6,
  },
  instruction: {
    marginTop: 28,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tipText: {
    marginTop: 16,
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
  },
});
