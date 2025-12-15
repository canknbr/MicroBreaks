/**
 * Onboarding Animations
 * Beautiful animated illustrations for onboarding screens
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// ============================================================
// WELCOME ANIMATION - Breathing zen circle
// ============================================================
export function WelcomeAnimation({ size = 200 }: { size?: number }) {
  const breathScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const ringRotation = useSharedValue(0);
  const particleOffset = useSharedValue(0);

  useEffect(() => {
    // Breathing animation
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow pulse
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Ring rotation
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );

    // Particles
    particleOffset.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ambient glow */}
      <Animated.View
        style={[
          styles.ambientGlow,
          { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75 },
          glowStyle,
        ]}
      />

      {/* Rotating dashed ring */}
      <Animated.View
        style={[
          styles.dashedRing,
          { width: size * 0.9, height: size * 0.9, borderRadius: size * 0.45 },
          ringStyle,
        ]}
      />

      {/* Main breathing circle */}
      <Animated.View style={breathStyle}>
        <LinearGradient
          colors={['#06FFA5', '#00E5FF']}
          style={[
            styles.mainCircle,
            { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3 },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.zenEmoji}>🧘</Text>
        </LinearGradient>
      </Animated.View>

      {/* Floating particles */}
      <FloatingParticle delay={0} size={size} color="#06FFA5" />
      <FloatingParticle delay={1000} size={size} color="#00E5FF" />
      <FloatingParticle delay={2000} size={size} color="#B47EFF" />
    </View>
  );
}

function FloatingParticle({ delay, size, color }: { delay: number; size: number; color: string }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-size * 0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const randomX = (Math.random() - 0.5) * size * 0.8;
  const randomY = (Math.random() - 0.5) * size * 0.5;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
          left: size / 2 + randomX,
          top: size / 2 + randomY,
        },
        style,
      ]}
    />
  );
}

// ============================================================
// STRETCH ANIMATION - Body stretching figure
// ============================================================
export function StretchAnimation({ size = 200 }: { size?: number }) {
  const armRotation = useSharedValue(0);
  const bodyStretch = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    // Arms up and down
    armRotation.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-30, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Body stretch
    bodyStretch.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Pulse effect
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const leftArmStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-45 + armRotation.value}deg` }],
  }));

  const rightArmStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${45 - armRotation.value}deg` }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: bodyStretch.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.2, 0.5]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.3]) }],
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background pulse */}
      <Animated.View
        style={[
          styles.pulseCircle,
          { width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4 },
          pulseStyle,
        ]}
      />

      {/* Stick figure */}
      <View style={styles.stickFigure}>
        {/* Head */}
        <View style={[styles.head, { backgroundColor: '#B47EFF' }]} />

        {/* Body */}
        <Animated.View style={[styles.body, bodyStyle]}>
          <View style={[styles.torso, { backgroundColor: '#B47EFF' }]} />
        </Animated.View>

        {/* Arms */}
        <View style={styles.armsContainer}>
          <Animated.View style={[styles.arm, styles.leftArm, leftArmStyle]}>
            <View style={[styles.armLine, { backgroundColor: '#B47EFF' }]} />
          </Animated.View>
          <Animated.View style={[styles.arm, styles.rightArm, rightArmStyle]}>
            <View style={[styles.armLine, { backgroundColor: '#B47EFF' }]} />
          </Animated.View>
        </View>

        {/* Legs */}
        <View style={styles.legsContainer}>
          <View style={[styles.leg, { backgroundColor: '#B47EFF' }]} />
          <View style={[styles.leg, { backgroundColor: '#B47EFF' }]} />
        </View>
      </View>

      {/* Stretch emoji */}
      <Text style={[styles.stretchEmoji, { top: size * 0.1 }]}>🙆</Text>
    </View>
  );
}

// ============================================================
// TIMER ANIMATION - Clock with ticking
// ============================================================
export function TimerAnimation({ size = 200 }: { size?: number }) {
  const secondHand = useSharedValue(0);
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.3);

  useEffect(() => {
    // Second hand rotation
    secondHand.value = withRepeat(
      withTiming(360, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    // Pulse
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow
    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const handStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${secondHand.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow */}
      <Animated.View
        style={[
          styles.timerGlow,
          { width: size * 0.9, height: size * 0.9, borderRadius: size * 0.45 },
          glowStyle,
        ]}
      />

      {/* Clock face */}
      <Animated.View style={pulseStyle}>
        <View
          style={[
            styles.clockFace,
            { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3 },
          ]}
        >
          {/* Clock markers */}
          {[0, 90, 180, 270].map((deg) => (
            <View
              key={deg}
              style={[
                styles.clockMarker,
                { transform: [{ rotate: `${deg}deg` }, { translateY: -size * 0.23 }] },
              ]}
            />
          ))}

          {/* Center */}
          <View style={styles.clockCenter} />

          {/* Second hand */}
          <Animated.View style={[styles.secondHand, handStyle]}>
            <View style={styles.handLine} />
          </Animated.View>

          {/* Timer text */}
          <Text style={styles.timerText}>25:00</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ============================================================
// SUCCESS ANIMATION - Checkmark celebration
// ============================================================
export function SuccessAnimation({ size = 200 }: { size?: number }) {
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const sparkleOpacity = useSharedValue(0);

  useEffect(() => {
    // Check appear with bounce
    checkOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    checkScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      )
    );

    // Ring expand
    ringScale.value = withDelay(
      100,
      withSequence(
        withTiming(1.3, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300 })
      )
    );

    // Sparkles
    sparkleOpacity.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Expanding ring */}
      <Animated.View
        style={[
          styles.successRing,
          { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 },
          ringStyle,
        ]}
      />

      {/* Check circle */}
      <Animated.View style={checkStyle}>
        <LinearGradient
          colors={['#06FFA5', '#00E5FF']}
          style={[
            styles.checkCircle,
            { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25 },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.checkEmoji}>✓</Text>
        </LinearGradient>
      </Animated.View>

      {/* Sparkles */}
      <Animated.View style={[styles.sparklesContainer, sparkleStyle]}>
        <Text style={[styles.sparkle, { top: 10, left: size * 0.2 }]}>✨</Text>
        <Text style={[styles.sparkle, { top: 20, right: size * 0.15 }]}>✨</Text>
        <Text style={[styles.sparkle, { bottom: 30, left: size * 0.1 }]}>✨</Text>
        <Text style={[styles.sparkle, { bottom: 20, right: size * 0.2 }]}>✨</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Welcome Animation
  ambientGlow: {
    position: 'absolute',
    backgroundColor: '#06FFA5',
    opacity: 0.15,
  },
  dashedRing: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(6, 255, 165, 0.3)',
  },
  mainCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  zenEmoji: {
    fontSize: 48,
  },
  particle: {
    position: 'absolute',
  },
  // Stretch Animation
  pulseCircle: {
    position: 'absolute',
    backgroundColor: '#B47EFF',
  },
  stickFigure: {
    alignItems: 'center',
  },
  head: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  body: {
    marginTop: 5,
  },
  torso: {
    width: 6,
    height: 50,
    borderRadius: 3,
  },
  armsContainer: {
    position: 'absolute',
    top: 40,
    flexDirection: 'row',
  },
  arm: {
    position: 'absolute',
  },
  leftArm: {
    left: -30,
  },
  rightArm: {
    right: -30,
  },
  armLine: {
    width: 35,
    height: 6,
    borderRadius: 3,
  },
  legsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  leg: {
    width: 6,
    height: 40,
    borderRadius: 3,
  },
  stretchEmoji: {
    position: 'absolute',
    fontSize: 60,
  },
  // Timer Animation
  timerGlow: {
    position: 'absolute',
    backgroundColor: '#FFD166',
    opacity: 0.2,
  },
  clockFace: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    borderWidth: 3,
    borderColor: '#FFD166',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockMarker: {
    position: 'absolute',
    width: 3,
    height: 10,
    backgroundColor: '#FFD166',
    borderRadius: 2,
  },
  clockCenter: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD166',
  },
  secondHand: {
    position: 'absolute',
    width: 2,
    height: 40,
    alignItems: 'center',
  },
  handLine: {
    width: 2,
    height: 35,
    backgroundColor: '#FFD166',
    borderRadius: 1,
  },
  timerText: {
    position: 'absolute',
    bottom: 15,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD166',
  },
  // Success Animation
  successRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#06FFA5',
    opacity: 0.5,
  },
  checkCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#06FFA5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  checkEmoji: {
    fontSize: 36,
    color: '#000',
    fontWeight: '700',
  },
  sparklesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
});
