/**
 * Centralized storage key registry.
 *
 * Two conventions live here for historical reasons:
 *  - `microbreaks-*`  → Zustand persist names. Zustand writes/reads keys
 *    of the form `microbreaks-<slice>` straight via the persist middleware.
 *  - `@microbreaks/*` → Direct AsyncStorage / MMKV reads from service code
 *    (break history, sync queues, analytics outbox, etc.).
 *
 * Both prefixes are recognized by `services/account/sessionReset.ts` when
 * clearing per-user state.
 *
 * When adding a new key:
 *  1. Add the constant below.
 *  2. Import it where you use it (do **not** inline the string).
 *  3. If the value belongs to a per-user namespace, add the same prefix to
 *     `RESETTABLE_STORAGE_PREFIXES` in `sessionReset.ts`.
 */

// Zustand persist slice names.
export const ZUSTAND_PERSIST_KEYS = {
  USER: 'microbreaks-user',
  SETTINGS: 'microbreaks-settings',
  TIMER: 'microbreaks-timer',
  SUBSCRIPTION: 'microbreaks-subscription',
  NOTIFICATIONS: 'microbreaks-notifications',
  ONBOARDING: 'microbreaks-onboarding',
  MISSIONS: 'microbreaks-missions',
  BUDDIES: 'microbreaks-buddies',
} as const;

// Direct storage keys for service-owned blobs.
export const SERVICE_STORAGE_KEYS = {
  BREAK_HISTORY: '@microbreaks/break_history',
  USER_STATS: '@microbreaks/user_stats',
  STREAK_DATA: '@microbreaks/streak_data',
  SETTINGS: '@microbreaks/settings',
  DEVICE_INSTALLATION_ID: '@microbreaks/device_installation_id',
  ANALYTICS_QUEUE: '@microbreaks/analytics_queue',
} as const;

// Per-user keyed prefixes. The actual key is built by appending the user id.
export const SYNC_KEY_PREFIXES = {
  SYNC_METADATA: '@microbreaks/sync_metadata/',
  PENDING_QUEUE: '@microbreaks/sync_pending_queue/',
} as const;

// Legacy (pre-multi-user) keys retained so migration code can still find
// stale entries written by older builds.
export const LEGACY_SYNC_KEYS = {
  SYNC_METADATA: '@microbreaks/sync_metadata',
  PENDING_QUEUE: '@microbreaks/sync_pending_queue',
} as const;

export type ZustandPersistKey =
  (typeof ZUSTAND_PERSIST_KEYS)[keyof typeof ZUSTAND_PERSIST_KEYS];
export type ServiceStorageKey =
  (typeof SERVICE_STORAGE_KEYS)[keyof typeof SERVICE_STORAGE_KEYS];
