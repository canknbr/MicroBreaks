import { View, Text, StyleSheet } from 'react-native';
import { ThemeColors } from '@/hooks/useTheme';
import type { AchievementWithStatus } from '@/hooks/useAchievements';

export function AchievementsSection({
  achievementStats,
  unlockedAchievements,
  nextToUnlock,
  theme,
}: {
  achievementStats: { unlocked: number; total: number };
  unlockedAchievements: AchievementWithStatus[];
  nextToUnlock: AchievementWithStatus[];
  theme: ThemeColors;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.text.muted }]} accessibilityRole="header">
          ACHIEVEMENTS
        </Text>
        <Text style={[styles.count, { color: theme.accent.primary }]}>
          {achievementStats.unlocked}/{achievementStats.total}
        </Text>
      </View>

      {unlockedAchievements.length > 0 ? (
        <View style={styles.chips}>
          {unlockedAchievements.slice(0, 6).map((achievement) => (
            <View
              key={achievement.id}
              style={styles.chip}
              accessibilityRole="text"
              accessibilityLabel={`Achievement unlocked: ${achievement.title}`}
            >
              <View style={[styles.dot, { backgroundColor: achievement.color }]} />
              <Text style={[styles.chipText, { color: theme.text.primary }]} numberOfLines={1}>
                {achievement.title}
              </Text>
            </View>
          ))}
          {achievementStats.unlocked > 6 && (
            <Text style={[styles.moreText, { color: theme.text.muted }]}>
              +{achievementStats.unlocked - 6} more
            </Text>
          )}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.text.muted }]}>
          Complete breaks to earn achievements.
        </Text>
      )}

      {nextToUnlock.length > 0 && (
        <View style={[styles.next, { borderTopColor: theme.border.subtle }]}>
          <Text style={[styles.nextLabel, { color: theme.text.muted }]}>NEXT TO UNLOCK</Text>
          <View style={styles.nextRow}>
            <Text style={[styles.nextTitle, { color: theme.text.primary }]} numberOfLines={1}>
              {nextToUnlock[0].title}
            </Text>
            <Text style={[styles.nextPct, { color: theme.text.muted }]}>
              {Math.round(nextToUnlock[0].progress)}%
            </Text>
          </View>
          <View style={[styles.nextTrack, { backgroundColor: theme.border.subtle }]}>
            <View
              style={[
                styles.nextFill,
                { width: `${nextToUnlock[0].progress}%`, backgroundColor: nextToUnlock[0].color },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 34,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  header: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
  },
  count: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 18,
    rowGap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 14,
  },
  moreText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 14,
  },
  emptyText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  next: {
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nextLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  nextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  nextTitle: {
    flex: 1,
    fontFamily: 'GeneralSans-Bold',
    fontSize: 16,
    letterSpacing: -0.2,
    marginRight: 12,
  },
  nextPct: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 13,
  },
  nextTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  nextFill: {
    height: '100%',
    borderRadius: 2,
  },
});
