import React, { useEffect } from 'react';
import { Canvas, Path, RadialGradient, BlurMask, vec, Circle, Skia } from '@shopify/react-native-skia';
import {
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  useDerivedValue,
  type SharedValue,
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

// Floating Energy Particle Component
function FloatingParticle({
  index,
  size,
  center,
  time,
  phaseProgress,
}: {
  index: number;
  size: number;
  center: number;
  time: SharedValue<number>;
  phaseProgress: SharedValue<number>;
}) {
  // Deterministic random properties for each index
  const angleOffset = (index * 2 * Math.PI) / 12 + (index * 0.17) % 0.3;
  const radiusMultiplier = 0.22 + ((index * 0.13) % 0.45);
  const speed = 0.6 + ((index * 0.23) % 1.0);
  const particleSize = 1.5 + ((index * 1.5) % 3);

  const cx = useDerivedValue(() => {
    const p = phaseProgress.value;
    const t = time.value;
    const driftAngle = angleOffset + t * 0.1 * speed;
    const distance = size * radiusMultiplier * (0.8 + p * 0.45);
    return center + distance * Math.cos(driftAngle);
  });

  const cy = useDerivedValue(() => {
    const p = phaseProgress.value;
    const t = time.value;
    const driftAngle = angleOffset + t * 0.1 * speed;
    const distance = size * radiusMultiplier * (0.8 + p * 0.45);
    return center + distance * Math.sin(driftAngle);
  });

  const opacity = useDerivedValue(() => {
    const p = phaseProgress.value;
    const t = time.value;
    const baseOpacity = 0.1 + p * 0.55;
    const pulse = 0.5 + Math.sin(t * 1.5 * speed) * 0.4;
    return baseOpacity * pulse;
  });

  return (
    <Circle cx={cx} cy={cy} r={particleSize} opacity={opacity} color="white">
      <BlurMask blur={1.5} style="normal" />
    </Circle>
  );
}

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

  // Time value for continuous organic wobbling/morphing
  const time = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(phaseProgress);
    cancelAnimation(time);

    if (reduceMotion) {
      phaseProgress.value = 0.5;
      time.value = 0;
      return;
    }

    // Run continuous time loop for organic wobble
    time.value = withRepeat(
      withTiming(2 * Math.PI, {
        duration: 12000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

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
  }, [animation, phaseProgress, time, reduceMotion]);

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

  // Dynamic wobbly path for the outer halo (ambient breath aura)
  const haloPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const N = 40;
    const rBase = haloRadius.value;
    const t = time.value;
    const p = phaseProgress.value;
    
    // Wobble scales up with breath expansion, inactive if reduce motion is on
    const wobbleAmp = (8 + p * 12) * (reduceMotion ? 0 : 1);

    for (let i = 0; i <= N; i++) {
      const angle = (i * 2 * Math.PI) / N;
      // Multi-frequency wave pattern out of phase with inner orb
      const wobble = 
        Math.cos(4 * angle + t * 1.3) * 0.5 + 
        Math.sin(2 * angle - t * 2.2) * 0.5;
      const r = rBase + wobble * wobbleAmp;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);

      if (i === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    return path;
  });

  // Dynamic wobbly path for the inner orb (the core breathing body)
  const orbPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const N = 40;
    const rBase = orbRadius.value;
    const t = time.value;
    const p = phaseProgress.value;

    const wobbleAmp = (4 + p * 8) * (reduceMotion ? 0 : 1);

    for (let i = 0; i <= N; i++) {
      const angle = (i * 2 * Math.PI) / N;
      // Multi-frequency waves for complex fluid deformation
      const wobble = 
        Math.sin(3 * angle - t * 1.8) * 0.65 + 
        Math.cos(5 * angle + t * 2.6) * 0.35;
      const r = rBase + wobble * wobbleAmp;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);

      if (i === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    return path;
  });

  const haloColors = [`${color}88`, `${color}33`, `${color}00`];
  const orbColors = ['rgba(255,255,255,0.85)', `${color}CC`, `${color}33`];

  return (
    <Canvas style={{ width: size, height: size }}>
      {/* Outer wobbly halo — the ambient breath aura. */}
      <Path path={haloPath} opacity={haloOpacity}>
        <RadialGradient c={centerPoint} r={haloRadius} colors={haloColors} />
        <BlurMask blur={haloBlur} style="normal" />
      </Path>

      {/* Inner wobbly orb — the body of the breath. */}
      <Path path={orbPath}>
        <RadialGradient c={centerPoint} r={orbRadius} colors={orbColors} />
        <BlurMask blur={orbBlur} style="solid" />
      </Path>

      {/* Floating glowing energy particles (skipped if reduce motion is on) */}
      {!reduceMotion &&
        Array.from({ length: 12 }).map((_, i) => (
          <FloatingParticle
            key={`particle-${i}`}
            index={i}
            size={size}
            center={center}
            time={time}
            phaseProgress={phaseProgress}
          />
        ))}
    </Canvas>
  );
}
