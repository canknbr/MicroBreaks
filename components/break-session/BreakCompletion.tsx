/**
 * Break Completion Component
 * Zen master level success screen with stats and celebration
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/i18n/hooks';
import { useHapticChoreography } from '@/hooks/useHapticChoreography';
import { breakSounds } from '@/services/audio/breakSounds';

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
   * the screen surfaces a callout above the stats card to make the
   * bonus XP visible — without it the mission system credits silently.
   */
  completedMissions?: CompletedMissionFeedback[];
}

export default function BreakCompletion({
  title,
  icon,
  color,
  stats,
  completedMissions,
}: BreakCompletionProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { completionFanfare } = useHapticChoreography();
  const iconScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const ringRotation = useSharedValue(0);

  useEffect(() => {
    // Sprint 9 visceral polish: the single Success haptic is replaced by
    // a 3-beat fanfare (Success → Medium → Heavy, 140ms apart) plus a
    // completion sound. This is the moment the user feels "I earned
    // that" — single biggest perceived-quality upgrade per cost.
    completionFanfare();
    void breakSounds.play('session-complete');

    // Staggered entrance animation
    iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    statsOpacity.value = withDelay(400, withTiming(1, { duration: 400 }));
    confettiOpacity.value = withSequence(
      withDelay(100, withTiming(1, { duration: 300 })),
      withDelay(2000, withTiming(0.3, { duration: 500 }))
    );
    // Zen-like ambient glow pulse
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    // Subtle ring rotation
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, [completionFanfare, confettiOpacity, glowPulse, iconScale, ringRotation, statsOpacity, titleOpacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: (1 - titleOpacity.value) * 20 }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
    transform: [{ translateY: (1 - statsOpacity.value) * 20 }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glowPulse.value, [0, 1], [0.3, 0.6]),
    transform: [{ scale: interpolate(glowPulse.value, [0, 1], [1, 1.1]) }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <View style={styles.container}>
      {/* Zen ambient glow */}
      <Animated.View style={[styles.ambientGlow, { backgroundColor: color }, glowStyle]} />

      {/* Confetti emojis */}
      <Animated.View style={[styles.confettiContainer, confettiStyle]}>
        <Text style={[styles.confetti, styles.confetti1]}>🎉</Text>
        <Text style={[styles.confetti, styles.confetti2]}>✨</Text>
        <Text style={[styles.confetti, styles.confetti3]}>🎊</Text>
        <Text style={[styles.confetti, styles.confetti4]}>⭐</Text>
        <Text style={[styles.confetti, styles.confetti5]}>🌟</Text>
        <Text style={[styles.confetti, styles.confetti6]}>💫</Text>
      </Animated.View>

      {/* Success Icon with rotating ring */}
      <View style={styles.iconWrapper}>
        <Animated.View style={[styles.rotatingRing, { borderColor: color }, ringStyle]} />
        <Animated.View style={[styles.iconContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }, iconStyle]}>
          <LinearGradient
            colors={[`${color}40`, `${color}10`]}
            style={styles.iconGradient}
          />
          <Text style={styles.icon}>{icon}</Text>
          <View style={[styles.checkBadge, { borderColor: theme.background.primary }]}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        </Animated.View>
      </View>

      {/* Title */}
      <Animated.View
        style={titleStyle}
        accessibilityLiveRegion="polite"
        accessibilityRole="header"
        accessibilityLabel={`${t('breakSession.completion.greatJob', { defaultValue: 'Great Job!' })} ${t(
          'breakSession.completion.youCompleted',
          { title, defaultValue: `You completed ${title}` }
        )}`}
      >
        <Text style={[styles.title, { color: theme.text.primary }]}>
          {t('breakSession.completion.greatJob', { defaultValue: 'Great Job!' })}
        </Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          {t('breakSession.completion.youCompleted', { title, defaultValue: `You completed ${title}` })}
        </Text>
      </Animated.View>

      {/* Mission completion callout — only when a mission newly
          finished as part of this save. Sits above the stats card so
          the bonus XP is visible in the same paint as the base XP. */}
      {completedMissions && completedMissions.length > 0 && (
        <Animated.View
          style={[
            styles.missionCallout,
            {
              borderColor: color,
              backgroundColor: theme.isDark
                ? `${color}1A`
                : `${color}14`,
            },
            statsStyle,
          ]}
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
              defaultValue: 'Mission complete!',
            })}
          </Text>
          {completedMissions.map((mission) => (
            <View key={mission.id} style={styles.missionRow}>
              <Text
                style={[styles.missionDesc, { color: theme.text.primary }]}
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

      {/* Stats Card */}
      <Animated.View style={[
        styles.statsCard,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme.isDark ? 0 : 0.1,
          shadowRadius: 12,
          elevation: theme.isDark ? 0 : 6,
        },
        statsStyle
      ]}>
        {/* BlurView only for dark mode */}
        {theme.isDark && (
          Platform.OS === 'ios' ? (
            <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
          )
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{formatDuration(stats.totalDuration)}</Text>
            <Text style={[styles.statLabel, { color: theme.text.muted }]}>Duration</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.border.subtle }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{stats.stepsCompleted}/{stats.totalSteps}</Text>
            <Text style={[styles.statLabel, { color: theme.text.muted }]}>Steps</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.border.subtle }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color }]}>+{stats.xpEarned}</Text>
            <Text style={[styles.statLabel, { color: theme.text.muted }]}>XP Earned</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ambientGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    fontSize: 36,
  },
  confetti1: {
    top: '8%',
    left: '12%',
  },
  confetti2: {
    top: '12%',
    right: '18%',
  },
  confetti3: {
    top: '22%',
    left: '22%',
  },
  confetti4: {
    top: '18%',
    right: '12%',
  },
  confetti5: {
    top: '5%',
    left: '45%',
  },
  confetti6: {
    top: '28%',
    right: '28%',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  rotatingRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.4,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    fontSize: 60,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#06FFA5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  checkMark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  statsCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  androidFallback: {
    backgroundColor: 'rgba(25, 25, 35, 0.9)',
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  missionCallout: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  missionDesc: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  missionXP: {
    fontSize: 14,
    fontWeight: '700',
  },
});
