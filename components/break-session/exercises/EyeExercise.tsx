/**
 * Eye Exercise Animation — editorial. A clean follow-the-dot inside a soft
 * hairline field with a faint reference cross. No emoji.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { AnimationType } from '@/data/exercises';
import { useTheme } from '@/hooks/useTheme';

const { width } = Dimensions.get('window');
const DOT_TRAVEL = Math.min(width - 100, 200);

interface EyeExerciseProps {
  animation: AnimationType;
  instruction: string;
  color: string;
}

export default function EyeExercise({
  animation,
  instruction,
  color,
}: EyeExerciseProps) {
  const theme = useTheme();
  const dotX = useSharedValue(0);
  const dotY = useSharedValue(0);
  const dotScale = useSharedValue(1);
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    const duration = 2000;

    switch (animation) {
      case 'eye-move-circle':
        // Circular movement
        dotX.value = withRepeat(
          withSequence(
            withTiming(DOT_TRAVEL / 2, { duration }),
            withTiming(0, { duration }),
            withTiming(-DOT_TRAVEL / 2, { duration }),
            withTiming(0, { duration })
          ),
          -1
        );
        dotY.value = withRepeat(
          withSequence(
            withTiming(0, { duration }),
            withTiming(DOT_TRAVEL / 2, { duration }),
            withTiming(0, { duration }),
            withTiming(-DOT_TRAVEL / 2, { duration })
          ),
          -1
        );
        break;

      case 'eye-move-horizontal':
        // Left to right
        dotX.value = withRepeat(
          withSequence(
            withTiming(-DOT_TRAVEL / 2, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(DOT_TRAVEL / 2, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        dotY.value = withTiming(0, { duration: 100 });
        break;

      case 'eye-move-vertical':
        // Up and down
        dotX.value = withTiming(0, { duration: 100 });
        dotY.value = withRepeat(
          withSequence(
            withTiming(-DOT_TRAVEL / 2, { duration, easing: Easing.inOut(Easing.ease) }),
            withTiming(DOT_TRAVEL / 2, { duration, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'eye-focus-near':
        // Grow larger (focus near)
        dotX.value = withTiming(0, { duration: 100 });
        dotY.value = withTiming(0, { duration: 100 });
        dotScale.value = withRepeat(
          withSequence(
            withTiming(2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1.5, { duration: 3000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'eye-focus-far':
        // Shrink smaller (focus far)
        dotX.value = withTiming(0, { duration: 100 });
        dotY.value = withTiming(0, { duration: 100 });
        dotScale.value = withRepeat(
          withSequence(
            withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.8, { duration: 3000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      case 'eye-rest':
        // Gentle pulse for resting
        dotX.value = withTiming(0, { duration: 100 });
        dotY.value = withTiming(0, { duration: 100 });
        dotOpacity.value = withRepeat(
          withSequence(
            withTiming(0.3, { duration: 1500 }),
            withTiming(0.7, { duration: 1500 })
          ),
          -1,
          true
        );
        break;

      case 'eye-move-figure8':
        // Figure-8 movement pattern
        const figure8Duration = 3000;
        dotX.value = withRepeat(
          withSequence(
            withTiming(DOT_TRAVEL / 2, { duration: figure8Duration / 4, easing: Easing.inOut(Easing.ease) }),
            withTiming(-DOT_TRAVEL / 2, { duration: figure8Duration / 2, easing: Easing.inOut(Easing.ease) }),
            withTiming(DOT_TRAVEL / 2, { duration: figure8Duration / 2, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: figure8Duration / 4, easing: Easing.inOut(Easing.ease) })
          ),
          -1
        );
        dotY.value = withRepeat(
          withSequence(
            withTiming(-DOT_TRAVEL / 3, { duration: figure8Duration / 4, easing: Easing.inOut(Easing.ease) }),
            withTiming(DOT_TRAVEL / 3, { duration: figure8Duration / 2, easing: Easing.inOut(Easing.ease) }),
            withTiming(-DOT_TRAVEL / 3, { duration: figure8Duration / 2, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: figure8Duration / 4, easing: Easing.inOut(Easing.ease) })
          ),
          -1
        );
        break;

      case 'eye-palming':
        // Calm dark mode for palming
        dotX.value = withTiming(0, { duration: 100 });
        dotY.value = withTiming(0, { duration: 100 });
        dotScale.value = withTiming(3, { duration: 1000 });
        dotOpacity.value = withRepeat(
          withSequence(
            withTiming(0.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;

      default:
        dotX.value = withTiming(0, { duration: 100 });
        dotY.value = withTiming(0, { duration: 100 });
        break;
    }
  }, [animation, dotOpacity, dotScale, dotX, dotY]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dotX.value },
      { translateY: dotY.value },
      { scale: dotScale.value },
    ],
    opacity: dotOpacity.value,
  }));

  const isResting = animation === 'eye-rest' || animation === 'eye-palming';

  return (
    <View style={styles.container}>
      {/* Guide field */}
      <View style={[styles.guideArea, { borderColor: 'rgba(255,255,255,0.1)' }]}>
        {/* Center cross for reference */}
        {!isResting && (
          <>
            <View style={[styles.crossHorizontal, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
            <View style={[styles.crossVertical, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
          </>
        )}

        {/* Dot to follow */}
        <Animated.View style={[styles.dot, { backgroundColor: color, shadowColor: color }, dotStyle]} />
      </View>

      {/* Instruction */}
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
  guideArea: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 200,
    height: 1,
  },
  crossVertical: {
    position: 'absolute',
    width: 1,
    height: 200,
  },
  instruction: {
    marginTop: 40,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
