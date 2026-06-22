import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Spacing } from '@/theme';
import { cardShadow } from '@/utils/cardShadow';
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
    <View style={styles.settingsSection}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeader, { color: theme.text.muted }]} accessibilityRole="header">ACHIEVEMENTS</Text>
        <Text style={[styles.achievementProgress, { color: theme.accent.primary }]}>
          {achievementStats.unlocked}/{achievementStats.total}
        </Text>
      </View>
      <View style={[
        styles.sectionCard,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          ...cardShadow(theme.isDark, { height: 3, opacity: 0.06, radius: 12, elevation: 4 }),
        },
      ]}>
        {/* BlurView only for dark mode */}
        {theme.isDark ? (
          Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
          )
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background.card }]} />
        )}

        {/* Recent Achievements */}
        {unlockedAchievements.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsList}
          >
            {unlockedAchievements.slice(0, 5).map((achievement) => (
              <View key={achievement.id} style={styles.achievementBadge} accessibilityRole="image" accessibilityLabel={`Achievement: ${achievement.title}`}>
                <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}20` }]}>
                  <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                </View>
                <Text style={[styles.achievementTitle, { color: theme.text.primary }]} numberOfLines={1}>
                  {achievement.title}
                </Text>
              </View>
            ))}
            {achievementStats.unlocked > 5 && (
              <View style={styles.achievementMore}>
                <Text style={[styles.achievementMoreText, { color: theme.text.primary }]}>
                  +{achievementStats.unlocked - 5}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.noAchievements}>
            <Text style={styles.noAchievementsIcon}>🏆</Text>
            <Text style={[styles.noAchievementsText, { color: theme.text.muted }]}>
              Complete breaks to earn achievements!
            </Text>
          </View>
        )}

        {/* Next to Unlock */}
        {nextToUnlock.length > 0 && (
          <View style={styles.nextToUnlock}>
            <Text style={[styles.nextToUnlockLabel, { color: theme.text.muted }]}>Next to unlock:</Text>
            <View style={styles.nextAchievement}>
              <Text style={styles.nextAchievementIcon}>{nextToUnlock[0].icon}</Text>
              <View style={styles.nextAchievementInfo}>
                <Text style={[styles.nextAchievementTitle, { color: theme.text.primary }]}>{nextToUnlock[0].title}</Text>
                <View style={[styles.nextProgressBar, { backgroundColor: theme.border.subtle }]}>
                  <View
                    style={[
                      styles.nextProgressFill,
                      { width: `${nextToUnlock[0].progress}%`, backgroundColor: nextToUnlock[0].color },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.nextProgressText, { color: theme.text.muted }]}>
                {Math.round(nextToUnlock[0].progress)}%
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  achievementProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06FFA5',
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  achievementsList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
  },
  achievementBadge: {
    alignItems: 'center',
    width: 72,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  achievementMore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  achievementMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  noAchievements: {
    alignItems: 'center',
    padding: 24,
  },
  noAchievementsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noAchievementsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  nextToUnlock: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  nextToUnlockLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  nextAchievement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextAchievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  nextAchievementInfo: {
    flex: 1,
  },
  nextAchievementTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  nextProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  nextProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  nextProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginLeft: 12,
  },
});
