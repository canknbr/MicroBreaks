/**
 * Celebration Overlay Component
 * Confetti/particle effects for milestone achievements
 */

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type CelebrationType = 'goal_complete' | 'new_level' | 'streak_milestone' | 'first_break';

interface CelebrationOverlayProps {
  type: CelebrationType;
  value?: number;
  onDismiss: () => void;
}

const CELEBRATION_CONFIG: Record<CelebrationType, {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}> = {
  goal_complete: {
    icon: 'checkmark-circle',
    title: 'Goal Complete!',
    subtitle: "You've reached your daily goal",
    color: '#06FFA5',
  },
  new_level: {
    icon: 'arrow-up-circle',
    title: 'Level Up!',
    subtitle: 'You reached a new level',
    color: '#B47EFF',
  },
  streak_milestone: {
    icon: 'flame',
    title: 'Streak Milestone!',
    subtitle: 'days in a row',
    color: '#FFD166',
  },
  first_break: {
    icon: 'star',
    title: 'First Break!',
    subtitle: "You've started your wellness journey",
    color: '#00E5FF',
  },
};

// Particle component
function Particle({
  index,
  color,
  startDelay,
}: {
  index: number;
  color: string;
  startDelay: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  const startX = Math.random() * SCREEN_WIDTH;
  const endX = startX + (Math.random() - 0.5) * 200;
  const size = 8 + Math.random() * 12;

  useEffect(() => {
    const delay = startDelay + index * 30;

    scale.value = withDelay(delay, withSpring(1));
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT * 0.7, { duration: 2000 + Math.random() * 1000 })
    );
    translateX.value = withDelay(
      delay,
      withTiming(endX - startX, { duration: 2000 + Math.random() * 1000 })
    );
    rotation.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1), { duration: 2000 })
    );
    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, { duration: 500 })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const isCircle = index % 3 === 0;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          width: size,
          height: size,
          borderRadius: isCircle ? size / 2 : 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export default function CelebrationOverlay({
  type,
  value,
  onDismiss,
}: CelebrationOverlayProps) {
  const config = CELEBRATION_CONFIG[type];
  const overlayOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.5);
  const contentOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 300 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    contentScale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    iconScale.value = withDelay(
      400,
      withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      )
    );

    // Trigger haptic
    runOnJS(triggerHaptic)();
  }, []);

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

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    overlayOpacity.value = withTiming(0, { duration: 200 });
    contentOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(onDismiss, 200);
  };

  // Generate particles with celebration color variants
  const particleColors = [
    config.color,
    '#FFFFFF',
    config.color + '80',
    '#FFD166',
    '#06FFA5',
  ];

  return (
    <Pressable style={styles.container} onPress={handleDismiss}>
      <Animated.View style={[styles.overlay, overlayStyle]} />

      {/* Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Particle
          key={i}
          index={i}
          color={particleColors[i % particleColors.length]}
          startDelay={300}
        />
      ))}

      <Animated.View style={[styles.content, contentStyle]}>
        <Animated.View
          style={[
            styles.iconContainer,
            { backgroundColor: `${config.color}20` },
            iconStyle,
          ]}
        >
          <Ionicons name={config.icon as any} size={48} color={config.color} />
        </Animated.View>

        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>
          {type === 'streak_milestone' && value
            ? `${value} ${config.subtitle}`
            : config.subtitle}
        </Text>

        <View style={styles.dismissHint}>
          <Text style={styles.dismissText}>Tap anywhere to continue</Text>
        </View>
      </Animated.View>
    </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  particle: {
    position: 'absolute',
    top: -20,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  dismissHint: {
    marginTop: 40,
  },
  dismissText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
