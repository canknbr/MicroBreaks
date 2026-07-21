/**
 * Neck Exercise Animation — editorial. An abstract head-on-neck figure
 * (dot + stem over a shoulder bar) that tilts, nods and rolls with the
 * movement. No emoji / dashed rings / tinted circle badges.
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
}: NeckExerciseProps) {
  const theme = useTheme();
  const rotation = useSharedValue(0);
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    const duration = 2000;

    // Reset values
    rotation.value = withTiming(0, { duration: 100 });
    tiltX.value = withTiming(0, { duration: 100 });
    tiltY.value = withTiming(0, { duration: 100 });
    pulseScale.value = withTiming(1, { duration: 100 });

    switch (animation) {
      case 'rotate-right':
        rotation.value = withRepeat(
          withTiming(360, { duration: 4000, easing: Easing.linear }),
          -1
        );
        break;

      case 'rotate-left':
        rotation.value = withRepeat(
          withTiming(-360, { duration: 4000, easing: Easing.linear }),
          -1
        );
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
        break;

      default:
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
  }, [animation, pulseScale, rotation, tiltX, tiltY]);

  // The figure pivots about its lower centre (the neck base) so a tilt reads
  // as the head swinging over the shoulders rather than spinning in place.
  const figureStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateZ: `${tiltX.value}deg` },
      { rotateX: `${tiltY.value}deg` },
      { rotate: `${rotation.value}deg` },
      { scale: pulseScale.value },
    ],
  }));

  const getDirectionIcon = (): keyof typeof Ionicons.glyphMap | null => {
    switch (animation) {
      case 'tilt-right':
        return 'chevron-forward';
      case 'tilt-left':
        return 'chevron-back';
      case 'tilt-forward':
        return 'chevron-down';
      case 'tilt-back':
        return 'chevron-up';
      case 'rotate-right':
      case 'rotate-left':
        return 'refresh';
      default:
        return null;
    }
  };

  const directionIcon = getDirectionIcon();

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        {directionIcon ? (
          <Ionicons
            name={directionIcon}
            size={26}
            color={color}
            style={styles.directionHint}
          />
        ) : null}

        {/* Shoulders — static base the head pivots over */}
        <View style={[styles.shoulders, { backgroundColor: 'rgba(255,255,255,0.14)' }]} />

        {/* Head + neck */}
        <Animated.View style={[styles.figure, figureStyle]}>
          <View style={[styles.head, { backgroundColor: theme.text.primary }]} />
          <View style={[styles.neck, { backgroundColor: 'rgba(255,255,255,0.28)' }]} />
        </Animated.View>
      </View>

      <Text style={[styles.instruction, { color: theme.text.secondary }]}>{instruction}</Text>
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
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 44,
  },
  directionHint: {
    position: 'absolute',
    top: 24,
    opacity: 0.5,
  },
  shoulders: {
    position: 'absolute',
    bottom: 40,
    width: 104,
    height: 14,
    borderRadius: 7,
  },
  figure: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  head: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  neck: {
    width: 12,
    height: 34,
    borderRadius: 6,
    marginTop: -2,
  },
  instruction: {
    marginTop: 36,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
