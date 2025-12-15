/**
 * Breaks Screen - All break types and guided sessions
 * Premium design with categories and featured breaks
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';

// Break categories with their breaks
const BREAK_CATEGORIES = [
  {
    id: 'quick',
    title: 'Quick Breaks',
    subtitle: '1-2 minutes',
    icon: 'flash',
    color: '#06FFA5',
    breaks: [
      { id: 'eye-rest', title: 'Eye Rest', duration: '1m', icon: '👁️', description: '20-20-20 rule for eye strain' },
      { id: 'deep-breath', title: 'Deep Breath', duration: '1m', icon: '🌬️', description: 'Quick breathing exercise' },
      { id: 'neck-roll', title: 'Neck Roll', duration: '2m', icon: '🧘', description: 'Release neck tension' },
    ],
  },
  {
    id: 'stretch',
    title: 'Stretching',
    subtitle: '3-5 minutes',
    icon: 'body',
    color: '#B47EFF',
    breaks: [
      { id: 'upper-body', title: 'Upper Body', duration: '3m', icon: '💪', description: 'Shoulders, arms, and back' },
      { id: 'lower-body', title: 'Lower Body', duration: '4m', icon: '🦵', description: 'Legs, hips, and ankles' },
      { id: 'full-body', title: 'Full Body', duration: '5m', icon: '🙆', description: 'Complete stretch routine' },
    ],
  },
  {
    id: 'mindful',
    title: 'Mindfulness',
    subtitle: '2-5 minutes',
    icon: 'leaf',
    color: '#00E5FF',
    breaks: [
      { id: 'meditation', title: 'Mini Meditation', duration: '3m', icon: '🧘‍♀️', description: 'Calm your mind' },
      { id: 'body-scan', title: 'Body Scan', duration: '4m', icon: '✨', description: 'Release physical tension' },
      { id: 'gratitude', title: 'Gratitude', duration: '2m', icon: '🙏', description: 'Positive reflection moment' },
    ],
  },
  {
    id: 'active',
    title: 'Active Breaks',
    subtitle: '5-10 minutes',
    icon: 'walk',
    color: '#FFD166',
    breaks: [
      { id: 'walk', title: 'Quick Walk', duration: '5m', icon: '🚶', description: 'Get moving and refresh' },
      { id: 'desk-exercises', title: 'Desk Exercises', duration: '5m', icon: '🏋️', description: 'Light exercises at desk' },
      { id: 'energizer', title: 'Energizer', duration: '3m', icon: '⚡', description: 'Boost your energy' },
    ],
  },
];

// Featured break
const FEATURED_BREAK = {
  id: 'afternoon-reset',
  title: 'Afternoon Reset',
  duration: '5m',
  description: 'Perfect mid-day break combining stretching and breathing',
  gradient: ['#06FFA5', '#00E5FF'] as [string, string],
  icon: '🌟',
};

// Animated Break Card Component
function BreakCard({
  item,
  index,
  categoryColor,
  onPress,
}: {
  item: typeof BREAK_CATEGORIES[0]['breaks'][0];
  index: number;
  categoryColor: string;
  onPress: (id: string) => void;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 400 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(item.id);
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
      <Animated.View style={[styles.breakCard, animatedStyle]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidCardFallback]} />
        )}
        <View style={styles.breakCardContent}>
          <View style={[styles.breakIconContainer, { backgroundColor: `${categoryColor}20` }]}>
            <Text style={styles.breakIcon}>{item.icon}</Text>
          </View>
          <View style={styles.breakInfo}>
            <Text style={styles.breakTitle}>{item.title}</Text>
            <Text style={styles.breakDescription}>{item.description}</Text>
          </View>
          <View style={styles.breakDuration}>
            <Text style={[styles.durationText, { color: categoryColor }]}>{item.duration}</Text>
            <Ionicons name="play-circle" size={24} color={categoryColor} />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

// Category Section Component
function CategorySection({
  category,
  delay,
  onBreakPress,
}: {
  category: typeof BREAK_CATEGORIES[0];
  delay: number;
  onBreakPress: (id: string) => void;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [delay]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.categorySection}>
      <Animated.View style={[styles.categoryHeader, headerStyle]}>
        <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}20` }]}>
          <Ionicons name={category.icon as any} size={20} color={category.color} />
        </View>
        <View>
          <Text style={styles.categoryTitle}>{category.title}</Text>
          <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
        </View>
      </Animated.View>
      <View style={styles.breaksList}>
        {category.breaks.map((item, index) => (
          <BreakCard key={item.id} item={item} index={index} categoryColor={category.color} onPress={onBreakPress} />
        ))}
      </View>
    </View>
  );
}

export default function BreaksScreen() {
  const router = useRouter();
  const headerOpacity = useSharedValue(0);
  const featuredScale = useSharedValue(0.9);
  const featuredOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    featuredOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    featuredScale.value = withDelay(200, withSpring(1));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [20, 0]) }],
  }));

  const featuredStyle = useAnimatedStyle(() => ({
    opacity: featuredOpacity.value,
    transform: [{ scale: featuredScale.value }],
  }));

  const handleBreakPress = (breakId: string) => {
    router.push({
      pathname: '/break-session',
      params: { breakId },
    });
  };

  const handleFeaturedPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/break-session',
      params: { breakId: FEATURED_BREAK.id },
    });
  };

  return (
    <View style={styles.container}>
      {/* Ambient Background */}
      <View style={[styles.ambientGlow, styles.ambientPurple]} />
      <View style={[styles.ambientGlow, styles.ambientTeal]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <Text style={styles.title}>Breaks</Text>
            <Text style={styles.subtitle}>Choose your wellness moment</Text>
          </Animated.View>

          {/* Featured Break */}
          <Pressable onPress={handleFeaturedPress}>
            <Animated.View style={[styles.featuredCard, featuredStyle]}>
              <LinearGradient
                colors={FEATURED_BREAK.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color="#000" />
                  <Text style={styles.featuredBadgeText}>FEATURED</Text>
                </View>
                <Text style={styles.featuredIcon}>{FEATURED_BREAK.icon}</Text>
                <Text style={styles.featuredTitle}>{FEATURED_BREAK.title}</Text>
                <Text style={styles.featuredDescription}>{FEATURED_BREAK.description}</Text>
                <View style={styles.featuredFooter}>
                  <Text style={styles.featuredDuration}>{FEATURED_BREAK.duration}</Text>
                  <View style={styles.featuredButton}>
                    <Text style={styles.featuredButtonText}>Start</Text>
                    <Ionicons name="play" size={16} color="#000" />
                  </View>
                </View>
              </View>
            </Animated.View>
          </Pressable>

          {/* Categories */}
          {BREAK_CATEGORIES.map((category, index) => (
            <CategorySection key={category.id} category={category} delay={300 + index * 150} onBreakPress={handleBreakPress} />
          ))}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  ambientGlow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  ambientPurple: {
    top: -100,
    left: -150,
    width: 400,
    height: 400,
    backgroundColor: '#B47EFF',
  },
  ambientTeal: {
    bottom: 100,
    right: -150,
    width: 350,
    height: 350,
    backgroundColor: '#06FFA5',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  featuredCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  featuredContent: {
    padding: Spacing.lg,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    marginLeft: 4,
  },
  featuredIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featuredButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categorySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  breaksList: {
    gap: 10,
  },
  breakCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  androidCardFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
  },
  breakCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  breakIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  breakIcon: {
    fontSize: 22,
  },
  breakInfo: {
    flex: 1,
  },
  breakTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  breakDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  breakDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  bottomSpacer: {
    height: 120,
  },
});
