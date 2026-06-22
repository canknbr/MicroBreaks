import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import { Spacing } from '@/theme';
import { cardShadow } from '@/utils/cardShadow';
import { ThemeColors } from '@/hooks/useTheme';

export function ProfileCard({
  profile,
  progress,
  level,
  levelTitle,
  levelColors,
  currentXP,
  xpProgress,
  profileStyle,
  onEditPress,
  theme,
}: {
  profile: { name: string; avatar: string | null };
  progress: { totalBreaks: number; totalXP: number; currentStreak: number };
  level: number;
  levelTitle: string;
  levelColors: readonly [string, string];
  currentXP: number;
  xpProgress: number;
  profileStyle: StyleProp<ViewStyle>;
  onEditPress: () => void;
  theme: ThemeColors;
}) {
  return (
    <Animated.View
      accessibilityRole="summary"
      accessibilityLabel={`${profile.name}, ${levelTitle}, Level ${level}, ${currentXP} of 100 XP`}
      style={[
      styles.profileCard,
      {
        borderColor: theme.isDark ? theme.border.subtle : 'transparent',
        ...cardShadow(theme.isDark, { height: 4, opacity: 0.08, radius: 16, elevation: 5 }),
      },
      profileStyle,
    ]}>
      {/* BlurView only for dark mode */}
      {theme.isDark ? (
        Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
        )
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background.card }]} />
      )}
      <LinearGradient
        colors={theme.isDark ? ['rgba(255, 255, 255, 0.08)', 'transparent'] : ['rgba(0, 0, 0, 0.03)', 'transparent']}
        style={styles.cardHighlight}
      />

      <View style={styles.profileContent}>
        {/* Avatar with Level */}
        <Pressable
          style={styles.avatarContainer}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onEditPress();
          }}
        >
          <LinearGradient
            colors={levelColors}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.avatarInner}>
            <Text style={styles.avatarText}>
              {profile.avatar || profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.levelBadge}>
            <LinearGradient
              colors={levelColors}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.levelText}>{level}</Text>
          </View>
          {/* Edit indicator */}
          <View style={styles.editIndicator}>
            <Ionicons name="pencil" size={10} color="#FFF" />
          </View>
        </Pressable>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text.primary }]}>{profile.name}</Text>
          <Text style={[styles.userTitle, { color: theme.text.secondary }]}>{levelTitle}</Text>

          {/* XP Progress */}
          <View style={styles.xpContainer}>
            <View style={[styles.xpTrack, { backgroundColor: theme.border.subtle }]}>
              <View style={[styles.xpFill, { width: `${xpProgress}%` }]}>
                <LinearGradient
                  colors={levelColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </View>
            </View>
            <Text style={[styles.xpText, { color: theme.text.muted }]}>
              {currentXP}/100 XP
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={[styles.profileStats, { borderTopColor: theme.border.subtle }]}>
        <View style={styles.profileStatItem} accessibilityRole="text" accessibilityLabel={`${progress.totalBreaks} Total Breaks`}>
          <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.totalBreaks}</Text>
          <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Total Breaks</Text>
        </View>
        <View style={[styles.profileStatDivider, { backgroundColor: theme.border.subtle }]} />
        <View style={styles.profileStatItem} accessibilityRole="text" accessibilityLabel={`${progress.totalXP} Total XP`}>
          <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.totalXP}</Text>
          <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Total XP</Text>
        </View>
        <View style={[styles.profileStatDivider, { backgroundColor: theme.border.subtle }]} />
        <View style={styles.profileStatItem} accessibilityRole="text" accessibilityLabel={`${progress.currentStreak} Day Streak`}>
          <Text style={[styles.profileStatValue, { color: theme.text.primary }]}>{progress.currentStreak}</Text>
          <Text style={[styles.profileStatLabel, { color: theme.text.muted }]}>Day Streak</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.lg,
  },
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    position: 'relative',
  },
  avatarGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
  },
  avatarInner: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderRadius: 33,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  profileStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 16,
    marginHorizontal: Spacing.lg,
  },
  profileStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  profileStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  profileStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  editIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(6, 255, 165, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
});
