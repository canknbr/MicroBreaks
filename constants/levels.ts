/**
 * Level System Constants
 * Centralized level-related configuration
 */

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Wellness Beginner',
  2: 'Break Enthusiast',
  3: 'Committed Breaker',
  4: 'Wellness Warrior',
  5: 'Break Master',
  6: 'Zen Apprentice',
  7: 'Mindfulness Pro',
  8: 'Wellness Champion',
  9: 'Break Legend',
  10: 'Zen Master',
};

export const LEVEL_COLORS: Record<number, [string, string]> = {
  1: ['#9CA3AF', '#6B7280'], // Gray - Beginner
  2: ['#6CE9CC', '#3FA98C'], // Teal - Enthusiast
  3: ['#21A3E6', '#0099CC'], // Cyan - Committed
  4: ['#BC26F4', '#BC26F4'], // Purple - Warrior
  5: ['#FAE34B', '#FFAA00'], // Gold - Master
  6: ['#5BC741', '#2EB9AD'], // Jade - Apprentice
  7: ['#EF8633', '#E68A00'], // Orange - Pro
  8: ['#FF2472', '#D63359'], // Rose - Champion
  9: ['#BC26F4', '#5A4CD4'], // Indigo - Legend
  10: ['#FAE34B', '#EF8633'], // Gold Gradient - Zen Master
};

/**
 * Get level title for a given level number
 * Falls back to highest defined level if level exceeds max
 */
export function getLevelTitle(level: number): string {
  const clampedLevel = Math.max(1, Math.min(10, level));
  return LEVEL_TITLES[clampedLevel] || LEVEL_TITLES[10];
}

/**
 * Get level colors for a given level number
 * Falls back to highest defined level colors if level exceeds max
 */
export function getLevelColors(level: number): [string, string] {
  const clampedLevel = Math.max(1, Math.min(10, level));
  return LEVEL_COLORS[clampedLevel] || LEVEL_COLORS[10];
}

/**
 * Get level from XP
 * Levels up every 100 XP
 */
export function getLevelFromXP(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

/**
 * Get XP progress within current level
 */
export function getXPProgress(totalXP: number): { current: number; next: number; percentage: number } {
  const level = getLevelFromXP(totalXP);
  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const current = totalXP - xpForCurrentLevel;
  const next = xpForNextLevel - xpForCurrentLevel;
  const percentage = (current / next) * 100;

  return { current, next, percentage };
}
