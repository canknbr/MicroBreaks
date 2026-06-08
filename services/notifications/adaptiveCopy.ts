/**
 * Adaptive Notification Copy
 *
 * The old break reminder system pulled from a fixed pool of strings,
 * weighted only by pain area. Users who saw five reminders a day were
 * staring at the same six messages.
 *
 * This module layers context-awareness on top of the base pool:
 *
 *   - **Time of day** picks the tone — morning is energetic, evening
 *     is calm, late-night is gentle / minimal.
 *   - **Streak state** can promote a "save your streak" line over the
 *     usual reminder when the streak is at risk.
 *   - **Today's progress** can promote a "halfway" or "one more" line
 *     when the user is almost at their daily goal.
 *
 * The composer is a pure function. The caller (services/notifications)
 * resolves the inputs from stores at notification-build time.
 */

export type PainTag = 'eyes' | 'neck' | 'shoulders' | 'upper_back' | 'lower_back' | 'wrists';

export type NotificationTone =
  | 'energetic'   // morning, fresh
  | 'focused'     // mid-morning to noon
  | 'recover'     // mid-afternoon, post-lunch dip
  | 'calm'        // evening
  | 'gentle';     // late night, low-energy

export type TimeBucket = 'early' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'late';

export interface AdaptiveCopyContext {
  /** `Date.now()` injection point so tests can pin time. */
  now: Date;
  /** User's current streak in days. */
  currentStreak: number;
  /** Today's break count from `breakHistory`. */
  todayBreakCount: number;
  /** Daily goal from `userStore.progress.dailyGoal`. */
  dailyGoal: number;
  /** Most recent break's `completedAt` timestamp (ms), or null. */
  lastBreakAt: number | null;
  /** From `onboardingStore.data.painAreas`. */
  painAreas: PainTag[];
}

export interface AdaptiveNotificationCopy {
  title: string;
  body: string;
  tone: NotificationTone;
  /** Why we picked this — used by analytics + jest assertions. */
  rationale: 'streak_at_risk' | 'almost_done' | 'first_break' | 'pain_focused' | 'time_of_day';
}

// ============================================================
// Time bucket
// ============================================================

export function getTimeBucket(now: Date): TimeBucket {
  const hour = now.getHours();
  if (hour < 6) return 'late';
  if (hour < 10) return 'early';
  if (hour < 12) return 'morning';
  if (hour < 15) return 'midday';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'late';
}

function toneForBucket(bucket: TimeBucket): NotificationTone {
  switch (bucket) {
    case 'early':     return 'energetic';
    case 'morning':   return 'focused';
    case 'midday':    return 'recover';
    case 'afternoon': return 'recover';
    case 'evening':   return 'calm';
    case 'late':      return 'gentle';
  }
}

// ============================================================
// Tone-tinted base copy
// ============================================================

const TONE_COPY: Record<NotificationTone, { title: string; body: string }[]> = {
  energetic: [
    { title: 'Morning reset 🌅', body: 'Roll your shoulders, set the tone for the day.' },
    { title: 'Wake up your body ☀️', body: '60 seconds of movement and you are ready.' },
    { title: 'Start strong 💪', body: 'A quick stretch now compounds across the whole day.' },
  ],
  focused: [
    { title: 'Quick reset before deep work 🎯', body: 'Clear your head — one minute, then back in.' },
    { title: 'Focus refill 🧘', body: 'Soften your gaze, drop your shoulders, three breaths.' },
    { title: 'Tiny break, big return ⏱️', body: 'Pause now to keep the next hour sharp.' },
  ],
  recover: [
    { title: 'Post-lunch reset 🌿', body: 'Stand up, stretch tall, undo the slump.' },
    { title: 'Afternoon recovery 🍃', body: 'A short pause to fight the 3pm dip.' },
    { title: 'Move it out 🤸', body: 'Tension builds quietly — release it now.' },
  ],
  calm: [
    { title: 'Wind down 🪷', body: 'Slow the breath, soften the jaw, let go a little.' },
    { title: 'Evening reset 🌙', body: 'A gentle pause to transition out of work mode.' },
    { title: 'Settle in 🌅', body: 'Breathe slowly. The day is ending well.' },
  ],
  gentle: [
    { title: 'Easy does it 🌌', body: 'A soft stretch and a slow breath — that is enough.' },
    { title: 'One breath 🤍', body: 'No goal, no metric. Just a single full breath.' },
    { title: 'Rest mode 🌒', body: 'Whenever you are ready. There is no rush.' },
  ],
};

// ============================================================
// Pain-area garnish
// ============================================================

const PAIN_AREA_COPY: Partial<Record<PainTag, { title: string; body: string }>> = {
  eyes:       { title: '20-20-20 time 👁️',       body: 'Look at something 20 feet away for 20 seconds.' },
  neck:       { title: 'Neck reset 🧘',           body: 'Slow chin tucks for 30 seconds — instant ease.' },
  shoulders:  { title: 'Roll your shoulders 🤸',  body: 'Five back, five forward. Feel the release.' },
  upper_back: { title: 'Stand tall 💪',           body: 'Open your chest, breathe wide, hold for ten.' },
  lower_back: { title: 'Cat-cow at your chair 🐈', body: 'Arch and round your spine five times.' },
  wrists:     { title: 'Wrist circles 🤲',        body: 'Ten each direction — typing relief.' },
};

// ============================================================
// Composer
// ============================================================

function pickFromArray<T>(arr: T[], now: Date): T {
  // Deterministic-ish rotation across the day so consecutive
  // notifications in the same bucket don't show the same string.
  if (arr.length === 0) {
    throw new Error('pickFromArray: empty array');
  }
  const index = Math.floor((now.getHours() * 60 + now.getMinutes()) / 7) % arr.length;
  return arr[index];
}

export function composeAdaptiveCopy(context: AdaptiveCopyContext): AdaptiveNotificationCopy {
  const bucket = getTimeBucket(context.now);
  const tone = toneForBucket(bucket);

  // Highest priority: streak at risk. The user worked hard for the
  // streak — protect it before showing anything else.
  const breaksLeft = Math.max(0, context.dailyGoal - context.todayBreakCount);
  const noBreakToday = context.todayBreakCount === 0;
  const hasStreak = context.currentStreak > 0;

  if (hasStreak && noBreakToday && (bucket === 'afternoon' || bucket === 'evening' || bucket === 'late')) {
    return {
      title: `Protect your ${context.currentStreak}-day streak 🔥`,
      body: 'One quick break keeps it alive. Even 60 seconds works.',
      tone,
      rationale: 'streak_at_risk',
    };
  }

  // First break of the user's life — go warm, not transactional.
  if (context.currentStreak === 0 && context.todayBreakCount === 0 && context.lastBreakAt == null) {
    return {
      title: 'Your first break 🌱',
      body: 'No pressure — one minute is plenty. Let me guide you.',
      tone,
      rationale: 'first_break',
    };
  }

  // One break short of the daily goal.
  if (context.dailyGoal > 0 && breaksLeft === 1 && context.todayBreakCount > 0) {
    return {
      title: 'One more 🎯',
      body: 'You are one break away from today\'s goal — finish strong.',
      tone,
      rationale: 'almost_done',
    };
  }

  // Pain-area overlay — bias toward the user's reported areas roughly
  // half the time so the rotation stays varied.
  const hasPain = context.painAreas && context.painAreas.length > 0;
  const shouldUsePainCopy =
    hasPain && (context.now.getMinutes() % 2 === 0);
  if (shouldUsePainCopy) {
    const pick = context.painAreas.find((tag) => PAIN_AREA_COPY[tag]);
    const painCopy = pick ? PAIN_AREA_COPY[pick] : null;
    if (painCopy) {
      return {
        title: painCopy.title,
        body: painCopy.body,
        tone,
        rationale: 'pain_focused',
      };
    }
  }

  // Default: tone-tinted rotation.
  const pool = TONE_COPY[tone];
  const pick = pickFromArray(pool, context.now);
  return {
    title: pick.title,
    body: pick.body,
    tone,
    rationale: 'time_of_day',
  };
}
