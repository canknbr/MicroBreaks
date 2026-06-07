/**
 * Confetti Celebration Component
 * Rich celebration effects with multiple particle types
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/i18n/hooks';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================
// CELEBRATION TYPES & CONFIG
// ============================================================

export type CelebrationType =
  | 'goal_complete'
  | 'new_level'
  | 'streak_milestone'
  | 'first_break'
  | 'achievement'
  | 'perfect_week';

interface CelebrationConfig {
  icon: string;
  emoji: string;
  title: string;
  subtitle: string;
  colors: string[];
  particleCount: number;
}

const CELEBRATION_CONFIGS: Record<CelebrationType, CelebrationConfig> = {
  goal_complete: {
    icon: 'checkmark-circle',
    emoji: '🎯',
    title: 'Goal Complete!',
    subtitle: "You've crushed your daily goal",
    colors: ['#06FFA5', '#00E5FF', '#FFFFFF'],
    particleCount: 50,
  },
  new_level: {
    icon: 'arrow-up-circle',
    emoji: '⬆️',
    title: 'Level Up!',
    subtitle: 'You reached a new level',
    colors: ['#B47EFF', '#FF6B9D', '#FFFFFF'],
    particleCount: 60,
  },
  streak_milestone: {
    icon: 'flame',
    emoji: '🔥',
    title: 'Streak Milestone!',
    subtitle: 'days in a row - incredible!',
    colors: ['#FFD166', '#FF9F1C', '#FF6B6B'],
    particleCount: 55,
  },
  first_break: {
    icon: 'star',
    emoji: '⭐',
    title: 'First Break!',
    subtitle: 'Your wellness journey begins',
    colors: ['#00E5FF', '#06FFA5', '#FFFFFF'],
    particleCount: 40,
  },
  achievement: {
    icon: 'trophy',
    emoji: '🏆',
    title: 'Achievement Unlocked!',
    subtitle: 'You earned a new badge',
    colors: ['#FFD166', '#B47EFF', '#06FFA5'],
    particleCount: 65,
  },
  perfect_week: {
    icon: 'ribbon',
    emoji: '🌟',
    title: 'Perfect Week!',
    subtitle: 'You completed all daily goals',
    colors: ['#FFD166', '#FF6B9D', '#B47EFF', '#06FFA5'],
    particleCount: 80,
  },
};

// ============================================================
// PARTICLE COMPONENTS
// ============================================================

interface ConfettiParticleProps {
  index: number;
  color: string;
  startDelay: number;
  type: 'circle' | 'square' | 'star' | 'ribbon';
}

function ConfettiParticle({ index, color, startDelay, type }: ConfettiParticleProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-50);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Random values for this particle
  const startX = useMemo(() => Math.random() * SCREEN_WIDTH, []);
  const horizontalDrift = useMemo(() => (Math.random() - 0.5) * 200, []);
  const duration = useMemo(() => 2000 + Math.random() * 1500, []);
  const size = useMemo(() => 6 + Math.random() * 10, []);
  const rotationSpeed = useMemo(() => (Math.random() - 0.5) * 720, []);
  const wobble = useMemo(() => Math.random() * 100, []);

  useEffect(() => {
    const delay = startDelay + index * 25;

    // Scale in
    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));

    // Fall with drift
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 100, { duration, easing: Easing.in(Easing.quad) })
    );

    // Horizontal drift with wobble
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(horizontalDrift + wobble, { duration: duration / 4 }),
          withTiming(horizontalDrift - wobble, { duration: duration / 4 })
        ),
        -1,
        true
      )
    );

    // Rotation
    rotation.value = withDelay(
      delay,
      withTiming(rotationSpeed, { duration, easing: Easing.linear })
    );

    // Fade out near end
    opacity.value = withDelay(
      delay + duration * 0.7,
      withTiming(0, { duration: duration * 0.3 })
    );
  }, [
    duration,
    horizontalDrift,
    index,
    opacity,
    rotation,
    rotationSpeed,
    scale,
    startDelay,
    translateX,
    translateY,
    wobble,
  ]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const getShape = () => {
    switch (type) {
      case 'circle':
        return (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            }}
          />
        );
      case 'square':
        return (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
        );
      case 'star':
        return <Text style={{ fontSize: size * 1.5, color }}>✦</Text>;
      case 'ribbon':
      default:
        return (
          <View
            style={{
              width: size * 0.3,
              height: size * 2,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
        );
    }
  };

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: startX },
        animatedStyle,
      ]}
    >
      {getShape()}
    </Animated.View>
  );
}

// Starburst effect
function StarburstRay({ index, color, delay }: { index: number; color: string; delay: number }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = (index * 360) / 12;

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.8, { duration: 200 }));
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 400 })
      )
    );
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { rotate: `${rotation}deg` },
      { scaleY: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.starburstRay, style]}>
      <LinearGradient
        colors={[color, 'transparent']}
        style={styles.rayGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    </Animated.View>
  );
}

// ============================================================
// MAIN CELEBRATION COMPONENT
// ============================================================

interface ConfettiCelebrationProps {
  type: CelebrationType;
  value?: number | string;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export default function ConfettiCelebration({
  type,
  value,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
}: ConfettiCelebrationProps) {
  const config = CELEBRATION_CONFIGS[type];
  const { t } = useTranslation();
  const localizedTitle = t(`home.celebrations.${type}.title`, { defaultValue: config.title });
  const localizedSubtitle = t(`home.celebrations.${type}.subtitle`, {
    defaultValue: config.subtitle,
  });
  const dismissHint = t('home.celebrations.dismissHint', {
    defaultValue: 'Tap anywhere to continue',
  });

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.5);
  const contentOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const ringScale = useSharedValue(0.8);
  const textTranslateY = useSharedValue(30);

  // Generate particles
  const particles = useMemo(() => {
    const types: ConfettiParticleProps['type'][] = ['circle', 'square', 'star', 'ribbon'];
    return Array.from({ length: config.particleCount }).map((_, i) => ({
      index: i,
      color: config.colors[i % config.colors.length],
      type: types[i % types.length],
    }));
  }, [config]);

  const handleDismiss = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    overlayOpacity.value = withTiming(0, { duration: 300 });
    contentOpacity.value = withTiming(0, { duration: 200 });
    contentScale.value = withTiming(0.8, { duration: 300 });
    setTimeout(onDismiss, 300);
  }, [contentOpacity, contentScale, onDismiss, overlayOpacity]);

  useEffect(() => {
    // Trigger haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Overlay fade in
    overlayOpacity.value = withTiming(1, { duration: 400 });

    // Ring expand
    ringScale.value = withDelay(
      100,
      withSequence(
        withTiming(1.5, { duration: 500, easing: Easing.out(Easing.cubic) }),
        withTiming(1.2, { duration: 300 })
      )
    );

    // Content appear
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    contentScale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 100 })
    );

    // Icon bounce
    iconScale.value = withDelay(
      400,
      withSequence(
        withSpring(1.3, { damping: 6 }),
        withSpring(1, { damping: 10 })
      )
    );

    // Emoji pop
    emojiScale.value = withDelay(
      500,
      withSequence(
        withSpring(1.5, { damping: 5 }),
        withSpring(1, { damping: 8 })
      )
    );

    // Text slide up
    textTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Glow pulse
    glowPulse.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Auto-hide
    if (autoHide) {
      const timeout = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [
    autoHide,
    autoHideDelay,
    contentOpacity,
    contentScale,
    emojiScale,
    glowPulse,
    handleDismiss,
    iconScale,
    overlayOpacity,
    ringScale,
    textTranslateY,
  ]);

  // Animated styles
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.6]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.2]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: interpolate(ringScale.value, [0.8, 1.5], [0, 0.5], Extrapolation.CLAMP),
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: textTranslateY.value }],
    opacity: interpolate(textTranslateY.value, [30, 0], [0, 1]),
  }));

  return (
    <Pressable style={styles.container} onPress={handleDismiss}>
      {/* Backdrop */}
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
      </Animated.View>

      {/* Confetti particles */}
      {particles.map((p) => (
        <ConfettiParticle
          key={p.index}
          index={p.index}
          color={p.color}
          type={p.type}
          startDelay={300}
        />
      ))}

      {/* Starburst rays */}
      {Array.from({ length: 12 }).map((_, i) => (
        <StarburstRay
          key={i}
          index={i}
          color={config.colors[0]}
          delay={200}
        />
      ))}

      {/* Main content */}
      <Animated.View style={[styles.content, contentStyle]}>
        {/* Ambient glow */}
        <Animated.View
          style={[
            styles.glow,
            { backgroundColor: config.colors[0] },
            glowStyle,
          ]}
        />

        {/* Expanding ring */}
        <Animated.View
          style={[
            styles.ring,
            { borderColor: config.colors[0] },
            ringStyle,
          ]}
        />

        {/* Icon container */}
        <Animated.View style={iconStyle}>
          <LinearGradient
            colors={[config.colors[0], config.colors[1] || config.colors[0]]}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name={config.icon as any} size={48} color="#000" />
          </LinearGradient>
        </Animated.View>

        {/* Emoji */}
        <Animated.View style={[styles.emojiContainer, emojiStyle]}>
          <Text style={styles.emoji}>{config.emoji}</Text>
        </Animated.View>

        {/* Text content */}
        <Animated.View style={textStyle}>
          <Text style={styles.title}>{localizedTitle}</Text>
          <Text style={styles.subtitle}>
            {type === 'streak_milestone' && value
              ? `${value} ${localizedSubtitle}`
              : localizedSubtitle}
          </Text>
        </Animated.View>

        {/* Dismiss hint */}
        <View style={styles.dismissHint}>
          <Text style={styles.dismissText}>{dismissHint}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ============================================================
// MINI CELEBRATION (for inline celebrations)
// ============================================================

interface MiniCelebrationProps {
  visible: boolean;
  message: string;
  color?: string;
  onHide?: () => void;
}

export function MiniCelebration({
  visible,
  message,
  color = '#06FFA5',
  onHide,
}: MiniCelebrationProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 12 });

      // Auto hide after 3 seconds
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(-100, { duration: 300 });
        setTimeout(() => onHide?.(), 300);
      }, 3000);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [onHide, opacity, translateY, visible]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.miniContainer, style]}>
      <LinearGradient
        colors={[`${color}20`, `${color}10`]}
        style={styles.miniGradient}
      >
        <Text style={styles.miniEmoji}>🎉</Text>
        <Text style={[styles.miniMessage, { color }]}>{message}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    top: -50,
  },
  starburstRay: {
    position: 'absolute',
    width: 3,
    height: 150,
    alignSelf: 'center',
    top: '50%',
    marginTop: -150,
  },
  rayGradient: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  emojiContainer: {
    position: 'absolute',
    top: -30,
    right: -20,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  dismissHint: {
    marginTop: 50,
  },
  dismissText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  // Mini celebration
  miniContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  miniGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  miniEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  miniMessage: {
    fontSize: 16,
    fontWeight: '600',
  },
});
