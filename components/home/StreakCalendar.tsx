/**
 * Streak Calendar Component
 * Weekly view of completed break days
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

interface StreakCalendarProps {
  completedDays: boolean[]; // Array of 7 booleans for each day
  currentDayIndex: number; // 0-6 (Monday-Sunday)
  streak: number;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Separate component to avoid hook violations - memoized for performance
const DayItem = React.memo(function DayItem({
  day,
  index,
  isCompleted,
  isToday,
  isFuture,
}: {
  day: string;
  index: number;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const translateY = useSharedValue(10);

  useEffect(() => {
    const delay = 300 + index * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    scale.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View
      style={[styles.dayContainer, animatedStyle]}
      accessibilityLabel={`${FULL_DAYS[index]}, ${isCompleted ? 'completed' : isToday ? 'today, not completed' : 'upcoming'}`}
    >
      <Text style={[styles.dayLabel, { color: theme.text.muted }, isToday && { color: theme.accent.primary, fontWeight: '700' }]}>
        {day}
      </Text>
      <View
        style={[
          styles.dayDot,
          { backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border.medium },
          isCompleted && { backgroundColor: theme.accent.primary, borderColor: theme.accent.primary },
          isToday && !isCompleted && { borderColor: theme.accent.primary, backgroundColor: `${theme.accent.primary}15` },
          isFuture && styles.dayDotFuture,
        ]}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        {isToday && !isCompleted && <View style={[styles.todayInner, { backgroundColor: theme.accent.primary }]} />}
      </View>
    </Animated.View>
  );
});

function StreakCalendar({
  completedDays,
  currentDayIndex,
  streak,
}: StreakCalendarProps) {
  const theme = useTheme();
  const streakScale = useSharedValue(0);
  const streakOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate streak badge
    streakOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    streakScale.value = withDelay(
      200,
      withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 200 })
      )
    );
  }, []);

  const streakBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
    opacity: streakOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Streak Badge */}
      <Animated.View style={[styles.streakBadge, streakBadgeStyle]} accessibilityLabel={`${streak} day streak`}>
        <Text style={styles.fireIcon} accessibilityElementsHidden={true}>🔥</Text>
        <Text style={[styles.streakCount, { color: theme.accent.warning }]}>{streak}</Text>
      </Animated.View>

      {/* Days Row */}
      <View style={styles.daysRow}>
        {DAYS.map((day, index) => (
          <DayItem
            key={index}
            day={day}
            index={index}
            isCompleted={completedDays[index]}
            isToday={index === currentDayIndex}
            isFuture={index > currentDayIndex}
          />
        ))}
      </View>
    </View>
  );
}

export default React.memo(StreakCalendar);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 150, 50, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 150, 50, 0.3)',
  },
  fireIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD166',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  dayLabelToday: {
    color: '#06FFA5',
    fontWeight: '700',
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayDotCompleted: {
    backgroundColor: '#06FFA5',
    borderColor: '#06FFA5',
  },
  dayDotToday: {
    borderColor: '#06FFA5',
    backgroundColor: 'rgba(6, 255, 165, 0.1)',
  },
  dayDotFuture: {
    opacity: 0.4,
  },
  todayInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06FFA5',
  },
  checkmark: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '700',
  },
});
