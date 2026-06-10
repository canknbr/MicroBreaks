/**
 * Notification Diagnostics
 *
 * Predictive gating + calendar-aware shifting are good for the user
 * but invisible — when a reminder gets moved or dropped silently the
 * user just sees "the app skipped my 2pm". This module records the
 * last decision in AsyncStorage so a Profile-screen card can surface
 * "why was my last reminder shifted?".
 *
 * Single-slot intentionally — we only need the most recent decision;
 * the history goes to Crashlytics via `addBreadcrumb` already.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@microbreaks/notif_last_decision';

export type ReminderDecisionKind =
  | 'scheduled'
  | 'shifted_past_meeting'
  | 'shifted_quiet_hours'
  | 'suppressed_predictive'
  | 'suppressed_no_slot';

export interface ReminderDecisionRecord {
  /** What happened to the latest reminder attempt. */
  kind: ReminderDecisionKind;
  /** Local ISO timestamp the decision was made. */
  recordedAt: string;
  /** Human-readable summary line. */
  summary: string;
  /** Optional extra details (e.g. shift minutes, busy windows). */
  details?: Record<string, string | number | boolean>;
}

let lastInMemory: ReminderDecisionRecord | null = null;

export async function recordReminderDecision(
  record: Omit<ReminderDecisionRecord, 'recordedAt'>,
): Promise<void> {
  const stamped: ReminderDecisionRecord = {
    ...record,
    recordedAt: new Date().toISOString(),
  };
  lastInMemory = stamped;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
  } catch {
    // Diagnostics are best-effort. A failed write here must never
    // affect the notification scheduling that just succeeded.
  }
}

export async function getLastReminderDecision(): Promise<ReminderDecisionRecord | null> {
  if (lastInMemory) return lastInMemory;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReminderDecisionRecord;
    lastInMemory = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function clearReminderDiagnostics(): Promise<void> {
  lastInMemory = null;
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignored
  }
}
