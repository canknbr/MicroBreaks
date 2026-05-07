/**
 * Neck Exercise Animation
 * Rotation direction arrows and head movement guidance
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

interface NeckExerciseProps {
  animation: AnimationType;
  instruction: string;
  color: string;
  visualGuide: string;
}

export default function NeckExercise({
  animation,
  instruction,
  color,
  visualGuide,
}: NeckExerciseProps) {
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    const duration = 2000;

    // Reset values
    rotation.value = withTiming(0, { duration: 100 });
    tiltX.value = withTiming(0, { duration: 100 });
    tiltY.value = withTiming(0, { duration: 100 });

    switch (animation) {
      case 'rotate-right':
        rotation.value = withRepeat(
          withTiming(360, { duration: 4000, easing: Easing.linear }),
          -1
        );
        arrowOpacity.value = withTiming(1, { duration: 300 });
        break;

      case 'rotate-left':
        rotation.value = withRepeat(
          withTiming(-360, { duration: 4000, easing: Easing.linear }),
          -1
        );
        arrowOpacity.value = withTiming(1, { duration: 300 });
        break;

      case 'tilt-right':
        tiltX.value = withRepeat(
          withSequence(
            withTiming(20, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(15, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        arrowOpacity.value = withTiming(1, { duration: 300 });
        break;

      case 'tilt-left':
        tiltX.value = withRepeat(
          withSequence(
            withTiming(-20, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-15, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        arrowOpacity.value = withTiming(1, { duration: 300 });
        break;

      case 'tilt-forward':
        tiltY.value = withRepeat(
          withSequence(
            withTiming(15, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(10, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        arrowOpacity.value = withTiming(1, { duration: 300 });
        break;

      case 'tilt-back':
        tiltY.value = withRepeat(
          withSequence(
            withTiming(-15, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(-10, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        arrowOpacity.value = withTiming(1, { duration: 300 });
        break;

      case 'hold':
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000 }),
            withTiming(1, { duration: 1000 })
          ),
          -1,
          true
        );
        arrowOpacity.value = withTiming(0.5, { duration: 300 });
        break;

      default:
        arrowOpacity.value = withTiming(0, { duration: 300 });
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          true
        );
        break;
    }
  }, [animation, arrowOpacity, pulseScale, rotation, tiltX, tiltY]);

  const headStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${tiltX.value}deg` },
      { rotateX: `${tiltY.value}deg` },
      { scale: pulseScale.value },
    ],
  }));

  const rotationIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: arrowOpacity.value,
  }));

  const getDirectionIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (animation) {
      case 'tilt-right':
        return 'arrow-forward';
      case 'tilt-left':
        return 'arrow-back';
      case 'tilt-forward':
        return 'arrow-down';
      case 'tilt-back':
        return 'arrow-up';
      case 'rotate-right':
      case 'rotate-left':
        return 'refresh';
      default:
        return 'pause';
    }
  };

  const isRotating = animation === 'rotate-right' || animation === 'rotate-left';

  return (
    <View style={styles.container}>
      {/* Main visualization area */}
      <View style={styles.visualArea}>
        {/* Rotation indicator for circular movements */}
        {isRotating && (
          <Animated.View style={[styles.rotationRing, rotationIndicatorStyle]}>
            <View style={[styles.rotationDot, { backgroundColor: color }]} />
          </Animated.View>
        )}

        {/* Head/neck visualization */}
        <Animated.View style={[styles.headContainer, headStyle]}>
          <View style={[styles.head, { borderColor: `${color}40`, backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }]}>
            <Text style={styles.headEmoji}>🧑</Text>
          </View>
        </Animated.View>

        {/* Direction arrow */}
        {!isRotating && animation !== 'hold' && animation !== 'rest' && (
          <Animated.View
            style={[
              styles.directionArrow,
              { backgroundColor: `${color}30` },
              { opacity: arrowOpacity.value },
            ]}
          >
            <Ionicons name={getDirectionIcon()} size={24} color={color} />
          </Animated.View>
        )}
      </View>

      {/* Visual guide and instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.visualGuide}>{visualGuide}</Text>
        <Text style={[styles.instruction, { color: theme.text.secondary }]}>{instruction}</Text>
      </View>
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
  visualArea: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotationRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderStyle: 'dashed',
  },
  rotationDot: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  headContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headEmoji: {
    fontSize: 50,
  },
  directionArrow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 10,
  },
  instructionContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  visualGuide: {
    fontSize: 40,
    marginBottom: 12,
  },
  instruction: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
});
