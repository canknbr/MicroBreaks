/**
 * MissionsCard
 *
 * Home-screen surface for today's three daily missions. Each row
 * shows an emoji, a short description, an inline progress bar, and
 * a checkmark + bonus XP chip once completed. Visual language
 * mirrors `WeeklyInsights` so the card slots in without redesigning
 * the screen.
 */

import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import type { Mission, MissionKind } from '@/services/missions/types';

const EMOJI_BY_KIND: Record<MissionKind, string> = {
  take_breaks: '🎯',
  mindful_break: '🧘',
  long_break: '⏳',
  morning_break: '🌅',
  evening_break: '🌙',
};

interface MissionsCardProps {
  missions: Mission[];
  bonusXPEarned: number;
  completedCount: number;
  delay?: number;
}

function MissionsCard({
  missions,
  bonusXPEarned,
  completedCount,
  delay = 0,
}: MissionsCardProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, [delay, opacity, translateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (missions.length === 0) {
    return null;
  }

  const totalCount = missions.length;
  const allDone = completedCount === totalCount;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
          backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: theme.isDark ? 0 : 0.1,
          shadowRadius: 12,
          elevation: theme.isDark ? 0 : 5,
        },
        containerStyle,
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Daily missions: ${completedCount} of ${totalCount} complete. ${bonusXPEarned} bonus XP earned today.`}
    >
      {theme.isDark &&
        (Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(20, 20, 30, 0.9)' },
            ]}
          />
        ))}

      {theme.isDark && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'transparent']}
          style={styles.headerGradient}
        />
      )}

      <View style={styles.header}>
        <Ionicons name="ribbon" size={18} color={theme.accent.warning} />
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Today&apos;s missions
        </Text>
        <View style={styles.headerRight}>
          {bonusXPEarned > 0 && (
            <View
              style={[
                styles.xpChip,
                { backgroundColor: `${theme.accent.warning}24` },
              ]}
              accessibilityLabel={`${bonusXPEarned} bonus XP earned today`}
            >
              <Text style={[styles.xpChipText, { color: theme.accent.warning }]}>
                +{bonusXPEarned} XP
              </Text>
            </View>
          )}
          <Text style={[styles.headerCount, { color: theme.text.muted }]}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {missions.map((mission) => {
          const pct = mission.target > 0
            ? Math.min(100, Math.round((mission.progress / mission.target) * 100))
            : 0;
          const emoji = EMOJI_BY_KIND[mission.kind] ?? '✨';

          return (
            <View
              key={mission.id}
              style={styles.row}
              accessibilityLabel={`${mission.description}. ${
                mission.completed
                  ? `Complete. ${mission.bonusXP} bonus XP awarded.`
                  : `${pct}% complete.`
              }`}
            >
              <View
                style={[
                  styles.emojiWrap,
                  {
                    backgroundColor: mission.completed
                      ? `${theme.accent.warning}28`
                      : theme.isDark
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </View>

              <View style={styles.copy}>
                <Text
                  style={[
                    styles.description,
                    {
                      color: theme.text.primary,
                      opacity: mission.completed ? 0.7 : 1,
                      textDecorationLine: mission.completed
                        ? 'line-through'
                        : 'none',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {mission.description}
                </Text>
                <View style={styles.progressTrackWrap}>
                  <View
                    style={[
                      styles.progressTrack,
                      {
                        backgroundColor: theme.isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: mission.completed
                            ? theme.accent.warning
                            : theme.accent.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>

              {mission.completed ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.accent.warning}
                />
              ) : (
                <Text style={[styles.bonusLabel, { color: theme.text.muted }]}>
                  +{mission.bonusXP}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {allDone && (
        <View style={styles.allDoneStrip}>
          <Ionicons name="sparkles" size={14} color={theme.accent.warning} />
          <Text style={[styles.allDoneText, { color: theme.accent.warning }]}>
            All missions cleared — see you tomorrow.
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

export default memo(MissionsCard);

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpChip: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xpChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  headerCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  copy: {
    flex: 1,
  },
  description: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressTrackWrap: {
    width: '100%',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  bonusLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'right',
  },
  allDoneStrip: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  allDoneText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
