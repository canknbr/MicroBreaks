/**
 * Winback Banner Dismissal — Session State
 *
 * The expired/refunded re-engage banner shows once per cold launch.
 * Dismissals don't persist; if a user closes and reopens the app,
 * we re-prompt. That's intentional: we don't want a one-tap-dismiss
 * to hide an actual subscription lapse for days.
 *
 * Stored in module scope so every component reads the same value
 * without a Zustand slice — this is genuinely a single boolean.
 */

let dismissedThisSession = false;

export function isWinbackDismissed(): boolean {
  return dismissedThisSession;
}

export function dismissWinback(): void {
  dismissedThisSession = true;
}

/** Test seam — reset between cases. */
export function __resetWinbackForTests(): void {
  dismissedThisSession = false;
}
