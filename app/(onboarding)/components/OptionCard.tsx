/**
 * Option Card Component
 * Modern selectable card with glass morphism and animations
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing, BorderRadius, Gradients } from '@/theme';

interface OptionCardProps {
  icon?: string;
  title: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  style?: any;
}

export default function OptionCard({
  icon,
  title,
  description,
  selected = false,
  onPress,
  style,
}: OptionCardProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(selected ? 0.8 : 0);

  React.useEffect(() => {
    glowOpacity.value = withTiming(selected ? 0.8 : 0, { duration: 300 });
  }, [selected]);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, { damping: 15 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15 });
    })
    .onEnd(() => {
      onPress();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        {/* Glow effect for selected state */}
        <Animated.View style={[styles.glow, animatedGlowStyle]} />

        {/* Border gradient */}
        <View style={styles.borderWrapper}>
          {selected ? (
            <LinearGradient
              colors={Gradients.primary.cyan}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}>
              <BlurView intensity={40} tint="dark" style={styles.cardContent}>
                <View style={styles.content}>
                  {icon && <Text style={styles.icon}>{icon}</Text>}
                  <View style={styles.textContainer}>
                    <Text style={[styles.title, selected && styles.titleSelected]}>
                      {title}
                    </Text>
                    {description && (
                      <Text style={styles.description}>{description}</Text>
                    )}
                  </View>
                </View>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && (
                    <LinearGradient
                      colors={Gradients.primary.cyan}
                      style={styles.checkboxGradient}>
                      <Text style={styles.checkmark}>✓</Text>
                    </LinearGradient>
                  )}
                </View>
              </BlurView>
            </LinearGradient>
          ) : (
            <View style={styles.regularBorder}>
              <BlurView intensity={20} tint="dark" style={styles.cardContent}>
                <View style={styles.content}>
                  {icon && <Text style={styles.icon}>{icon}</Text>}
                  <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {description && (
                      <Text style={styles.description}>{description}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.checkbox} />
              </BlurView>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  glow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#00D9FF',
    borderRadius: BorderRadius.card + 2,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  borderWrapper: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },
  gradientBorder: {
    padding: 2,
    borderRadius: BorderRadius.card,
  },
  regularBorder: {
    borderWidth: 2,
    borderColor: Colors.dark.border.default,
    borderRadius: BorderRadius.card,
    backgroundColor: Colors.dark.card.background,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    minHeight: 68,
    borderRadius: BorderRadius.card - 2,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: Spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.bodyLargeBold,
    color: Colors.dark.text.primary,
    marginBottom: 2,
  },
  titleSelected: {
    color: Colors.dark.brand.primary,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  checkboxSelected: {
    borderWidth: 0,
    overflow: 'hidden',
  },
  checkboxGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: Colors.dark.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
