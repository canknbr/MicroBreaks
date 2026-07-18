import { useMemo } from 'react';

export interface SmartInsightState {
  type: 'warning' | 'achievement' | 'motivation' | 'suggestion';
  title: string;
  message: string;
  actionLabel?: string;
}

export function useSmartInsight(
  breaksTaken: number,
  breaksGoal: number,
  lastBreakMinutesAgo: number | null,
  streak: number
): SmartInsightState {
  return useMemo(() => {
    if (lastBreakMinutesAgo != null && lastBreakMinutesAgo > 90) {
      return {
        type: 'warning',
        title: 'Time for a break!',
        message: `You've been working for ${Math.floor(lastBreakMinutesAgo / 60)}h ${lastBreakMinutesAgo % 60}m. Your body needs movement.`,
        actionLabel: 'Start Break',
      };
    }

    if (streak >= 5 && streak % 5 === 0) {
      return {
        type: 'achievement',
        title: '🔥 Hot streak!',
        message: `${streak} days in a row! You're building a healthy habit.`,
      };
    }

    const progress = (breaksTaken / breaksGoal) * 100;
    if (progress >= 75 && progress < 100) {
      return {
        type: 'motivation',
        title: 'Almost there!',
        message: `Just ${breaksGoal - breaksTaken} more break${breaksGoal - breaksTaken > 1 ? 's' : ''} to reach your daily goal.`,
      };
    }

    if (progress >= 100) {
      return {
        type: 'achievement',
        title: '🎉 Goal Complete!',
        message: "Amazing work! You've reached your daily wellness goal.",
      };
    }

    const tips = [
      'Short breaks every 25 minutes boost productivity by 30%.',
      'Eye breaks reduce digital eye strain significantly.',
      'Standing up regularly improves posture and energy.',
      'Deep breathing reduces stress hormones instantly.',
    ];

    return {
      type: 'suggestion',
      title: 'Pro tip',
      message: tips[breaksTaken % tips.length]!,
      actionLabel: 'Learn more',
    };
  }, [breaksTaken, breaksGoal, lastBreakMinutesAgo, streak]);
}
