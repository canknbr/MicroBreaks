import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
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
  const stats = [
    { value: progress.totalBreaks, label: 'TOTAL BREAKS' },
    { value: progress.totalXP, label: 'TOTAL XP' },
    { value: progress.currentStreak, label: 'DAY STREAK' },
  ];

  return (
    <Animated.View
      accessibilityRole="summary"
      accessibilityLabel={`${profile.name}, ${levelTitle}, Level ${level}, ${currentXP} of 100 XP`}
      style={[styles.container, profileStyle]}
    >
      <Pressable
        style={styles.top}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onEditPress();
        }}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
      >
        <View style={[styles.avatar, { borderColor: levelColors[0] }]}>
          <Text style={[styles.avatarText, { color: theme.text.primary }]}>
            {profile.avatar || profile.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
            {profile.name}
          </Text>
          <Text style={styles.levelLine}>
            <Text style={{ color: levelColors[0] }}>LEVEL {level}</Text>
            <Text style={{ color: theme.text.muted }}>{'   ·   '}{levelTitle}</Text>
          </Text>
          <View style={styles.xpRow}>
            <View style={[styles.xpTrack, { backgroundColor: theme.border.subtle }]}>
              <View style={[styles.xpFill, { width: `${xpProgress}%`, backgroundColor: levelColors[0] }]} />
            </View>
            <Text style={[styles.xpText, { color: theme.text.muted }]}>{currentXP}/100 XP</Text>
          </View>
        </View>
      </Pressable>

      <View style={[styles.stats, { borderTopColor: theme.border.subtle }]}>
        {stats.map((s) => (
          <View
            key={s.label}
            style={styles.statItem}
            accessibilityRole="text"
            accessibilityLabel={`${s.value} ${s.label}`}
          >
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: theme.text.muted }]}>{s.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 24,
    letterSpacing: -0.6,
  },
  levelLine: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 5,
    marginBottom: 12,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  xpFill: {
    height: '100%',
    borderRadius: 2,
  },
  xpText: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 11,
  },
  stats: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20,
    marginTop: 22,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 26,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 5,
  },
});
