import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <Text style={styles.emptyEyebrow}>NO STORY YET</Text>
      <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
        Your recovery story starts with one break.
      </Text>
      <Text style={[styles.emptyText, { color: theme.text.muted }]}>
        Start one short {primaryNeedLabel} session and this screen begins turning your breaks into a weekly rhythm story.
      </Text>
      <Pressable
        style={styles.emptyButton}
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel="Browse starter resets"
      >
        <Text style={styles.emptyButtonText}>Browse starter resets</Text>
      </Pressable>
    </View>
  );
}

function MetricsRow({ metrics, theme }: { metrics: { id: string; label: string; value: string }[]; theme: ThemeColors }) {
  return (
    <View style={styles.metricsRow}>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.metric}>
          <Text style={[styles.metricValue, { color: theme.text.primary }]}>{metric.value}</Text>
          <Text style={[styles.metricLabel, { color: theme.text.muted }]}>{metric.label.toUpperCase()}</Text>
        </View>
      ))}
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
    ? '#FF2472'
    : story.tone === 'steady'
      ? '#FAE34B'
      : '#FF8A65';

  return (
    <Animated.View style={[styles.block, containerStyle]}>
      <View style={styles.storyHeader}>
        <Text style={[styles.eyebrow, { color: accent }]}>RECOVERY STORY</Text>
        <Text style={[styles.focusLabel, { color: theme.text.muted }]} numberOfLines={1}>
          {story.focusLabel}
        </Text>
      </View>

      <Text style={[styles.title, { color: theme.text.primary }]}>{story.title}</Text>
      <Text style={[styles.summary, { color: theme.text.secondary }]}>{story.summary}</Text>

      <MetricsRow metrics={story.metrics} theme={theme} />

      <View style={[styles.nextStep, { borderTopColor: theme.border.subtle }]}>
        <Text style={[styles.nextLabel, { color: accent }]}>WHAT TO IMPROVE NEXT</Text>
        <Text style={[styles.nextText, { color: theme.text.secondary }]}>{story.nextStep}</Text>
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
    <Animated.View style={[styles.block, containerStyle]}>
      <Text style={[styles.eyebrow, { color: theme.text.muted }]}>PRO REPORT · WEEKLY RECOVERY</Text>

      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: theme.text.primary }]}>
          {report.score}
          <Text style={[styles.scoreMax, { color: theme.text.muted }]}>/100</Text>
        </Text>
        <Text style={[styles.scoreLabel, { color: theme.text.secondary }]}>{report.scoreLabel}</Text>
      </View>

      <Text style={[styles.summary, { color: theme.text.secondary }]}>{report.summary}</Text>

      <Text style={[styles.tagLine, { color: theme.text.muted }]}>
        {formatWeekOverWeek(report.weekOverWeekChange)}   ·   Focus: {report.focusArea}
      </Text>

      <MetricsRow metrics={metrics} theme={theme} />

      <View style={[styles.nextStep, { borderTopColor: theme.border.subtle }]}>
        <Text style={[styles.nextLabel, { color: theme.accent.primary }]}>NEXT FOCUS</Text>
        <Text style={[styles.nextText, { color: theme.text.secondary }]}>{report.recommendation}</Text>
      </View>

      <Pressable
        style={[styles.shareButton, { borderTopColor: theme.border.subtle }]}
        onPress={() => onShare?.(report)}
        accessibilityRole="button"
        accessibilityLabel="Share weekly recovery report"
        accessibilityHint="Opens the share sheet with your weekly recovery summary"
      >
        <Ionicons name="share-social-outline" size={16} color={theme.text.primary} />
        <Text style={[styles.shareButtonText, { color: theme.text.primary }]}>Share report</Text>
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
  const scale = useSharedValue(0.96);
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
        styles.insightCell,
        { width: (screenWidth - Spacing.lg * 2 - 20) / 2 },
        containerStyle,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${item.title}: ${item.value}. ${item.detail}`}
    >
      <View style={[styles.insightRule, { backgroundColor: toneColor }]} />
      <Text style={[styles.insightTitle, { color: theme.text.muted }]}>{item.title.toUpperCase()}</Text>
      <Text style={[styles.insightValue, { color: theme.text.primary }]}>{item.value}</Text>
      <Text style={[styles.insightDetail, { color: theme.text.muted }]}>{item.detail}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Empty state
  emptyState: {
    paddingVertical: Spacing.xxxl,
  },
  emptyEyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -1,
    marginBottom: 14,
  },
  emptyText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 26,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 26,
    paddingVertical: 15,
  },
  emptyButtonText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 15,
    color: '#0B0A0D',
  },

  // Shared block (story + report)
  block: {
    marginBottom: 36,
  },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 11,
    letterSpacing: 1.8,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  focusLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 12,
    flexShrink: 1,
    textAlign: 'right',
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  summary: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },

  // Score (report)
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 14,
    marginTop: 14,
    marginBottom: 14,
  },
  score: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 52,
    letterSpacing: -2,
  },
  scoreMax: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 20,
  },
  scoreLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 15,
    flexShrink: 1,
  },
  tagLine: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },

  // Metrics (mono type grid, no tiles)
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
  },
  metric: {
    width: '50%',
    paddingVertical: 12,
  },
  metricValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    letterSpacing: -0.8,
  },
  metricLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 5,
  },

  // Next step (shared)
  nextStep: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nextLabel: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  nextText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    lineHeight: 21,
  },

  // Share (report)
  shareButton: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 15,
  },

  // Insight cell (2-col grid)
  insightCell: {
    marginBottom: 4,
  },
  insightRule: {
    width: 24,
    height: 3,
    borderRadius: 2,
    marginBottom: 14,
  },
  insightTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 8,
  },
  insightValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 22,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  insightDetail: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 12,
    lineHeight: 18,
  },
});
