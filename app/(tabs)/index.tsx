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

import React, { useEffect, useMemo, useCallback, memo, useState } from 'react';
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
  HeaderActions,
  StreakCalendar,
  // CountdownTimer replaced by TimerWidget
  SmartInsight,
  MotivationalQuote,
  LevelBadge,
  WeeklyInsights,
  HomeScreenSkeleton,
  EmptyState,
  CelebrationOverlay,
  TimerWidget,
  PresetPicker,
} from '@/components/home';
import {
  useHomeData,
  useGreeting,
  useAmbientColors,
  useFormattedDate,
} from '@/hooks/useHomeData';
import { getExerciseById } from '@/data/exercises';
import {
  BREAK_TYPES,
  RECOVERY_STATES,
  RecoveryStateId,
  formatNextBreakWindow,
  formatRelativeMinutes,
  getDefaultRecoveryStateId,
  getRecoveryReason,
} from '@/features/recovery/states';
import { useNotificationStore, useOnboardingStore } from '@/store';
import { useTimerPreferences, useTimerActions } from '@/store/timerStore';
import { useTheme } from '@/hooks/useTheme';
import { useSmartInsight } from '@/hooks/useSmartInsight';
import { useTranslation } from '@/i18n/hooks';

// Memoized Quick Break Card with accessibility
const MemoizedQuickBreakCard = memo(QuickBreakCard);

export default function HomeScreen() {
  // Theme
  const theme = useTheme();
  const { t } = useTranslation();
  const onboardingData = useOnboardingStore((state) => state.data);

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

  // Timer state
  const timerPreferences = useTimerPreferences();
  const timerActions = useTimerActions();
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [selectedRecoveryStateId, setSelectedRecoveryStateId] = useState<RecoveryStateId>(
    getDefaultRecoveryStateId(onboardingData.painAreas, onboardingData.breakStyle)
  );

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
    return data.dailyProgress.breaksGoal > 0
      ? (data.dailyProgress.breaksTaken / data.dailyProgress.breaksGoal) * 100
      : 0;
  }, [data]);

  const defaultRecoveryStateId = useMemo(
    () => getDefaultRecoveryStateId(onboardingData.painAreas, onboardingData.breakStyle),
    [onboardingData.breakStyle, onboardingData.painAreas]
  );

  useEffect(() => {
    setSelectedRecoveryStateId(defaultRecoveryStateId);
  }, [defaultRecoveryStateId]);

  const selectedRecoveryState = useMemo(
    () =>
      RECOVERY_STATES.find((state) => state.id === selectedRecoveryStateId) ??
      RECOVERY_STATES[0],
    [selectedRecoveryStateId]
  );

  const recommendedExercise = useMemo(
    () => getExerciseById(selectedRecoveryState.breakId),
    [selectedRecoveryState.breakId]
  );

  const recommendedDuration = useMemo(
    () =>
      recommendedExercise
        ? `${Math.max(1, Math.round(recommendedExercise.totalDuration / 60))} min`
        : '1 min',
    [recommendedExercise]
  );

  const recoveryReason = useMemo(
    () =>
      getRecoveryReason(
        selectedRecoveryState.id,
        data?.dailyProgress.lastBreakMinutesAgo ?? 999,
        data?.dailyProgress.breaksTaken ?? 0,
        isNewUser
      ),
    [selectedRecoveryState.id, data?.dailyProgress.lastBreakMinutesAgo, data?.dailyProgress.breaksTaken, isNewUser]
  );

  const lastResetLabel = useMemo(
    () => formatRelativeMinutes(data?.dailyProgress.lastBreakMinutesAgo ?? 999),
    [data?.dailyProgress.lastBreakMinutesAgo]
  );

  const nextResetLabel = useMemo(
    () => formatNextBreakWindow(data?.nextBreakMinutes ?? 0),
    [data?.nextBreakMinutes]
  );

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
  }, [ambientOpacity, ambientScale, data, headerOpacity, loading]);

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

  const handleRecoveryStatePress = useCallback((stateId: RecoveryStateId) => {
    Haptics.selectionAsync();
    setSelectedRecoveryStateId(stateId);
  }, []);

  const handleNotificationsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/notifications');
  }, []);

  const handleSettingsPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/profile');
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
    if (isNewUser) return 'Choose the kind of relief you want and start with one guided reset.';
    if (isEmpty) return 'Pick what your body or mind needs right now and take a short reset.';
    if ((data?.dailyProgress.lastBreakMinutesAgo ?? 0) > 90) {
      return 'You are overdue for a reset. Start with the recovery state that feels most relevant right now.';
    }
    return dynamicSubtitle;
  }, [hasCompletedGoal, isEmpty, isNewUser, dynamicSubtitle, data?.dailyProgress.lastBreakMinutesAgo]);

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

          {/* Current state picker */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={[styles.sectionTitle, { color: theme.text.primary }]}
                  accessibilityRole="header"
                >
                  What do you need right now?
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                  Pick the kind of relief you want first. We&apos;ll surface the fastest starter reset for it.
                </Text>
              </View>
            </View>

            <View style={styles.recoveryStateGrid}>
              {RECOVERY_STATES.map((state) => {
                const isSelected = state.id === selectedRecoveryState.id;

                return (
                  <Pressable
                    key={state.id}
                    style={[
                      styles.recoveryStateChip,
                      {
                        borderColor: isSelected ? state.color : theme.border.subtle,
                        backgroundColor: theme.isDark ? 'rgba(19, 19, 26, 0.92)' : theme.background.card,
                      },
                    ]}
                    onPress={() => handleRecoveryStatePress(state.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${state.label}. ${state.description}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={[styles.recoveryStateIcon, { backgroundColor: `${state.color}18` }]}>
                      <Text style={styles.recoveryStateEmoji}>{state.icon}</Text>
                    </View>
                    <View style={styles.recoveryStateText}>
                      <Text
                        style={[
                          styles.recoveryStateLabel,
                          { color: isSelected ? state.color : theme.text.primary },
                        ]}
                      >
                        {state.label}
                      </Text>
                      <Text style={[styles.recoveryStateDescription, { color: theme.text.muted }]}>
                        {state.description}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Recommended reset */}
          <View
            style={[
              styles.recommendedCard,
              {
                borderColor: theme.isDark ? theme.border.subtle : 'transparent',
                backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: theme.isDark ? 0 : 0.12,
                shadowRadius: 16,
                elevation: theme.isDark ? 0 : 6,
              },
            ]}
          >
            {theme.isDark && (
              Platform.OS === 'ios' ? (
                <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
              ) : (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.92)' }]} />
              )
            )}

            <LinearGradient
              colors={[`${selectedRecoveryState.color}1f`, 'transparent']}
              style={styles.recommendedGlow}
            />

            <View style={styles.recommendedHeader}>
              <View style={[styles.recommendedBadge, { backgroundColor: `${selectedRecoveryState.color}18` }]}>
                <Text style={[styles.recommendedBadgeText, { color: selectedRecoveryState.color }]}>
                  RECOMMENDED NEXT
                </Text>
              </View>
              {smartInsight.type === 'warning' && (
                <View style={[styles.urgencyBadge, { backgroundColor: `${theme.accent.warning}18` }]}>
                  <Ionicons name="time-outline" size={12} color={theme.accent.warning} />
                  <Text style={[styles.urgencyBadgeText, { color: theme.accent.warning }]}>
                    Due now
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.recommendedHeroRow}>
              <View style={[styles.recommendedIconWrap, { backgroundColor: `${selectedRecoveryState.color}18` }]}>
                <Text style={styles.recommendedEmoji}>{selectedRecoveryState.icon}</Text>
              </View>
              <View style={styles.recommendedCopy}>
                <Text style={[styles.recommendedTitle, { color: theme.text.primary }]}>
                  {selectedRecoveryState.title}
                </Text>
                <Text style={[styles.recommendedMeta, { color: selectedRecoveryState.color }]}>
                  {recommendedExercise?.title ?? selectedRecoveryState.label} • {recommendedDuration}
                </Text>
              </View>
            </View>

            <Text style={[styles.recommendedReason, { color: theme.text.secondary }]}>
              {recoveryReason}
            </Text>

            <View style={styles.rhythmRow}>
              <View style={styles.rhythmMetric}>
                <Text style={[styles.rhythmValue, { color: theme.text.primary }]}>{lastResetLabel}</Text>
                <Text style={[styles.rhythmLabel, { color: theme.text.muted }]}>Last reset</Text>
              </View>
              <View style={[styles.rhythmDivider, { backgroundColor: theme.border.subtle }]} />
              <View style={styles.rhythmMetric}>
                <Text style={[styles.rhythmValue, { color: theme.text.primary }]}>{nextResetLabel}</Text>
                <Text style={[styles.rhythmLabel, { color: theme.text.muted }]}>Next window</Text>
              </View>
              <View style={[styles.rhythmDivider, { backgroundColor: theme.border.subtle }]} />
              <View style={styles.rhythmMetric}>
                <Text style={[styles.rhythmValue, { color: theme.text.primary }]}>
                  {data?.dailyProgress.breaksTaken ?? 0}/{data?.dailyProgress.breaksGoal ?? 0}
                </Text>
                <Text style={[styles.rhythmLabel, { color: theme.text.muted }]}>Today</Text>
              </View>
            </View>

            <View style={styles.recommendedActions}>
              <Pressable
                style={styles.primaryResetAction}
                onPress={() => handleBreakPress(selectedRecoveryState.breakId)}
                accessibilityRole="button"
                accessibilityLabel={`Start ${recommendedExercise?.title ?? selectedRecoveryState.title}`}
              >
                <LinearGradient
                  colors={[selectedRecoveryState.color, ambientColors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryResetActionGradient}
                >
                  <Text style={styles.primaryResetActionText}>
                    Start {recommendedExercise?.title ?? selectedRecoveryState.label}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" />
                </LinearGradient>
              </Pressable>

              <Pressable
                style={[styles.secondaryResetAction, { borderColor: theme.border.subtle }]}
                onPress={handleSeeAllBreaks}
                accessibilityRole="button"
                accessibilityLabel="Browse all starter resets"
              >
                <Text style={[styles.secondaryResetActionText, { color: theme.text.primary }]}>
                  Browse starter resets
                </Text>
              </Pressable>
            </View>
          </View>

          {(isNewUser || isEmpty) && (
            <SmartInsight
              type="suggestion"
              title="Start with one quick win"
              message="Finish one short guided reset before you browse everything else. Early relief is what makes this habit stick."
              actionLabel="See starter resets"
              onAction={handleSeeAllBreaks}
              delay={160}
            />
          )}

          {/* Momentum */}
          <View style={styles.progressStatsRow}>
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
                  <Text style={[styles.compactStatLabel, { color: theme.text.muted }]}>recovery</Text>
                </View>
                <View style={[styles.compactStatDivider, { backgroundColor: theme.border.subtle }]} />
                <View style={styles.compactStatItem}>
                  <Ionicons name="flame" size={16} color={theme.accent.warning} />
                  <Text style={[styles.compactStatValue, { color: theme.text.primary }]}>{data?.streak.current ?? 0}</Text>
                  <Text style={[styles.compactStatLabel, { color: theme.text.muted }]}>day streak</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Starter resets */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text
                  style={[styles.sectionTitle, { color: theme.text.primary }]}
                  accessibilityRole="header"
                >
                  Starter resets
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.text.muted }]}>
                  Fast, safe defaults you can start without browsing the full library.
                </Text>
              </View>
              <Pressable
                style={styles.seeAllButton}
                onPress={handleSeeAllBreaks}
              >
                <Text style={[styles.seeAllText, { color: theme.accent.primary }]}>{t('common.seeAll')}</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.accent.primary} />
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.breakTypesScroll}
              accessibilityRole="list"
            >
              {BREAK_TYPES.map((breakType) => (
                <MemoizedQuickBreakCard
                  key={breakType.id}
                  icon={breakType.icon}
                  title={breakType.title}
                  duration={breakType.duration}
                  color={breakType.color}
                  onPress={() => handleBreakPress(breakType.id)}
                  isRecommended={breakType.id === selectedRecoveryState.breakId}
                  accessibilityLabel={`Start ${breakType.title} break, ${breakType.duration}`}
                  accessibilityHint="Double tap to begin this exercise"
                />
              ))}
            </ScrollView>
          </View>

          <TimerWidget onPresetPress={() => setShowPresetPicker(true)} />

          {smartInsight.type !== 'warning' && !isNewUser && (
            <SmartInsight
              type={smartInsight.type}
              title={smartInsight.title}
              message={smartInsight.message}
              actionLabel={smartInsight.actionLabel}
              onAction={handleSmartInsightAction}
              delay={500}
            />
          )}

          {data && (
            <WeeklyInsights
              insights={data.weeklyInsights}
              delay={700}
            />
          )}

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

          {data && (
            <LevelBadge
              level={data.user.level}
              currentXP={data.user.currentXP}
              nextLevelXP={data.user.nextLevelXP}
              title={data.user.levelTitle}
              delay={400}
            />
          )}

          <MotivationalQuote delay={900} />

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacer} />
        </Animated.ScrollView>
      </SafeAreaView>

      {/* Preset Picker Modal */}
      <PresetPicker
        visible={showPresetPicker}
        currentPresetId={timerPreferences.selectedPresetId}
        onSelect={timerActions.setPreset}
        onClose={() => setShowPresetPicker(false)}
      />
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
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
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
  recoveryStateGrid: {
    gap: 10,
  },
  recoveryStateChip: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recoveryStateIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recoveryStateEmoji: {
    fontSize: 20,
  },
  recoveryStateText: {
    flex: 1,
  },
  recoveryStateLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  recoveryStateDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  recommendedCard: {
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 20,
    marginBottom: Spacing.lg,
  },
  recommendedGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  recommendedBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  recommendedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  urgencyBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recommendedHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  recommendedIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recommendedEmoji: {
    fontSize: 28,
  },
  recommendedCopy: {
    flex: 1,
  },
  recommendedTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  recommendedMeta: {
    fontSize: 14,
    fontWeight: '700',
  },
  recommendedReason: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  rhythmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  rhythmMetric: {
    flex: 1,
    alignItems: 'center',
  },
  rhythmValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  rhythmLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  rhythmDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 6,
  },
  recommendedActions: {
    gap: 10,
  },
  primaryResetAction: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  primaryResetActionGradient: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryResetActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#04110D',
    flex: 1,
    marginRight: 12,
  },
  secondaryResetAction: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryResetActionText: {
    fontSize: 14,
    fontWeight: '700',
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
