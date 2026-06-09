/**
 * Achievements System
 * Defines all achievable badges and their criteria
 */

export type AchievementCategory = 'breaks' | 'streaks' | 'time' | 'exploration' | 'special';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  color: string;
  // Criteria for unlocking
  criteria: {
    type: 'total_breaks' | 'streak' | 'total_minutes' | 'category_breaks' | 'level' | 'first_break' | 'all_categories' | 'favorites' | 'tier_reached';
    value: number;
    category?: string; // For category_breaks type
    /**
     * Minimum tier for the `tier_reached` criterion. One of
     * 'solo' | 'pro' | 'family'. Achievement unlocks the first time
     * the user's effective tier reaches at least this level.
     */
    minTier?: 'solo' | 'pro' | 'family';
  };
  // XP reward for unlocking
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Special - Onboarding Achievement
  {
    id: 'health-pioneer',
    title: 'Health Pioneer',
    description: 'Complete your wellness setup',
    icon: '🏆',
    category: 'special',
    color: '#FFD166',
    criteria: { type: 'level', value: 0 }, // Manually unlocked
    xpReward: 25,
  },

  // Breaks Milestones
  {
    id: 'first-break',
    title: 'First Step',
    description: 'Complete your first break',
    icon: '🌱',
    category: 'breaks',
    color: '#06FFA5',
    criteria: { type: 'total_breaks', value: 1 },
    xpReward: 10,
  },
  {
    id: 'break-10',
    title: 'Getting Started',
    description: 'Complete 10 breaks',
    icon: '🎯',
    category: 'breaks',
    color: '#06FFA5',
    criteria: { type: 'total_breaks', value: 10 },
    xpReward: 25,
  },
  {
    id: 'break-50',
    title: 'Committed',
    description: 'Complete 50 breaks',
    icon: '💪',
    category: 'breaks',
    color: '#06FFA5',
    criteria: { type: 'total_breaks', value: 50 },
    xpReward: 50,
  },
  {
    id: 'break-100',
    title: 'Centurion',
    description: 'Complete 100 breaks',
    icon: '🏆',
    category: 'breaks',
    color: '#FFD166',
    criteria: { type: 'total_breaks', value: 100 },
    xpReward: 100,
  },
  {
    id: 'break-500',
    title: 'Break Master',
    description: 'Complete 500 breaks',
    icon: '👑',
    category: 'breaks',
    color: '#B47EFF',
    criteria: { type: 'total_breaks', value: 500 },
    xpReward: 250,
  },

  // Streak Achievements
  {
    id: 'streak-3',
    title: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streaks',
    color: '#FF6B6B',
    criteria: { type: 'streak', value: 3 },
    xpReward: 20,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '⭐',
    category: 'streaks',
    color: '#FF6B6B',
    criteria: { type: 'streak', value: 7 },
    xpReward: 50,
  },
  {
    id: 'streak-14',
    title: 'Fortnight Force',
    description: 'Maintain a 14-day streak',
    icon: '🌟',
    category: 'streaks',
    color: '#FFD166',
    criteria: { type: 'streak', value: 14 },
    xpReward: 75,
  },
  {
    id: 'streak-30',
    title: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: '💫',
    category: 'streaks',
    color: '#FFD166',
    criteria: { type: 'streak', value: 30 },
    xpReward: 150,
  },
  {
    id: 'streak-100',
    title: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    icon: '🚀',
    category: 'streaks',
    color: '#B47EFF',
    criteria: { type: 'streak', value: 100 },
    xpReward: 500,
  },

  // Time Achievements
  {
    id: 'time-60',
    title: 'Hour of Wellness',
    description: 'Accumulate 60 minutes of breaks',
    icon: '⏰',
    category: 'time',
    color: '#00E5FF',
    criteria: { type: 'total_minutes', value: 60 },
    xpReward: 30,
  },
  {
    id: 'time-300',
    title: 'Five Hours',
    description: 'Accumulate 5 hours of breaks',
    icon: '⏱️',
    category: 'time',
    color: '#00E5FF',
    criteria: { type: 'total_minutes', value: 300 },
    xpReward: 75,
  },
  {
    id: 'time-600',
    title: 'Ten Hours',
    description: 'Accumulate 10 hours of breaks',
    icon: '🕐',
    category: 'time',
    color: '#00E5FF',
    criteria: { type: 'total_minutes', value: 600 },
    xpReward: 150,
  },

  // Exploration Achievements
  {
    id: 'explorer-quick',
    title: 'Quick Learner',
    description: 'Try 5 different quick breaks',
    icon: '⚡',
    category: 'exploration',
    color: '#06FFA5',
    criteria: { type: 'category_breaks', value: 5, category: 'quick' },
    xpReward: 25,
  },
  {
    id: 'explorer-stretch',
    title: 'Stretch Expert',
    description: 'Complete 10 stretching sessions',
    icon: '🧘',
    category: 'exploration',
    color: '#B47EFF',
    criteria: { type: 'category_breaks', value: 10, category: 'stretch' },
    xpReward: 35,
  },
  {
    id: 'explorer-mindful',
    title: 'Mindful Soul',
    description: 'Complete 10 mindfulness sessions',
    icon: '🧘‍♀️',
    category: 'exploration',
    color: '#00E5FF',
    criteria: { type: 'category_breaks', value: 10, category: 'mindful' },
    xpReward: 35,
  },
  {
    id: 'explorer-active',
    title: 'Active Adventurer',
    description: 'Complete 10 active breaks',
    icon: '🏃',
    category: 'exploration',
    color: '#FFD166',
    criteria: { type: 'category_breaks', value: 10, category: 'active' },
    xpReward: 35,
  },

  // Level Achievements
  {
    id: 'level-5',
    title: 'Rising Star',
    description: 'Reach level 5',
    icon: '✨',
    category: 'special',
    color: '#B47EFF',
    criteria: { type: 'level', value: 5 },
    xpReward: 50,
  },
  {
    id: 'level-10',
    title: 'Wellness Legend',
    description: 'Reach level 10',
    icon: '🌈',
    category: 'special',
    color: '#B47EFF',
    criteria: { type: 'level', value: 10 },
    xpReward: 100,
  },

  // Special Achievements
  {
    id: 'favorite-5',
    title: 'Collector',
    description: 'Save 5 favorite breaks',
    icon: '❤️',
    category: 'special',
    color: '#FF6B6B',
    criteria: { type: 'favorites', value: 5 },
    xpReward: 20,
  },

  // Subscription tier achievements — celebrate the upgrade rather than
  // gating any tier behind achievement progress. The XP rewards are
  // intentionally modest; the unlock itself is the moment of
  // celebration.
  {
    id: 'tier-solo',
    title: 'Welcome to Solo',
    description: 'Unlock the full recovery library',
    icon: '🌱',
    category: 'special',
    color: '#06FFA5',
    criteria: { type: 'tier_reached', value: 0, minTier: 'solo' },
    xpReward: 50,
  },
  {
    id: 'tier-pro',
    title: 'Going Pro',
    description: 'Unlock Apple Health export and calendar-aware reminders',
    icon: '⚡',
    category: 'special',
    color: '#FFD166',
    criteria: { type: 'tier_reached', value: 0, minTier: 'pro' },
    xpReward: 100,
  },
  {
    id: 'tier-family',
    title: 'Family Mode',
    description: 'Bring your household into the routine',
    icon: '🏡',
    category: 'special',
    color: '#FF6B6B',
    criteria: { type: 'tier_reached', value: 0, minTier: 'family' },
    xpReward: 150,
  },
];

// Get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// Get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

// Calculate total possible XP from achievements
export function getTotalAchievementXP(): number {
  return ACHIEVEMENTS.reduce((sum, a) => sum + a.xpReward, 0);
}
