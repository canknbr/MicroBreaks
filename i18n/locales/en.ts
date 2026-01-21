/**
 * English Translations
 * Complete translation file for MicroBreaks
 */

export default {
  // ============================================
  // Common
  // ============================================
  common: {
    appName: 'MicroBreaks',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    continue: 'Continue',
    retry: 'Try Again',
    close: 'Close',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    refresh: 'Refresh',
    seeAll: 'See All',
    learnMore: 'Learn More',
  },

  // ============================================
  // Navigation
  // ============================================
  navigation: {
    home: 'Home',
    breaks: 'Breaks',
    stats: 'Stats',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications',
  },

  // ============================================
  // Home Screen
  // ============================================
  home: {
    greeting: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      night: 'Good Night',
    },
    title: 'Ready for a break?',
    subtitle: 'Take a moment to refresh your mind and body',
    quickBreaks: 'Quick Breaks',
    startBreak: 'Start Break',
    nextBreakIn: 'Next break in',
    dailyProgress: 'Daily Progress',
    weeklyProgress: 'Weekly Progress',
    breaksToday: '{{count}} of {{goal}} breaks today',
    streakDays: '{{count}} day streak',
    streakDays_plural: '{{count}} days streak',
    levelProgress: 'Level {{level}}',
    xpToNext: '{{xp}} XP to next level',
    smartInsight: {
      longSession: "You've been working for a while. Time for a break!",
      goodProgress: "Great progress today! Keep it up!",
      almostGoal: "Almost there! Just {{count}} more break to reach your goal.",
      almostGoal_plural: "Almost there! Just {{count}} more breaks to reach your goal.",
      streakWarning: "Don't forget your break to keep your streak!",
    },
    emptyState: {
      title: 'Welcome to MicroBreaks',
      subtitle: 'Start your wellness journey by taking your first break',
      action: 'Take First Break',
    },
  },

  // ============================================
  // Breaks Screen
  // ============================================
  breaks: {
    title: 'Browse Breaks',
    subtitle: 'Find the perfect break for you',
    featured: 'Featured',
    categories: {
      all: 'All',
      quick: 'Quick',
      stretch: 'Stretch',
      mindful: 'Mindful',
      active: 'Active',
    },
    duration: {
      short: '1-2 min',
      medium: '3-5 min',
      long: '5+ min',
    },
    filters: {
      duration: 'Duration',
      category: 'Category',
      favorites: 'Favorites',
    },
    empty: {
      search: 'No breaks found for "{{query}}"',
      filter: 'No breaks match your filters',
      favorites: 'No favorite breaks yet',
    },
    card: {
      duration: '{{minutes}} min',
      steps: '{{count}} step',
      steps_plural: '{{count}} steps',
    },
  },

  // ============================================
  // Break Session
  // ============================================
  breakSession: {
    preparation: {
      title: 'Get Ready',
      subtitle: 'Find a comfortable position',
      starting: 'Starting in {{seconds}}...',
    },
    controls: {
      pause: 'Pause',
      resume: 'Resume',
      skip: 'Skip',
      end: 'End Session',
    },
    progress: {
      step: 'Step {{current}} of {{total}}',
      timeRemaining: '{{seconds}}s remaining',
    },
    completion: {
      title: 'Great job!',
      subtitle: 'You completed the break',
      xpEarned: '+{{xp}} XP',
      streakMaintained: 'Streak maintained!',
      newAchievement: 'New achievement unlocked!',
      stats: {
        duration: 'Duration',
        steps: 'Steps completed',
        calories: 'Est. calories',
      },
    },
    feedback: {
      title: 'How was this break?',
      subtitle: 'Your feedback helps us improve',
      ratings: {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Great',
        5: 'Excellent',
      },
    },
    confirmEnd: {
      title: 'End Session?',
      message: 'Are you sure you want to end this break session?',
    },
  },

  // ============================================
  // Exercises
  // ============================================
  exercises: {
    // Quick Breaks
    eyeRest: {
      title: 'Eye Rest',
      description: 'Give your eyes a break from the screen',
    },
    deepBreathing: {
      title: 'Deep Breathing',
      description: 'Calm your mind with breathing exercises',
    },
    neckRolls: {
      title: 'Neck Rolls',
      description: 'Release tension in your neck',
    },
    wristStretch: {
      title: 'Wrist Stretch',
      description: 'Prevent strain from typing',
    },

    // Stretching
    upperBodyStretch: {
      title: 'Upper Body Stretch',
      description: 'Full upper body stretching routine',
    },
    lowerBodyStretch: {
      title: 'Lower Body Stretch',
      description: 'Stretch your legs and lower back',
    },
    fullBodyStretch: {
      title: 'Full Body Stretch',
      description: 'Complete stretching session',
    },
    shoulderRelease: {
      title: 'Shoulder Release',
      description: 'Release shoulder tension',
    },

    // Mindful
    miniMeditation: {
      title: 'Mini Meditation',
      description: 'Quick mindfulness session',
    },
    bodyScan: {
      title: 'Body Scan',
      description: 'Mindful body awareness',
    },
    gratitude: {
      title: 'Gratitude Moment',
      description: 'Reflect on what you\'re grateful for',
    },
    breathAwareness: {
      title: 'Breath Awareness',
      description: 'Focus on your breathing',
    },

    // Active
    quickWalk: {
      title: 'Quick Walk',
      description: 'Get moving with a short walk',
    },
    deskExercises: {
      title: 'Desk Exercises',
      description: 'Exercises you can do at your desk',
    },
    energizer: {
      title: 'Energizer',
      description: 'Boost your energy with movement',
    },
    jumpingJacks: {
      title: 'Jumping Jacks',
      description: 'Quick cardio burst',
    },

    // Featured
    afternoonReset: {
      title: 'Afternoon Reset',
      description: 'Perfect mid-day refresher',
    },
  },

  // ============================================
  // Stats Screen
  // ============================================
  stats: {
    title: 'Your Progress',
    subtitle: 'Track your wellness journey',
    periods: {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      all: 'All Time',
    },
    metrics: {
      totalBreaks: 'Total Breaks',
      totalTime: 'Total Time',
      currentStreak: 'Current Streak',
      longestStreak: 'Longest Streak',
      averageDaily: 'Daily Average',
      favoriteCategory: 'Favorite Category',
    },
    charts: {
      weeklyBreaks: 'Weekly Breaks',
      categoryBreakdown: 'Category Breakdown',
      timeOfDay: 'Time of Day',
    },
    achievements: {
      title: 'Achievements',
      unlocked: '{{count}} unlocked',
      progress: '{{current}}/{{total}}',
      viewAll: 'View All Achievements',
    },
    empty: {
      title: 'No data yet',
      subtitle: 'Complete some breaks to see your stats',
      action: 'Take a Break',
    },
  },

  // ============================================
  // Profile Screen
  // ============================================
  profile: {
    title: 'Profile',
    level: 'Level {{level}}',
    xpProgress: '{{current}}/{{next}} XP',
    memberSince: 'Member since {{date}}',
    sections: {
      account: 'Account',
      preferences: 'Preferences',
      notifications: 'Notifications',
      about: 'About',
    },
    items: {
      editProfile: 'Edit Profile',
      goals: 'Goals',
      notifications: 'Notification Settings',
      theme: 'Theme',
      sound: 'Sound Effects',
      haptics: 'Haptic Feedback',
      voiceGuidance: 'Voice Guidance',
      language: 'Language',
      privacy: 'Privacy',
      help: 'Help & Support',
      about: 'About MicroBreaks',
      rateApp: 'Rate App',
      shareApp: 'Share with Friends',
      signOut: 'Sign Out',
    },
    signOutConfirm: {
      title: 'Sign Out',
      message: 'Are you sure you want to sign out? Your progress will be saved.',
    },
  },

  // ============================================
  // Settings
  // ============================================
  settings: {
    theme: {
      title: 'Theme',
      dark: 'Dark',
      light: 'Light',
      system: 'System',
    },
    notifications: {
      title: 'Notifications',
      enabled: 'Enable Notifications',
      breakReminders: 'Break Reminders',
      reminderInterval: 'Reminder Interval',
      streakAlerts: 'Streak Alerts',
      goalNotifications: 'Goal Notifications',
      quietHours: 'Quiet Hours',
      quietHoursTime: '{{start}} - {{end}}',
      workDaysOnly: 'Work Days Only',
    },
    audio: {
      title: 'Audio & Haptics',
      sound: 'Sound Effects',
      haptics: 'Haptic Feedback',
      voiceGuidance: 'Voice Guidance',
    },
    privacy: {
      title: 'Privacy',
      analytics: 'Analytics',
      crashReporting: 'Crash Reporting',
    },
    goals: {
      title: 'Goals',
      weekly: 'Weekly Goal',
      daily: 'Daily Goal',
      breaksPerWeek: '{{count}} breaks/week',
      breaksPerDay: '{{count}} breaks/day',
    },
    language: {
      title: 'Language',
      current: 'Current: {{language}}',
    },
  },

  // ============================================
  // Onboarding
  // ============================================
  onboarding: {
    welcome: {
      title: 'Welcome to MicroBreaks',
      subtitle: 'Your wellness companion for a healthier workday',
      action: 'Get Started',
    },
    benefits: {
      title: 'Why Micro Breaks?',
      items: {
        eyes: 'Reduce eye strain',
        posture: 'Improve posture',
        focus: 'Boost focus',
        energy: 'Increase energy',
      },
    },
    personalization: {
      title: 'Let\'s personalize',
      subtitle: 'Help us understand your needs',
      workRole: {
        question: 'What best describes your work?',
        options: {
          developer: 'Developer',
          designer: 'Designer',
          writer: 'Writer',
          manager: 'Manager',
          student: 'Student',
          other: 'Other',
        },
      },
      screenTime: {
        question: 'How many hours do you spend at a screen?',
        options: {
          low: 'Less than 4 hours',
          medium: '4-8 hours',
          high: 'More than 8 hours',
        },
      },
      painAreas: {
        question: 'Do you experience any discomfort?',
        options: {
          eyes: 'Eye strain',
          neck: 'Neck pain',
          back: 'Back pain',
          wrists: 'Wrist pain',
          shoulders: 'Shoulder tension',
          none: 'None',
        },
      },
    },
    notifications: {
      title: 'Stay on track',
      subtitle: 'Enable notifications to never miss a break',
      enable: 'Enable Notifications',
      later: 'Maybe Later',
    },
    complete: {
      title: 'You\'re all set!',
      subtitle: 'Let\'s take your first break together',
      action: 'Start First Break',
    },
  },

  // ============================================
  // Achievements
  // ============================================
  achievements: {
    title: 'Achievements',
    subtitle: 'Celebrate your milestones',
    categories: {
      breaks: 'Breaks',
      streaks: 'Streaks',
      time: 'Time',
      exploration: 'Exploration',
      special: 'Special',
    },
    items: {
      firstStep: {
        title: 'First Step',
        description: 'Complete your first break',
      },
      gettingStarted: {
        title: 'Getting Started',
        description: 'Complete 10 breaks',
      },
      committed: {
        title: 'Committed',
        description: 'Complete 50 breaks',
      },
      centurion: {
        title: 'Centurion',
        description: 'Complete 100 breaks',
      },
      breakMaster: {
        title: 'Break Master',
        description: 'Complete 500 breaks',
      },
      streak3: {
        title: 'On a Roll',
        description: 'Maintain a 3-day streak',
      },
      streak7: {
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
      },
      streak14: {
        title: 'Fortnight Focus',
        description: 'Maintain a 14-day streak',
      },
      streak30: {
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
      },
      streak100: {
        title: 'Unstoppable',
        description: 'Maintain a 100-day streak',
      },
      hour1: {
        title: 'Time Well Spent',
        description: 'Accumulate 1 hour of breaks',
      },
      hour5: {
        title: 'Dedicated',
        description: 'Accumulate 5 hours of breaks',
      },
      hour10: {
        title: 'Wellness Warrior',
        description: 'Accumulate 10 hours of breaks',
      },
    },
    locked: 'Locked',
    unlocked: 'Unlocked',
    unlockedAt: 'Unlocked on {{date}}',
    reward: '+{{xp}} XP',
  },

  // ============================================
  // Notifications
  // ============================================
  notifications: {
    title: 'Notifications',
    empty: 'No notifications yet',
    markAllRead: 'Mark All Read',
    types: {
      breakReminder: 'Break Reminder',
      streakAlert: 'Streak Alert',
      achievementUnlocked: 'Achievement Unlocked',
      goalComplete: 'Goal Complete',
      levelUp: 'Level Up',
      general: 'General',
    },
    messages: {
      breakReminder: "Time for a break! Your eyes and body will thank you.",
      streakWarning: "Don't lose your {{count}}-day streak! Take a break today.",
      goalComplete: "You've reached your daily goal! Great work!",
      levelUp: "Congratulations! You've reached level {{level}}!",
      achievementUnlocked: "You've unlocked: {{achievement}}",
    },
  },

  // ============================================
  // Errors
  // ============================================
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Unable to connect. Please check your internet connection.',
    storage: 'Unable to save data. Please try again.',
    notificationPermission: 'Please enable notifications in settings.',
    somethingWentWrong: 'Something went wrong',
    tryAgain: 'Please try again',
    contactSupport: 'If the problem persists, please contact support.',
  },

  // ============================================
  // Time & Dates
  // ============================================
  time: {
    justNow: 'Just now',
    minutesAgo: '{{count}} minute ago',
    minutesAgo_plural: '{{count}} minutes ago',
    hoursAgo: '{{count}} hour ago',
    hoursAgo_plural: '{{count}} hours ago',
    daysAgo: '{{count}} day ago',
    daysAgo_plural: '{{count}} days ago',
    seconds: '{{count}}s',
    minutes: '{{count}}m',
    hours: '{{count}}h',
    days: '{{count}}d',
  },

  // ============================================
  // Formatting
  // ============================================
  format: {
    date: {
      short: 'MM/DD/YYYY',
      long: 'MMMM D, YYYY',
    },
    time: {
      short: 'h:mm A',
      long: 'h:mm:ss A',
    },
  },
} as const;
