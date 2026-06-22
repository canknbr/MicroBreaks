export interface HomeSubtitleInput {
  hasCompletedGoal: boolean;
  isNewUser: boolean;
  isEmpty: boolean;
  lastBreakMinutesAgo: number;
  dynamicSubtitle: string;
}

/**
 * Resolves the Home header subtitle from the user's current daily state.
 *
 * Precedence (highest first): completed goal, brand-new user, empty/returning
 * user, overdue-for-a-reset (>90 min). Otherwise the time-of-day greeting
 * subtitle is shown.
 */
export function getHomeSubtitle(input: HomeSubtitleInput): string {
  const { hasCompletedGoal, isNewUser, isEmpty, lastBreakMinutesAgo, dynamicSubtitle } = input;

  if (hasCompletedGoal) return "Amazing! You've crushed your goal today";
  if (isNewUser) return 'Choose the kind of relief you want and start with one guided reset.';
  if (isEmpty) return 'Pick what your body or mind needs right now and take a short reset.';
  if (lastBreakMinutesAgo > 90) {
    return 'You are overdue for a reset. Start with the recovery state that feels most relevant right now.';
  }
  return dynamicSubtitle;
}
