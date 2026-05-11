export type WorkPatternId =
  | 'deep_focus'
  | 'task_switching'
  | 'meeting_heavy'
  | 'flexible';

const WORK_PATTERN_INTERVAL_ADJUSTMENTS: Record<WorkPatternId, number> = {
  deep_focus: 10,
  task_switching: -5,
  meeting_heavy: -5,
  flexible: 0,
};

export function getEffectiveReminderInterval(
  baseIntervalMinutes: number,
  workPattern: string | null | undefined
): number {
  const normalizedBase = Number.isFinite(baseIntervalMinutes)
    ? Math.round(baseIntervalMinutes)
    : 25;
  const safeBase = Math.max(5, Math.min(120, normalizedBase));

  if (
    workPattern !== 'deep_focus' &&
    workPattern !== 'task_switching' &&
    workPattern !== 'meeting_heavy' &&
    workPattern !== 'flexible'
  ) {
    return safeBase;
  }

  return Math.max(
    5,
    Math.min(120, safeBase + WORK_PATTERN_INTERVAL_ADJUSTMENTS[workPattern])
  );
}

export function getWorkPatternTimingHint(
  workPattern: string | null | undefined
): string | null {
  switch (workPattern) {
    case 'deep_focus':
      return 'Timed to respect longer focus blocks.';
    case 'task_switching':
      return 'Timed for shorter resets between task switches.';
    case 'meeting_heavy':
      return 'Timed to fit the gaps between meetings.';
    case 'flexible':
      return 'Timed with a balanced workday rhythm.';
    default:
      return null;
  }
}
