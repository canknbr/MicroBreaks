/**
 * Sync Merger - Conflict Resolution
 * Handles merging local and remote data with appropriate strategies
 */

import type { UserProgress, UserPreferences, UserAchievements, UserProfile } from '@/store/userStore';
import type { CompletedBreak } from '@/services/storage';
import { MAX_BREAK_HISTORY } from '@/constants/config';

/**
 * Merge user profiles using last-write-wins strategy
 */
export function mergeProfiles(
  local: UserProfile & { updatedAt?: number },
  remote: UserProfile & { updatedAt?: number }
): UserProfile {
  const localTime = local.updatedAt ?? 0;
  const remoteTime = remote.updatedAt ?? 0;
  return remoteTime > localTime ? { ...remote } : { ...local };
}

/**
 * Merge progress using max-values strategy
 * Always takes the higher value for cumulative stats
 */
export function mergeProgress(local: UserProgress, remote: UserProgress): UserProgress {
  const totalXP = Math.max(local.totalXP, remote.totalXP);
  // Recovery bank is monotonic — always take the larger value so a
  // device that's been offline doesn't reset a more-recent gain.
  // The "since" date is the earlier of the two — the bank started
  // accruing whichever device logged the first break.
  //
  // Defensive: remote may be a pre-recovery-debt payload (sync layer
  // talks to older client versions on other devices). Sanitise both
  // sides before Math.max so we never propagate NaN into the store.
  const localMinutes = Number.isFinite(local.recoveryMinutes)
    ? local.recoveryMinutes
    : 0;
  const remoteMinutes = Number.isFinite(remote.recoveryMinutes)
    ? remote.recoveryMinutes
    : 0;
  const localSince =
    typeof local.recoveryBankSince === 'string' && local.recoveryBankSince
      ? local.recoveryBankSince
      : null;
  const remoteSince =
    typeof remote.recoveryBankSince === 'string' && remote.recoveryBankSince
      ? remote.recoveryBankSince
      : null;
  let recoveryBankSince: string | null;
  if (localSince && remoteSince) {
    recoveryBankSince = localSince < remoteSince ? localSince : remoteSince;
  } else {
    recoveryBankSince = localSince ?? remoteSince;
  }
  return {
    level: Math.floor(totalXP / 100) + 1,
    totalXP,
    totalBreaks: Math.max(local.totalBreaks, remote.totalBreaks),
    currentStreak: Math.max(local.currentStreak, remote.currentStreak),
    longestStreak: Math.max(local.longestStreak, remote.longestStreak),
    weeklyGoal: remote.weeklyGoal, // Use remote as source of truth for settings-like values
    dailyGoal: remote.dailyGoal,
    recoveryMinutes: Math.max(localMinutes, remoteMinutes),
    recoveryBankSince,
  };
}

/**
 * Merge preferences using union merge strategy
 * Combines lists from both sources, removing duplicates
 */
export function mergePreferences(local: UserPreferences, remote: UserPreferences): UserPreferences {
  return {
    favoriteBreaks: [...new Set([...local.favoriteBreaks, ...remote.favoriteBreaks])],
    recentBreaks: mergeRecentLists(local.recentBreaks, remote.recentBreaks, 10),
  };
}

/**
 * Merge recent lists maintaining order and limiting size
 */
function mergeRecentLists(local: string[], remote: string[], limit: number): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  // Interleave local and remote, preferring local order
  for (let i = 0; i < Math.max(local.length, remote.length); i++) {
    if (i < local.length && !seen.has(local[i])) {
      seen.add(local[i]);
      merged.push(local[i]);
    }
    if (i < remote.length && !seen.has(remote[i])) {
      seen.add(remote[i]);
      merged.push(remote[i]);
    }
  }

  return merged.slice(0, limit);
}

/**
 * Merge achievements using union + max counters strategy
 * - Union of unlocked IDs
 * - Earliest unlock timestamps
 * - Max category break counts
 * - Max total minutes
 */
export function mergeAchievements(local: UserAchievements, remote: UserAchievements): UserAchievements {
  // Union of unlocked IDs
  const unlockedIds = [...new Set([...local.unlockedIds, ...remote.unlockedIds])];

  // Earliest unlock timestamps
  const unlockedAt: Record<string, string> = {};
  for (const id of unlockedIds) {
    const localTime = local.unlockedAt[id];
    const remoteTime = remote.unlockedAt[id];
    if (localTime && remoteTime) {
      unlockedAt[id] = localTime < remoteTime ? localTime : remoteTime;
    } else {
      unlockedAt[id] = localTime || remoteTime;
    }
  }

  // Max category breaks
  const allCategories = new Set([
    ...Object.keys(local.categoryBreaks),
    ...Object.keys(remote.categoryBreaks),
  ]);
  const categoryBreaks: Record<string, number> = {};
  for (const cat of allCategories) {
    categoryBreaks[cat] = Math.max(
      local.categoryBreaks[cat] ?? 0,
      remote.categoryBreaks[cat] ?? 0
    );
  }

  return {
    unlockedIds,
    unlockedAt,
    categoryBreaks,
    totalMinutes: Math.max(local.totalMinutes, remote.totalMinutes),
  };
}

/**
 * Merge break histories by ID, deduplicate, sort by date, and limit
 */
function getBreakMutationTime(breakItem: CompletedBreak): number {
  return new Date(breakItem.updatedAt ?? breakItem.completedAt).getTime();
}

export function mergeBreakHistories(
  local: CompletedBreak[],
  remote: CompletedBreak[]
): CompletedBreak[] {
  const breakMap = new Map<string, CompletedBreak>();

  // Add remote breaks first.
  for (const b of remote) {
    breakMap.set(b.id, b);
  }

  // For duplicate IDs, prefer whichever copy was updated most recently.
  // If timestamps match, preserve local to keep the current device's latest view.
  for (const b of local) {
    const existing = breakMap.get(b.id);
    if (!existing || getBreakMutationTime(b) >= getBreakMutationTime(existing)) {
      breakMap.set(b.id, b);
    }
  }

  // Sort by completedAt descending (newest first)
  const merged = Array.from(breakMap.values()).sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  // Limit to MAX_BREAK_HISTORY
  return merged.slice(0, MAX_BREAK_HISTORY);
}
