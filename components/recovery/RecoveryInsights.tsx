import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Spacing } from '@/theme';
import type { ThemeColors } from '@/hooks/useTheme';
import type { RecoveryInsight, WeeklyRecoveryReport } from '@/hooks/useStatsData';
import type { RecoveryStory } from '@/features/recovery/statsStory';

function formatWeekOverWeek(change: number | null): string {
  if (change == null) return 'New this week';
  if (change === 0) return 'Flat vs last week';
  return `${change >= 0 ? '+' : ''}${change}% vs last week`;
}

function getInsightToneColor(
  tone: RecoveryInsight['tone'],
  theme: ThemeColors
): string {
  switch (tone) {
    case 'positive':
      return theme.accent.success;
    case 'attention':
      return theme.accent.warning;
    default:
      return theme.accent.secondary;
  }
}

export function RecoveryEmptyState({
  theme,
  primaryNeedLabel,
  onStart,
}: {
  theme: ThemeColors;
  primaryNeedLabel: string;
  onStart: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>📊</Text>
      <Text style={[styles.emptyStateTitle, { color: theme.text.primary }]}>
        No recovery story yet
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.text.muted }]}>
        Start one short {primaryNeedLabel} session and this screen will begin turning your breaks into a weekly rhythm story.
      </Text>
      <Pressable
        style={[styles.emptyStateButton, { backgroundColor: theme.accent.primary }]}
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel="Browse starter resets"
      >
        <Text style={styles.emptyStateButtonText}>Browse starter resets</Text>
      </Pressable>
    </View>
  );
}

export function RecoveryStoryCard({
  story,
  theme,
  delay = 0,
}: {
  story: RecoveryStory;
  theme: ThemeColors;
  delay?: number;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(18);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 450 }));
  }, [delay, opacity, story.title, translateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const accent = story.tone === 'positive'
    ? '#06FFA5'
    : story.tone === 'steady'
      ? '#FFD166'
      : '#FF8A65';
  const secondaryAccent = story.tone === 'positive'
    ? '#00E5FF'
    : story.tone === 'steady'
      ? '#FFB703'
      : '#FF6B6B';

  return (
    <Animated.View
      style={[
        styles.storyCard,
        themedSurface(theme),
        containerStyle,
      ]}
    >
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidDarkSurface]} />
        )
      )}
      <LinearGradient
        colors={[`${accent}20`, `${secondaryAccent}10`]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.storyHeader}>
        <View style={[styles.storyBadge, { backgroundColor: `${accent}18` }]}>
          <Ionicons name="pulse-outline" size={14} color={accent} />
          <Text style={[styles.storyBadgeText, { color: accent }]}>RECOVERY STORY</Text>
        </View>
        <View style={[styles.storyFocusPill, { borderColor: `${accent}35` }]}>
          <Text style={[styles.storyFocusPillText, { color: theme.text.primary }]}>
            {story.focusLabel}
          </Text>
        </View>
      </View>

      <Text style={[styles.storyTitle, { color: theme.text.primary }]}>
        {story.title}
      </Text>
      <Text style={[styles.storySummary, { color: theme.text.secondary }]}>
        {story.summary}
      </Text>

      <View style={styles.storyMetricsRow}>
        {story.metrics.map((metric) => (
          <View
            key={metric.id}
            style={[
              styles.storyMetricCard,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255,255,255,0.05)'
                  : theme.background.elevated,
              },
            ]}
          >
            <Text style={[styles.storyMetricValue, { color: theme.text.primary }]}>
              {metric.value}
            </Text>
            <Text style={[styles.storyMetricLabel, { color: theme.text.muted }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.storyNextStep,
          {
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.background.elevated,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        <Text style={[styles.storyNextStepTitle, { color: theme.text.primary }]}>
          What to improve next
        </Text>
        <Text style={[styles.storyNextStepText, { color: theme.text.secondary }]}>
          {story.nextStep}
        </Text>
      </View>
    </Animated.View>
  );
}

export function WeeklyRecoveryReportCard({
  report,
  theme,
  delay = 0,
  onShare,
}: {
  report: WeeklyRecoveryReport;
  theme: ThemeColors;
  delay?: number;
  onShare?: (_report: WeeklyRecoveryReport) => void | Promise<void>;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 450 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 450 }));
  }, [delay, opacity, report.score, translateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const metrics = [
    { id: 'days', label: 'Active Days', value: `${report.activeDays}/7` },
    { id: 'duration', label: 'Avg Break', value: `${report.averageDurationMinutes}m` },
    { id: 'completion', label: 'Completion', value: `${report.completionRate}%` },
    { id: 'window', label: 'Best Window', value: report.bestTimeLabel ?? 'None' },
  ];

  return (
    <Animated.View style={[styles.reportCard, themedSurface(theme), containerStyle]}>
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidDarkSurface]} />
        )
      )}
      <LinearGradient
        colors={
          theme.isDark
            ? ['rgba(255, 209, 102, 0.18)', 'rgba(0, 229, 255, 0.06)']
            : ['rgba(255, 149, 0, 0.16)', 'rgba(0, 122, 255, 0.08)']
        }
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.reportHeader}>
        <View style={styles.reportHeaderLeft}>
          <View style={styles.reportBadge}>
            <Ionicons name="sparkles" size={14} color={theme.text.inverse} />
            <Text style={styles.reportBadgeText}>PRO REPORT</Text>
          </View>
          <Text style={[styles.reportTitle, { color: theme.text.primary }]}>
            Weekly Recovery Report
          </Text>
          <Text style={[styles.reportSubtitle, { color: theme.text.secondary }]}>
            {report.scoreLabel}
          </Text>
        </View>
        <View style={[styles.reportScoreBadge, { borderColor: theme.border.subtle }]}>
          <Text style={[styles.reportScoreValue, { color: theme.text.primary }]}>
            {report.score}
          </Text>
          <Text style={[styles.reportScoreLabel, { color: theme.text.muted }]}>/100</Text>
        </View>
      </View>

      <Text style={[styles.reportSummary, { color: theme.text.primary }]}>
        {report.summary}
      </Text>

      <View style={styles.reportPills}>
        <View
          style={[
            styles.reportPill,
            {
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : theme.background.elevated,
            },
          ]}
        >
          <Ionicons name="trending-up" size={14} color={theme.accent.primary} />
          <Text style={[styles.reportPillText, { color: theme.text.primary }]}>
            {formatWeekOverWeek(report.weekOverWeekChange)}
          </Text>
        </View>
        <View
          style={[
            styles.reportPill,
            {
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : theme.background.elevated,
            },
          ]}
        >
          <Ionicons name="flag-outline" size={14} color={theme.accent.warning} />
          <Text style={[styles.reportPillText, { color: theme.text.primary }]}>
            Focus: {report.focusArea}
          </Text>
        </View>
      </View>

      <View style={styles.reportMetricsGrid}>
        {metrics.map((metric) => (
          <View
            key={metric.id}
            style={[
              styles.reportMetricCard,
              {
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.background.elevated,
              },
            ]}
          >
            <Text style={[styles.reportMetricValue, { color: theme.text.primary }]}>
              {metric.value}
            </Text>
            <Text style={[styles.reportMetricLabel, { color: theme.text.muted }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.reportRecommendation,
          {
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.background.elevated,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        <Text style={[styles.reportRecommendationTitle, { color: theme.text.primary }]}>
          Next Focus
        </Text>
        <Text style={[styles.reportRecommendationText, { color: theme.text.secondary }]}>
          {report.recommendation}
        </Text>
      </View>

      <Pressable
        style={[
          styles.reportShareButton,
          {
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : theme.background.elevated,
            borderColor: theme.border.subtle,
          },
        ]}
        onPress={() => onShare?.(report)}
        accessibilityRole="button"
        accessibilityLabel="Share weekly recovery report"
        accessibilityHint="Opens the share sheet with your weekly recovery summary"
      >
        <Ionicons name="share-social-outline" size={16} color={theme.accent.primary} />
        <Text style={[styles.reportShareButtonText, { color: theme.text.primary }]}>
          Share Report
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function RecoveryInsightCard({
  item,
  delay,
  theme,
  screenWidth,
}: {
  item: RecoveryInsight;
  delay: number;
  theme: ThemeColors;
  screenWidth: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const toneColor = getInsightToneColor(item.tone, theme);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    scale.value = withDelay(delay, withSpring(1));
  }, [delay, item.value, opacity, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.recoveryInsightCard,
        {
          width: (screenWidth - Spacing.lg * 2 - 12) / 2,
        },
        themedSurface(theme, 2, 10),
        containerStyle,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${item.title}: ${item.value}. ${item.detail}`}
    >
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidDarkSurface]} />
        )
      )}
      <View style={[styles.recoveryInsightIcon, { backgroundColor: `${toneColor}18` }]}>
        <Ionicons name={item.icon as IoniconsName} size={18} color={toneColor} />
      </View>
      <Text style={[styles.recoveryInsightTitle, { color: theme.text.primary }]}>
        {item.title}
      </Text>
      <Text style={[styles.recoveryInsightValue, { color: theme.text.primary }]}>
        {item.value}
      </Text>
      <Text style={[styles.recoveryInsightDetail, { color: theme.text.muted }]}>
        {item.detail}
      </Text>
    </Animated.View>
  );
}

function themedSurface(theme: ThemeColors, elevation = 5, radius = 12) {
  return {
    borderColor: theme.isDark ? theme.border.subtle : 'transparent',
    backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 } as const,
    shadowOpacity: theme.isDark ? 0 : 0.08,
    shadowRadius: radius,
    elevation: theme.isDark ? 0 : elevation,
  };
}

const styles = StyleSheet.create({
  androidDarkSurface: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyStateEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyStateButton: {
    borderRadius: 14,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  emptyStateButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  storyCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  storyBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  storyFocusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  storyFocusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  storySummary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  storyMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.md,
  },
  storyMetricCard: {
    minWidth: 88,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  storyMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  storyMetricLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  storyNextStep: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.md,
  },
  storyNextStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  storyNextStepText: {
    fontSize: 14,
    lineHeight: 20,
  },
  reportCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  reportHeaderLeft: {
    flex: 1,
  },
  reportBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    marginBottom: 10,
  },
  reportBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  reportTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  reportSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  reportScoreBadge: {
    borderWidth: 1,
    borderRadius: 18,
    minWidth: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  reportScoreValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 26,
  },
  reportScoreLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  reportSummary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  reportPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.md,
  },
  reportPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reportPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reportMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: Spacing.md,
  },
  reportMetricCard: {
    minWidth: 88,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reportMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  reportMetricLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportRecommendation: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  reportRecommendationTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  reportRecommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  reportShareButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportShareButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  recoveryInsightCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  recoveryInsightIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recoveryInsightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  recoveryInsightValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  recoveryInsightDetail: {
    fontSize: 12,
    lineHeight: 18,
  },
});
