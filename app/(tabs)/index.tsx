/**
 * Home Screen - MicroBreaks Premium Dashboard
 * Zen Master Level Implementation
 *
 * Features:
 * - Pull to refresh
 * - Personalized greeting with user name
 * - Dynamic time-aware theming
 * - Loading skeleton
 * - Empty states
 * - Celebration animations
 * - Full accessibility support
 * - Haptic feedback
 * - Performance optimized with memoization
 */

import React, { useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';
import {
  ProgressRing,
  QuickBreakCard,
  StreakCalendar,
  CountdownTimer,
  SmartInsight,
  MotivationalQuote,
  LevelBadge,
  WeeklyInsights,
  HomeScreenSkeleton,
  EmptyState,
  CelebrationOverlay,
} from '@/components/home';
import {
  useHomeData,
  useGreeting,
  useAmbientColors,
  useFormattedDate,
} from '@/hooks/useHomeData';
import { useNotificationStore } from '@/store';
import { useTheme, ThemeColors } from '@/hooks/useTheme';

// Break types data - IDs match exercise IDs in data/exercises.ts
const BREAK_TYPES = [
  { id: 'neck-roll', icon: '🧘', title: 'Neck', duration: '2m', color: '#06FFA5' },
  { id: 'eye-rest', icon: '👁️', title: 'Eyes', duration: '1m', color: '#00E5FF' },
  { id: 'full-body', icon: '🙆', title: 'Stretch', duration: '5m', color: '#B47EFF' },
  { id: 'walk', icon: '🚶', title: 'Walk', duration: '5m', color: '#FFD166' },
  { id: 'deep-breath', icon: '🌬️', title: 'Breathe', duration: '1m', color: '#4ECDC4' },
] as const;

// Memoized Quick Break Card with accessibility
const MemoizedQuickBreakCard = memo(QuickBreakCard);

// Header Actions Component
const HeaderActions = memo(function HeaderActions({
  onNotificationsPress,
  onSettingsPress,
  notificationCount = 0,
  theme,
}: {
  onNotificationsPress: () => void;
  onSettingsPress: () => void;
  notificationCount?: number;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.headerActions}>
      <Pressable
        style={[styles.headerActionButton, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }]}
        onPress={onNotificationsPress}
        accessibilityRole="button"
        accessibilityLabel={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ''}`}
      >
        <Ionicons name="notifications-outline" size={22} color={theme.text.secondary} />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </Pressable>
      <Pressable
        style={[styles.headerActionButton, { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' }]}
        onPress={onSettingsPress}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <Ionicons name="settings-outline" size={22} color={theme.text.secondary} />
      </Pressable>
    </View>
  );
});

// Smart Insight Generator
function useSmartInsight(
  breaksTaken: number,
  breaksGoal: number,
  lastBreakMinutesAgo: number,
  streak: number
) {
  return useMemo(() => {
    // Priority 1: Urgent - been sitting too long
    if (lastBreakMinutesAgo > 90) {
      return {
        type: 'warning' as const,
        title: 'Time for a break!',
        message: `You've been working for ${Math.floor(lastBreakMinutesAgo / 60)}h ${lastBreakMinutesAgo % 60}m. Your body needs movement.`,
        actionLabel: 'Start Break',
      };
    }

    // Priority 2: Achievement - streak milestone
    if (streak >= 5 && streak % 5 === 0) {
      return {
        type: 'achievement' as const,
        title: '🔥 Hot streak!',
        message: `${streak} days in a row! You're building a healthy habit.`,
      };
    }

    // Priority 3: Motivation - close to goal
    const progress = (breaksTaken / breaksGoal) * 100;
    if (progress >= 75 && progress < 100) {
      return {
        type: 'motivation' as const,
        title: 'Almost there!',
        message: `Just ${breaksGoal - breaksTaken} more break${breaksGoal - breaksTaken > 1 ? 's' : ''} to reach your daily goal.`,
      };
    }

    // Priority 4: Goal complete
    if (progress >= 100) {
      return {
        type: 'achievement' as const,
        title: '🎉 Goal Complete!',
        message: "Amazing work! You've reached your daily wellness goal.",
      };
    }

    // Default: Pro tip
    const tips = [
      'Short breaks every 25 minutes boost productivity by 30%.',
      'Eye breaks reduce digital eye strain significantly.',
      'Standing up regularly improves posture and energy.',
      'Deep breathing reduces stress hormones instantly.',
    ];
    return {
      type: 'suggestion' as const,
      title: 'Pro tip',
      message: tips[Math.floor(Math.random() * tips.length)],
      actionLabel: 'Learn more',
    };
  }, [breaksTaken, breaksGoal, lastBreakMinutesAgo, streak]);
}

export default function HomeScreen() {
  // Theme
  const theme = useTheme();

  // Data hook
  const {
    data,
    loading,
    error,
    refresh,
    isRefreshing,
    isEmpty,
    isNewUser,
    hasCompletedGoal,
    shouldCelebrate,
    clearCelebration,
  } = useHomeData();

  // Notification count from store
  const unreadCount = useNotificationStore((state) => state.notifications.filter((n) => !n.read).length);

  // Dynamic content hooks
  const { greeting, subtitle: dynamicSubtitle } = useGreeting(data?.user.name);
  const ambientColors = useAmbientColors();
  const formattedDate = useFormattedDate();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const ambientScale = useSharedValue(1);
  const ambientOpacity = useSharedValue(0.15);
  const scrollY = useSharedValue(0);

  // Smart insight
  const smartInsight = useSmartInsight(
    data?.dailyProgress.breaksTaken ?? 0,
    data?.dailyProgress.breaksGoal ?? 8,
    data?.dailyProgress.lastBreakMinutesAgo ?? 0,
    data?.streak.current ?? 0
  );

  // Progress percentage
  const progress = useMemo(() => {
    if (!data) return 0;
    return (data.dailyProgress.breaksTaken / data.dailyProgress.breaksGoal) * 100;
  }, [data]);

  // Scroll handler for parallax
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animations
  useEffect(() => {
    if (!loading && data) {
      headerOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));

      // Subtle ambient glow animation
      ambientScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      ambientOpacity.value = withRepeat(
        withSequence(
          withTiming(0.08, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.04, { duration: 8000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [loading, data]);

  // Animated styles
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      { translateY: interpolate(headerOpacity.value, [0, 1], [20, 0]) },
      { scale: interpolate(scrollY.value, [0, 100], [1, 0.95], 'clamp') },
    ],
  }));

  const ambientTealStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ambientScale.value }],
    opacity: ambientOpacity.value,
    backgroundColor: ambientColors.primary,
  }));

  const ambientPurpleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ambientScale.value }],
    opacity: ambientOpacity.value * 0.8,
    backgroundColor: ambientColors.secondary,
  }));

  // Handlers with haptic feedback
  const handleBreakPress = useCallback((breakId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/break-session',
      params: { breakId },
    });
  }, []);

  const handleSmartInsightAction = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to breaks tab
    router.push('/breaks');
  }, []);

  const handleNotificationsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/notifications');
  }, [router]);

  const handleSettingsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile');
  }, []);

  const handleEmptyStateAction = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/breaks');
  }, []);

  const handleSeeAllBreaks = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/breaks');
  }, []);

  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refresh();
  }, [refresh]);

  // Dynamic subtitle based on state
  const subtitle = useMemo(() => {
    if (hasCompletedGoal) return "Amazing! You've crushed your goal today";
    if (isEmpty) return 'Start your wellness journey today';
    return dynamicSubtitle;
  }, [hasCompletedGoal, isEmpty, dynamicSubtitle]);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <Animated.View style={[styles.ambientGlow, styles.ambientTeal]} />
        <Animated.View style={[styles.ambientGlow, styles.ambientPurple]} />
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <HomeScreenSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.centerContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.accent.primary}
              />
            }
          >
            <EmptyState type="error" onAction={handleRefresh} />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Celebration Overlay */}
      {shouldCelebrate && (
        <CelebrationOverlay
          type={shouldCelebrate}
          value={shouldCelebrate === 'streak_milestone' ? data?.streak.current : undefined}
          onDismiss={clearCelebration}
        />
      )}

      {/* Ambient Background Glows - Time Aware */}
      <Animated.View style={[styles.ambientGlow, styles.ambientTeal, ambientTealStyle]} />
      <Animated.View style={[styles.ambientGlow, styles.ambientPurple, ambientPurpleStyle]} />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent.primary}
              progressViewOffset={20}
            />
          }
        >
          {/* Header with Date and Actions */}
          <Animated.View style={[styles.header, headerStyle]}>
            <View style={styles.headerTop}>
              <Text
                style={[styles.dateText, { color: theme.text.muted }]}
                accessibilityRole="text"
                accessibilityLabel={`Today is ${formattedDate}`}
              >
                {formattedDate}
              </Text>
              <HeaderActions
                onNotificationsPress={handleNotificationsPress}
                onSettingsPress={handleSettingsPress}
                notificationCount={unreadCount}
                theme={theme}
              />
            </View>
            <Text
              style={[styles.greeting, { color: theme.text.primary }]}
              accessibilityRole="header"
              accessibilityLabel={greeting}
            >
              {greeting}
            </Text>
            <Text
              style={[styles.subtitle, { color: theme.text.secondary }]}
              accessibilityRole="text"
            >
              {subtitle}
            </Text>
          </Animated.View>

          {/* New User / Empty State */}
          {isNewUser ? (
            <EmptyState type="new_user" onAction={handleEmptyStateAction} />
          ) : (
            <>
              {/* PRIORITY 1: Take a Break - Most Important Action */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text
                      style={[styles.sectionTitle, { color: theme.text.primary }]}
                      accessibilityRole="header"
                    >
                      Take a Break
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                      Tap to start a quick exercise
                    </Text>
                  </View>
                  <Pressable
                    style={styles.seeAllButton}
                    onPress={handleSeeAllBreaks}
                  >
                    <Text style={[styles.seeAllText, { color: theme.accent.primary }]}>See All</Text>
                    <Ionicons name="chevron-forward" size={14} color={theme.accent.primary} />
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.breakTypesScroll}
                  accessibilityRole="list"
                >
                  {BREAK_TYPES.map((breakType, index) => (
                    <MemoizedQuickBreakCard
                      key={breakType.id}
                      icon={breakType.icon}
                      title={breakType.title}
                      duration={breakType.duration}
                      color={breakType.color}
                      onPress={() => handleBreakPress(breakType.id)}
                      isRecommended={index === 0}
                      accessibilityLabel={`Start ${breakType.title} break, ${breakType.duration}`}
                      accessibilityHint="Double tap to begin this exercise"
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Smart Insight - Context-aware message (only if urgent) */}
              {smartInsight.type === 'warning' && (
                <SmartInsight
                  type={smartInsight.type}
                  title={smartInsight.title}
                  message={smartInsight.message}
                  actionLabel={smartInsight.actionLabel}
                  onAction={handleSmartInsightAction}
                  delay={200}
                />
              )}

              {/* Progress + Stats Combined Row */}
              <View style={styles.progressStatsRow}>
                {/* Mini Progress Ring */}
                <View
                  style={styles.miniProgressContainer}
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityLabel={`Daily progress: ${data?.dailyProgress.breaksTaken} of ${data?.dailyProgress.breaksGoal} breaks completed`}
                >
                  <ProgressRing
                    progress={progress}
                    size={100}
                    strokeWidth={8}
                    colors={[ambientColors.primary, ambientColors.secondary]}
                    delay={300}
                  >
                    <Text style={[styles.miniProgressValue, { color: theme.text.primary }]}>{data?.dailyProgress.breaksTaken}</Text>
                    <Text style={[styles.miniProgressLabel, { color: theme.text.muted }]}>/{data?.dailyProgress.breaksGoal}</Text>
                  </ProgressRing>
                </View>

                {/* Stats */}
                <View
                  style={[
                    styles.compactStatsCard,
                    {
                      borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                      backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: theme.isDark ? 0 : 0.1,
                      shadowRadius: 12,
                      elevation: theme.isDark ? 0 : 5,
                    },
                  ]}
                  accessible
                  accessibilityRole="summary"
                >
                  {/* BlurView only for dark mode */}
                  {theme.isDark && (
                    Platform.OS === 'ios' ? (
                      <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
                    )
                  )}
                  <View style={styles.compactStatsContent}>
                    <View style={styles.compactStatItem}>
                      <Ionicons name="time-outline" size={16} color={theme.accent.secondary} />
                      <Text style={[styles.compactStatValue, { color: theme.text.primary }]}>{data?.dailyProgress.minutesInvested ?? 0}m</Text>
                      <Text style={[styles.compactStatLabel, { color: theme.text.muted }]}>today</Text>
                    </View>
                    <View style={[styles.compactStatDivider, { backgroundColor: theme.border.subtle }]} />
                    <View style={styles.compactStatItem}>
                      <Ionicons name="flame" size={16} color={theme.accent.warning} />
                      <Text style={[styles.compactStatValue, { color: theme.text.primary }]}>{data?.streak.current ?? 0}</Text>
                      <Text style={[styles.compactStatLabel, { color: theme.text.muted }]}>streak</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Countdown Timer */}
              {data && data.nextBreakMinutes > 0 && (
                <View style={styles.section}>
                  <CountdownTimer
                    targetMinutes={data.nextBreakMinutes}
                    onComplete={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  />
                </View>
              )}

              {/* Level Badge - Gamification */}
              {data && (
                <LevelBadge
                  level={data.user.level}
                  currentXP={data.user.currentXP}
                  nextLevelXP={data.user.nextLevelXP}
                  title={data.user.levelTitle}
                  delay={400}
                />
              )}

              {/* Non-urgent Smart Insight */}
              {smartInsight.type !== 'warning' && (
                <SmartInsight
                  type={smartInsight.type}
                  title={smartInsight.title}
                  message={smartInsight.message}
                  actionLabel={smartInsight.actionLabel}
                  onAction={handleSmartInsightAction}
                  delay={500}
                />
              )}

              {/* Weekly Insights - Analytics */}
              {data && (
                <WeeklyInsights
                  insights={data.weeklyInsights}
                  delay={700}
                />
              )}

              {/* Streak Calendar */}
              {data && (
                <View
                  style={[
                    styles.streakCard,
                    {
                      borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                      backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: theme.isDark ? 0 : 0.1,
                      shadowRadius: 12,
                      elevation: theme.isDark ? 0 : 5,
                    },
                  ]}
                  accessible
                  accessibilityRole="summary"
                  accessibilityLabel={`Weekly streak calendar. Current streak: ${data.streak.current} days`}
                >
                  {/* BlurView only for dark mode */}
                  {theme.isDark && (
                    Platform.OS === 'ios' ? (
                      <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
                    )
                  )}
                  {theme.isDark && (
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.08)', 'transparent']}
                      style={styles.cardHighlight}
                    />
                  )}
                  <Text style={[styles.streakTitle, { color: theme.text.primary }]}>This Week</Text>
                  <StreakCalendar
                    completedDays={data.streak.completedDays}
                    currentDayIndex={data.streak.currentDayIndex}
                    streak={data.streak.current}
                  />
                </View>
              )}

              {/* Motivational Quote */}
              <MotivationalQuote delay={900} />
            </>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </Animated.ScrollView>
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
  },
  ambientTeal: {
    top: -150,
    right: -150,
    width: 400,
    height: 400,
  },
  ambientPurple: {
    bottom: -50,
    left: -180,
    width: 450,
    height: 450,
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  progressStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: 12,
  },
  miniProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniProgressValue: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  miniProgressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: -4,
  },
  compactStatsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
  },
  compactStatsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  compactStatItem: {
    alignItems: 'center',
  },
  compactStatValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  compactStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  compactStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  androidCardFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
    borderRadius: 20,
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  statsDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#06FFA5',
    marginRight: 2,
  },
  breakTypesScroll: {
    paddingRight: Spacing.lg,
  },
  streakCard: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 120,
  },
});
