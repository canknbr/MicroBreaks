import { getExerciseById } from '@/data/exercises';

export const DEFAULT_BREAK_SESSION_ID = 'deep-breath';

export function resolveBreakSessionBreakId(
  breakId: string | string[] | undefined
): string {
  const candidate = Array.isArray(breakId) ? breakId[0] : breakId;

  if (candidate && getExerciseById(candidate)) {
    return candidate;
  }

  return DEFAULT_BREAK_SESSION_ID;
}
