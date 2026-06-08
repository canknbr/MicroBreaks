/**
 * App Configuration Constants
 * Centralized location for all magic numbers and configuration values
 */

// ==========================================
// STORAGE LIMITS
// ==========================================

/**
 * Maximum number of breaks to store in history.
 * 5000 supports multi-year usage at a 5-breaks-per-day rhythm without
 * truncating the "year" analytics surface into misleading data.
 */
export const MAX_BREAK_HISTORY = 5000;

/** Maximum number of days to keep in streak history */
export const MAX_STREAK_HISTORY_DAYS = 90;

/**
 * Grace days a user can spend per ISO week to keep their streak alive
 * across a single missed day. The window resets every Monday. Pricing-
 * gated experiments may later expose this as a paid lever.
 */
export const MAX_GRACES_PER_WEEK = 1;

// ==========================================
// XP AND LEVELING
// ==========================================

/** XP required to level up */
export const XP_PER_LEVEL = 100;

/** XP earned per second of break time */
export const XP_PER_SECOND = 0.1;

/** XP bonus per completed step */
export const XP_PER_STEP = 2;

// ==========================================
// BREAK SESSION
// ==========================================

/** Duration of preparation phase in seconds */
export const PREPARATION_DURATION = 3;

/** Duration of instruction phase in seconds */
export const INSTRUCTION_DURATION = 4;

/** Duration of transition phase in seconds */
export const TRANSITION_DURATION = 1;

// ==========================================
// NOTIFICATIONS
// ==========================================

/** Hour to send streak protection reminder (24h format) */
export const STREAK_REMINDER_HOUR = 19; // 7 PM

/** Hour to send daily goal reminder (24h format) */
export const GOAL_REMINDER_HOUR = 17; // 5 PM

/** Default reminder interval in minutes */
export const DEFAULT_REMINDER_INTERVAL = 25;

/** Default quiet hours start (24h format) */
export const DEFAULT_QUIET_HOURS_START = 22; // 10 PM

/** Default quiet hours end (24h format) */
export const DEFAULT_QUIET_HOURS_END = 8; // 8 AM

// ==========================================
// GOALS AND STREAKS
// ==========================================

/** Minimum daily goal (breaks per day) */
export const MIN_DAILY_GOAL = 3;

/** Default weekly goal (breaks per week). Targets a realistic 5 resets per day. */
export const DEFAULT_WEEKLY_GOAL = 35;

/** Streak milestones for special notifications */
export const STREAK_MILESTONES = [7, 14, 30, 60, 100] as const;

/** Hours remaining threshold for "at risk" streak warning */
export const STREAK_AT_RISK_HOURS = 6;

// ==========================================
// VALIDATION
// ==========================================

/** Minimum break duration in seconds */
export const MIN_BREAK_DURATION = 1;

/** Maximum break duration in seconds (10 minutes) */
export const MAX_BREAK_DURATION = 600;

/** Maximum weekly goal */
export const MAX_WEEKLY_GOAL = 100;

/** Minimum weekly goal */
export const MIN_WEEKLY_GOAL = 1;

// ==========================================
// UI CONSTANTS
// ==========================================

/** Maximum level for display purposes */
export const MAX_DISPLAY_LEVEL = 10;

/** Animation durations in milliseconds */
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

/** Splash screen minimum duration in milliseconds */
export const SPLASH_MIN_DURATION = 2800;
