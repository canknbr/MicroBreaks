/**
 * Stretch Exercise Animation
 * Step-by-step visual guides for stretching
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AnimationType } from '@/data/exercises';

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
  visualGuide,
}: StretchExerciseProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.8);

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
            withTiming(0.7, { duration: 1000 })
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
        // Arch back motion
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
        // Alternating arch and round
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
        // Rotation motion
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
        // Gentle opening motion
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
  }, [animation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (animation) {
      case 'stretch-up':
        return 'arrow-up';
      case 'stretch-side':
        return 'swap-horizontal';
      case 'stretch-forward':
        return 'arrow-down';
      case 'stretch-back':
        return 'arrow-up';
      case 'cat-cow':
        return 'sync';
      case 'seated-twist':
        return 'refresh';
      case 'hip-opener':
        return 'expand';
      case 'hold':
        return 'pause';
      default:
        return 'body';
    }
  };

  const isHolding = animation === 'hold';

  return (
    <View style={styles.container}>
      {/* Main visualization */}
      <Animated.View style={[styles.visualContainer, animatedStyle]}>
        <View style={[styles.iconCircle, { borderColor: `${color}50` }]}>
          <LinearGradient
            colors={[`${color}30`, `${color}10`]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.emoji}>{visualGuide}</Text>
        </View>

        {/* Direction indicator */}
        {!isHolding && animation !== 'rest' && (
          <View style={[styles.directionBadge, { backgroundColor: color }]}>
            <Ionicons name={getIconName()} size={16} color="#000" />
          </View>
        )}
      </Animated.View>

      {/* Hold indicator */}
      {isHolding && (
        <View style={styles.holdIndicator}>
          <Ionicons name="pause" size={20} color={color} />
          <Text style={[styles.holdText, { color }]}>Hold Position</Text>
        </View>
      )}

      {/* Instruction */}
      <Text style={styles.instruction}>{instruction}</Text>

      {/* Tips */}
      {!isHolding && (
        <View style={styles.tipContainer}>
          <Ionicons name="information-circle" size={16} color="rgba(255, 255, 255, 0.4)" />
          <Text style={styles.tipText}>Breathe steadily while stretching</Text>
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
  visualContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 70,
  },
  directionBadge: {
    position: 'absolute',
    bottom: -10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  holdText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  instruction: {
    marginTop: 32,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  tipText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 6,
  },
});
