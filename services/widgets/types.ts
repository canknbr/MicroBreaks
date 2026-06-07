/**
 * Widget Snapshot Types
 *
 * The native Widget Extension reads from a single, tiny, versioned JSON
 * blob — the `WidgetSnapshot`. Anything the widget renders must come
 * from this shape; the widget never reaches into AsyncStorage, never
 * hits Firestore, and never recomputes anything heavier than a number
 * format.
 *
 * Why so strict:
 *   - Widgets run inside a separate process with strict memory + time
 *     limits. The OS will kill the timeline provider if it does too much.
 *   - Keeping the snapshot tiny + versioned means the Swift decoder is
 *     trivial and adding/removing fields is safe across app versions.
 *
 * Bump `SCHEMA_VERSION` whenever you change the shape. The widget reads
 * the version first and falls back to a "Open the app" placeholder when
 * it sees a version it doesn't recognise.
 */

export const WIDGET_SNAPSHOT_SCHEMA_VERSION = 1 as const;

export interface WidgetSnapshotToday {
  /** Number of breaks finished since local midnight. */
  breaksTaken: number;
  /** User's current daily target. */
  breaksGoal: number;
  /** 0–100 progress percentage, pre-rounded for the widget. */
  progressPct: number;
  /** Total minutes spent in completed breaks today. */
  totalMinutes: number;
}

export interface WidgetSnapshotStreak {
  current: number;
  longest: number;
  /**
   * True when the user has a streak going AND hasn't taken a break today
   * yet — the widget surfaces a "Don't break your X-day streak" prompt
   * in this state, the single highest-impact widget moment.
   */
  atRisk: boolean;
}

export interface WidgetSnapshotLastBreak {
  /** Epoch ms — the widget formats relative time itself. */
  completedAt: number;
  title: string;
  icon: string;
  /** Hex string the widget paints accents with. */
  color: string;
}

export interface WidgetSnapshotRecommendation {
  breakId: string;
  title: string;
  icon: string;
  color: string;
  durationMin: number;
  /** Deep link the widget tap launches. */
  deepLink: string;
}

export interface WidgetSnapshotUser {
  level: number;
  /** Display name; falls back to "Friend" when no profile name is set. */
  name: string;
}

export interface WidgetSnapshot {
  schemaVersion: typeof WIDGET_SNAPSHOT_SCHEMA_VERSION;
  /** Epoch ms — used for "Updated 3 min ago" footers and stale checks. */
  generatedAt: number;
  today: WidgetSnapshotToday;
  streak: WidgetSnapshotStreak;
  lastBreak: WidgetSnapshotLastBreak | null;
  nextRecommended: WidgetSnapshotRecommendation | null;
  user: WidgetSnapshotUser;
}

export const EMPTY_WIDGET_SNAPSHOT: WidgetSnapshot = {
  schemaVersion: WIDGET_SNAPSHOT_SCHEMA_VERSION,
  generatedAt: 0,
  today: { breaksTaken: 0, breaksGoal: 4, progressPct: 0, totalMinutes: 0 },
  streak: { current: 0, longest: 0, atRisk: false },
  lastBreak: null,
  nextRecommended: null,
  user: { level: 1, name: 'Friend' },
};
