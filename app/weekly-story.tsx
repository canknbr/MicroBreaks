/**
 * Weekly Recovery Story Screen
 *
 * Modal sheet that summarises the user's last 7 days of breaks.
 * Pulls from `composeWeeklyStory`, which is the only place that
 * decides what's worth saying. The screen is presentation — every
 * section is a small, self-contained block driven by the story.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/theme';
import { getBreakHistory, getStreakData, getUserStats } from '@/services/breakHistory';
import {
  composeWeeklyStory,
  type WeeklyStory,
} from '@/services/insights/weeklyStory';
import { useTierFeature } from '@/hooks/useTierFeature';
import UpgradeGateCard from '@/components/subscription/UpgradeGateCard';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatTimeBucket(bucket: string): string {
  switch (bucket) {
    case 'morning':   return 'Morning (6am–12pm)';
    case 'midday':    return 'Midday (12pm–3pm)';
    case 'afternoon': return 'Afternoon (3pm–6pm)';
    case 'evening':   return 'Evening (6pm–10pm)';
    case 'late':      return 'Late (10pm–6am)';
    default:          return bucket;
  }
}

export default function WeeklyStoryScreen() {
  const theme = useTheme();
  const gate = useTierFeature('weekly_recovery_story');
  const [story, setStory] = useState<WeeklyStory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don't burn IO building a story the user can't see.
    if (!gate.hasFeature) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [history, streak, userStats] = await Promise.all([
          getBreakHistory(),
          getStreakData(),
          getUserStats(),
        ]);
        if (cancelled) return;
        const composed = composeWeeklyStory({
          now: new Date(),
          history,
          streak,
          userStats,
        });
        setStory(composed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gate.hasFeature]);

  const peakBar = useMemo(() => {
    if (!story) return 0;
    return Math.max(1, ...story.dailyRhythm.map((d) => d.breaks));
  }, [story]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            style={[
              styles.backButton,
              {
                backgroundColor: theme.isDark
                  ? 'rgba(255,255,255,0.08)'
                  : theme.border.subtle,
              },
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close weekly story"
          >
            <Ionicons name="close" size={22} color={theme.text.primary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Your week
          </Text>
          <View style={styles.backButton} />
        </View>

        {gate.loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.accent.primary} />
          </View>
        ) : !gate.hasFeature ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.headline, { color: theme.text.primary }]}>
              Your weekly story is a Pro habit.
            </Text>
            <Text style={[styles.range, { color: theme.text.muted }]}>
              Pro · Solo · Family
            </Text>
            <UpgradeGateCard
              requiredTier={gate.requiredTier}
              title="Unlock your weekly recovery story"
              body="A clear weekly snapshot — totals, streak status, top break types, your best time of day, and a daily rhythm chart. Upgrade once, see it every week."
              placement="weekly_story"
            />
            <View style={styles.bottomSpacer} />
          </ScrollView>
        ) : loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.accent.primary} />
          </View>
        ) : story == null ? (
          <View style={styles.centerContent}>
            <Text style={[styles.body, { color: theme.text.secondary }]}>
              Couldn&apos;t load your week. Try again later.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            testID="weekly-story-scroll"
          >
            {/* Headline */}
            <Text style={[styles.headline, { color: theme.text.primary }]}>
              {story.headline}
            </Text>
            <Text
              style={[styles.range, { color: theme.text.muted }]}
              accessibilityLabel={`From ${story.range.start} to ${story.range.end}`}
            >
              {story.range.start} → {story.range.end}
            </Text>

            {/* Totals */}
            <View
              style={[
                styles.metricGrid,
              ]}
            >
              <Metric
                label="Breaks"
                value={String(story.totals.breaks)}
                color={theme.text.primary}
              />
              <View style={[styles.metricDivider, { backgroundColor: theme.border.subtle }]} />
              <Metric
                label="Minutes"
                value={String(story.totals.minutes)}
                color={theme.text.primary}
              />
              <View style={[styles.metricDivider, { backgroundColor: theme.border.subtle }]} />
              <Metric
                label="XP"
                value={String(story.totals.xp)}
                color={theme.text.primary}
              />
              <View style={[styles.metricDivider, { backgroundColor: theme.border.subtle }]} />
              <Metric
                label="Active days"
                value={`${story.totals.activeDays}/7`}
                color={theme.text.primary}
              />
            </View>

            {/* Streak callout */}
            <View
              style={[
                styles.calloutCard,
              ]}
            >
              <View style={styles.calloutHeader}>
                <Ionicons name="flame" size={18} color={theme.accent.warning} />
                <Text style={[styles.calloutTitle, { color: theme.text.primary }]}>
                  Streak
                </Text>
              </View>
              <Text style={[styles.calloutValue, { color: theme.text.primary }]}>
                {story.streakCallout.current} day{story.streakCallout.current === 1 ? '' : 's'}
              </Text>
              <Text style={[styles.calloutSub, { color: theme.text.secondary }]}>
                {story.streakCallout.atRisk
                  ? 'You haven’t broken today — one short reset keeps it alive.'
                  : story.streakCallout.current === 0
                  ? 'Take one break today to start a new streak.'
                  : `Longest ever: ${story.streakCallout.longest} day${
                      story.streakCallout.longest === 1 ? '' : 's'
                    }.`}
              </Text>
            </View>

            {/* Daily rhythm chart */}
            <View
              style={[
                styles.calloutCard,
              ]}
            >
              <View style={styles.calloutHeader}>
                <Ionicons name="bar-chart" size={18} color={theme.accent.tertiary} />
                <Text style={[styles.calloutTitle, { color: theme.text.primary }]}>
                  Daily rhythm
                </Text>
              </View>
              <View
                style={styles.barRow}
                accessibilityLabel="Daily break histogram for the last 7 days"
              >
                {story.dailyRhythm.map((d) => {
                  const heightPct = (d.breaks / peakBar) * 100;
                  return (
                    <View
                      key={d.date}
                      style={styles.barColumn}
                      accessibilityLabel={`${DAY_LABELS[d.dayIndex]}: ${d.breaks} breaks`}
                    >
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${heightPct}%`,
                              backgroundColor: d.breaks > 0
                                ? theme.accent.primary
                                : theme.border.subtle,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barLabel, { color: theme.text.muted }]}>
                        {DAY_LABELS[d.dayIndex]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Category mix */}
            {story.categoryMix.length > 0 && (
              <View
                style={[
                  styles.calloutCard,
                ]}
              >
                <View style={styles.calloutHeader}>
                  <Ionicons name="albums" size={18} color={theme.accent.secondary} />
                  <Text style={[styles.calloutTitle, { color: theme.text.primary }]}>
                    What you reached for
                  </Text>
                </View>
                {story.categoryMix.map((slice) => (
                  <View key={slice.category} style={styles.categoryRow}>
                    <Text
                      style={[styles.categoryName, { color: theme.text.primary }]}
                    >
                      {slice.category}
                    </Text>
                    <View
                      style={[
                        styles.categoryTrack,
                        { backgroundColor: theme.border.subtle },
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryFill,
                          {
                            width: `${Math.round(slice.share * 100)}%`,
                            backgroundColor: theme.accent.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.categoryCount, { color: theme.text.muted }]}
                    >
                      {slice.count}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Best time */}
            {story.bestTime && (
              <View
                style={[
                  styles.calloutCard,
                ]}
              >
                <View style={styles.calloutHeader}>
                  <Ionicons name="sunny" size={18} color={theme.accent.warning} />
                  <Text style={[styles.calloutTitle, { color: theme.text.primary }]}>
                    Your best time of day
                  </Text>
                </View>
                <Text style={[styles.calloutValue, { color: theme.text.primary }]}>
                  {formatTimeBucket(story.bestTime.bucket)}
                </Text>
                <Text style={[styles.calloutSub, { color: theme.text.secondary }]}>
                  {story.bestTime.count} break
                  {story.bestTime.count === 1 ? '' : 's'} taken in this window.
                </Text>
              </View>
            )}

            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

interface MetricProps {
  label: string;
  value: string;
  color: string;
}

function Metric({ label, value, color }: MetricProps) {
  const theme = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.text.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  scrollView: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  body: { fontSize: 14, lineHeight: 22 },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 6,
  },
  range: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.lg,
  },
  metricGrid: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: Spacing.lg,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricDivider: { width: 1 },
  calloutCard: {
    paddingTop: 20,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  calloutTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  calloutValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 28,
    letterSpacing: -1,
    marginBottom: 8,
  },
  calloutSub: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110,
    paddingTop: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: 18,
    height: 80,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    width: 80,
    textTransform: 'capitalize',
  },
  categoryTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '700',
    width: 24,
    textAlign: 'right',
  },
  bottomSpacer: { height: 60 },
});
