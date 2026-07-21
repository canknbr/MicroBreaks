/**
 * Break Completion — editorial. No glow / confetti / rotating ring / emoji
 * medallion / blur card: a bold "great job" statement + a mono stats
 * type-list. Entrance is a quiet fade; the moment is carried by the fanfare
 * haptic + completion sound, not decoration.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';
import { useHapticChoreography } from '@/hooks/useHapticChoreography';
import { breakSounds } from '@/services/audio/breakSounds';
import { formatDuration } from '@/utils/format';

interface CompletedMissionFeedback {
  /** Stable id for the React key. */
  id: string;
  /** Short human description from the mission ("Take 3 breaks today"). */
  description: string;
  /** Bonus XP awarded for completing this mission. */
  bonusXP: number;
}

interface BreakCompletionProps {
  title: string;
  icon: string;
  color: string;
  stats: {
    totalDuration: number;
    stepsCompleted: number;
    totalSteps: number;
    xpEarned: number;
  };
  /**
   * Missions that newly completed alongside this break. When present,
   * the screen surfaces a callout above the stats so the bonus XP is
   * visible — without it the mission system credits silently.
   */
  completedMissions?: CompletedMissionFeedback[];
}

export default function BreakCompletion({
  title,
  color,
  stats,
  completedMissions,
}: BreakCompletionProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { completionFanfare } = useHapticChoreography();
  const titleOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);

  useEffect(() => {
    // Sprint 9 visceral polish: the single Success haptic is replaced by
    // a 3-beat fanfare (Success → Medium → Heavy, 140ms apart) plus a
    // completion sound. This is the moment the user feels "I earned
    // that" — carried by feel + sound rather than on-screen confetti.
    completionFanfare();
    void breakSounds.play('session-complete');

    titleOpacity.value = withTiming(1, { duration: 400 });
    statsOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
  }, [completionFanfare, statsOpacity, titleOpacity]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 16 }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: (1 - statsOpacity.value) * 16 }],
  }));

  // Labels are kept as fixed small-caps (matching the original screen) — the
  // breakSession.completion.* keys are value templates, not label strings.
  const statRows: { label: string; value: string; accent?: boolean }[] = [
    { label: 'DURATION', value: formatDuration(stats.totalDuration, { showSeconds: true }) },
    { label: 'STEPS', value: `${stats.stepsCompleted}/${stats.totalSteps}` },
    { label: 'XP EARNED', value: `+${stats.xpEarned}`, accent: true },
  ];

  return (
    <View style={styles.container}>
      <Animated.View
        style={titleStyle}
        accessibilityLiveRegion="polite"
        accessibilityRole="header"
        accessibilityLabel={`${t('breakSession.completion.greatJob', { defaultValue: 'Great Job!' })} ${t(
          'breakSession.completion.youCompleted',
          { title, defaultValue: `You completed ${title}` }
        )}`}
      >
        <Text style={styles.eyebrow}>
          {t('breakSession.completion.greatJob', { defaultValue: 'Great job' })}
        </Text>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t('breakSession.completion.youCompleted', { title, defaultValue: `You completed ${title}` })}
        </Text>
      </Animated.View>

      {/* Mission completion callout — only when a mission newly finished as
          part of this save. Presented as a labelled type block, no box. */}
      {completedMissions && completedMissions.length > 0 && (
        <Animated.View
          style={[styles.missionBlock, statsStyle]}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          accessibilityLabel={t(
            'breakSession.completion.missionAriaLabel',
            {
              count: completedMissions.length,
              xp: completedMissions.reduce((s, m) => s + m.bonusXP, 0),
              defaultValue: `${completedMissions.length} mission complete — bonus ${completedMissions.reduce((s, m) => s + m.bonusXP, 0)} XP`,
            },
          )}
        >
          <Text style={[styles.missionTitle, { color }]}>
            {t('breakSession.completion.missionTitle', {
              defaultValue: 'Mission complete',
            })}
          </Text>
          {completedMissions.map((mission) => (
            <View key={mission.id} style={styles.missionRow}>
              <Text
                style={[styles.missionDesc, { color: theme.text.secondary }]}
                numberOfLines={1}
              >
                {mission.description}
              </Text>
              <Text style={[styles.missionXP, { color }]}>
                +{mission.bonusXP} XP
              </Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Stats as a mono type-list */}
      <Animated.View style={[styles.stats, statsStyle]}>
        {statRows.map((row, i) => (
          <View key={row.label} style={[styles.statRow, i > 0 && styles.statDivider]}>
            <Text style={[styles.statLabel, { color: theme.text.muted }]}>{row.label}</Text>
            <Text style={[styles.statValue, { color: row.accent ? color : theme.text.primary }]}>
              {row.value}
            </Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 14,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1,
  },
  missionBlock: {
    marginTop: 28,
  },
  missionTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  missionDesc: {
    flex: 1,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 15,
    marginRight: 12,
  },
  missionXP: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
  },
  stats: {
    marginTop: 32,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  statDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    letterSpacing: -0.5,
  },
});
