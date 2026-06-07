/**
 * SkiaBreathingCircle
 *
 * Skia-rendered breathing orb that replaces the layered Reanimated
 * `LinearGradient` + nested `Animated.View` stack inside
 * `BreathingExercise`. The visceral upgrade is real radial gradients
 * whose stops, radius, and blur all morph in lock-step with the breath
 * phase — the orb actually *grows* and *softens* the way a deep breath
 * feels, instead of just scaling a flat painted circle up and down.
 *
 * Architecture:
 *   - Outer halo:  large radial gradient from `${color}55` → transparent.
 *                  Radius and opacity scale with `phaseProgress`.
 *   - Inner orb:   smaller radial gradient from a white-tinted core to
 *                  `${color}`. Blur radius softens during exhale so the
 *                  orb literally "lets go" at the end of the breath.
 *
 * Synchronization:
 *   - A single `phaseProgress` SharedValue ticks 0 → 1 during inhale,
 *     1 → 0 during exhale, sinusoidal during hold, and pulses gently
 *     when idle. Every Skia prop derives off this one value through
 *     `useDerivedValue` so the whole composition stays in phase.
 *
 * Accessibility:
 *   - Reduce Motion: progress freezes at 0.5 (mid-breath) and all
 *     time-based animation is skipped so the user sees a still gradient
 *     instead of a continuous morph.
 */

import React, { useEffect } from 'react';
import { Canvas, Circle, RadialGradient, BlurMask, vec } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { AnimationType } from '@/data/exercises';
import { useReduceMotion } from '@/hooks/useReduceMotion';

interface SkiaBreathingCircleProps {
  animation: AnimationType;
  /** Phase-tint colour passed in by `BreathingExercise`. */
  color: string;
  /** Overall canvas dimension. Default matches the existing `outerCircle`. */
  size?: number;
}

const PHASE_MS = 4000;
const IDLE_PULSE_MS = 2500;
const HOLD_PULSE_MS = 600;

export default function SkiaBreathingCircle({
  animation,
  color,
  size = 280,
}: SkiaBreathingCircleProps) {
  const reduceMotion = useReduceMotion();
  // Single source of truth for "how open is the breath right now":
  //   0 = fully exhaled / contracted
  //   1 = fully inhaled / expanded
  const phaseProgress = useSharedValue(0.45);

  useEffect(() => {
    cancelAnimation(phaseProgress);

    if (reduceMotion) {
      // Snap to a calm mid-breath and stop. Reduce Motion users still get
      // the rendered gradient — they just don't get the continuous morph.
      phaseProgress.value = 0.5;
      return;
    }

    switch (animation) {
      case 'breathe-in':
        phaseProgress.value = 0;
        phaseProgress.value = withTiming(1, {
          duration: PHASE_MS,
          easing: Easing.inOut(Easing.ease),
        });
        break;
      case 'breathe-hold':
        // Subtle "held breath" pulse — small amplitude around the inhaled peak.
        phaseProgress.value = withRepeat(
          withSequence(
            withTiming(0.92, { duration: HOLD_PULSE_MS, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.85, { duration: HOLD_PULSE_MS, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
      case 'breathe-out':
        phaseProgress.value = 1;
        phaseProgress.value = withTiming(0, {
          duration: PHASE_MS,
          easing: Easing.inOut(Easing.ease),
        });
        break;
      default:
        // Idle / non-breathing animation type — gentle long pulse so the
        // canvas never looks dead between sessions.
        phaseProgress.value = withRepeat(
          withSequence(
            withTiming(0.6, { duration: IDLE_PULSE_MS, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.4, { duration: IDLE_PULSE_MS, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
    }
  }, [animation, phaseProgress, reduceMotion]);

  const center = size / 2;
  const centerPoint = vec(center, center);

  // Outer halo: starts at ~38% of canvas, grows to ~50% on full inhale.
  const haloRadius = useDerivedValue(() => {
    const min = size * 0.38;
    const max = size * 0.5;
    return min + (max - min) * phaseProgress.value;
  });

  // Inner orb: more dramatic swing. This is the "body" of the breath.
  const orbRadius = useDerivedValue(() => {
    const min = size * 0.18;
    const max = size * 0.36;
    return min + (max - min) * phaseProgress.value;
  });

  // Halo opacity tracks the breath — barely visible at full exhale,
  // fully present at the top of the inhale.
  const haloOpacity = useDerivedValue(() => 0.25 + phaseProgress.value * 0.55);

  // Orb blur softens as the breath releases — the orb literally feels
  // like it's letting go on the exhale.
  const orbBlur = useDerivedValue(() => 4 + (1 - phaseProgress.value) * 14);

  // Halo blur is heavier; this is what gives the surrounding glow.
  const haloBlur = useDerivedValue(() => 18 + phaseProgress.value * 10);

  const haloColors = [`${color}88`, `${color}33`, `${color}00`];
  const orbColors = ['rgba(255,255,255,0.85)', `${color}CC`, `${color}33`];

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Outer halo — the ambient breath aura. */}
      <Circle cx={center} cy={center} r={haloRadius} opacity={haloOpacity}>
        <RadialGradient c={centerPoint} r={haloRadius} colors={haloColors} />
        <BlurMask blur={haloBlur} style="normal" />
      </Circle>

      {/* Inner orb — the body of the breath. */}
      <Circle cx={center} cy={center} r={orbRadius}>
        <RadialGradient c={centerPoint} r={orbRadius} colors={orbColors} />
        <BlurMask blur={orbBlur} style="solid" />
      </Circle>
    </Canvas>
  );
}
