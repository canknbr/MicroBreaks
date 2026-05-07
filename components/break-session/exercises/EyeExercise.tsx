/**
 * Eye Exercise Animation
 * Follow-the-dot and focus exercises
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

  const getVisualGuide = () => {
    switch (animation) {
      case 'eye-rest':
        return '😌';
      case 'eye-focus-far':
        return '🏔️';
      case 'eye-focus-near':
        return '📱';
      case 'eye-move-figure8':
        return '♾️';
      case 'eye-palming':
        return '🙌';
      default:
        return '👁️';
    }
  };

  const isResting = animation === 'eye-rest' || animation === 'eye-palming';

  return (
    <View style={styles.container}>
      {/* Guide area */}
      <View style={[styles.guideArea, { borderColor: `${color}30`, backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)' }]}>
        {/* Dot to follow */}
        <Animated.View style={[styles.dot, { backgroundColor: color }, dotStyle]}>
          {isResting ? (
            <Text style={styles.restEmoji}>{getVisualGuide()}</Text>
          ) : null}
        </Animated.View>

        {/* Center cross for reference */}
        {!isResting && (
          <>
            <View style={[styles.crossHorizontal, { backgroundColor: `${color}20` }]} />
            <View style={[styles.crossVertical, { backgroundColor: `${color}20` }]} />
          </>
        )}
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.emoji}>{getVisualGuide()}</Text>
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
  guideArea: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  restEmoji: {
    fontSize: 24,
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
  instructionContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
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
