/**
 * Store Review Service
 * Manages when to prompt users for app store ratings
 */

import * as StoreReview from 'expo-store-review';

const MIN_BREAKS_BEFORE_PROMPT = 5;
const MIN_DAYS_BETWEEN_PROMPTS = 14;

interface ReviewState {
  lastPromptDate: string | null;
  breaksCompletedSincePrompt: number;
  hasPrompted: boolean;
}

const reviewState: ReviewState = {
  lastPromptDate: null,
  breaksCompletedSincePrompt: 0,
  hasPrompted: false,
};

/**
 * Track a break completion for review prompt timing
 */
export function trackBreakForReview(): void {
  reviewState.breaksCompletedSincePrompt += 1;
}

/**
 * Check if we should show a review prompt and show it if conditions are met.
 * Call this after a break completion where the user gave a positive rating (>= 4).
 */
export async function maybeRequestReview(userRating: number): Promise<boolean> {
  // Only prompt happy users (rating >= 4)
  if (userRating < 4) return false;

  // Need enough breaks
  if (reviewState.breaksCompletedSincePrompt < MIN_BREAKS_BEFORE_PROMPT) return false;

  // Check cooldown period
  if (reviewState.lastPromptDate) {
    const lastPrompt = new Date(reviewState.lastPromptDate).getTime();
    const daysSincePrompt = (Date.now() - lastPrompt) / (1000 * 60 * 60 * 24);
    if (daysSincePrompt < MIN_DAYS_BETWEEN_PROMPTS) return false;
  }

  // Check if store review is available
  const isAvailable = await StoreReview.isAvailableAsync();
  if (!isAvailable) return false;

  // Show native review dialog
  try {
    await StoreReview.requestReview();
    reviewState.lastPromptDate = new Date().toISOString();
    reviewState.breaksCompletedSincePrompt = 0;
    reviewState.hasPrompted = true;
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if store review has ever been prompted
 */
export function hasBeenPrompted(): boolean {
  return reviewState.hasPrompted;
}
