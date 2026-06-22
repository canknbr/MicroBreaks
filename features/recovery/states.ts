export const BREAK_TYPES = [
  { id: 'neck-roll', icon: '🧘', title: 'Neck', duration: '2m', color: '#06FFA5' },
  { id: 'eye-rest', icon: '👁️', title: 'Eyes', duration: '1m', color: '#00E5FF' },
  { id: 'upper-body', icon: '💪', title: 'Posture', duration: '3m', color: '#B47EFF' },
  { id: 'walk', icon: '🚶', title: 'Walk', duration: '5m', color: '#FFD166' },
  { id: 'deep-breath', icon: '🌬️', title: 'Breathe', duration: '1m', color: '#4ECDC4' },
] as const;

export type RecoveryStateId =
  | 'eyes'
  | 'neck'
  | 'posture'
  | 'focus'
  | 'energy'
  | 'stress';

export interface RecoveryState {
  id: RecoveryStateId;
  label: string;
  icon: string;
  title: string;
  description: string;
  breakId: string;
  color: string;
}

export interface RecoveryRecommendationContext {
  painAreas: string[];
  painSeverity: Record<string, 'mild' | 'moderate' | 'severe'>;
  breakStyle: string[];
}

export const RECOVERY_STATES: RecoveryState[] = [
  {
    id: 'eyes',
    label: 'Eyes',
    icon: '👀',
    title: 'Eye Rescue',
    description: 'Dry, tired, or blurry after screen-heavy work',
    breakId: 'eye-rest',
    color: '#00E5FF',
  },
  {
    id: 'neck',
    label: 'Neck',
    icon: '🧍',
    title: 'Desk Neck Reset',
    description: 'Tight neck and shoulders after long desk blocks',
    breakId: 'neck-roll',
    color: '#06FFA5',
  },
  {
    id: 'posture',
    label: 'Posture',
    icon: '💺',
    title: 'Posture Rescue',
    description: 'Upper body mobility when you feel compressed at the desk',
    breakId: 'upper-body',
    color: '#B47EFF',
  },
  {
    id: 'focus',
    label: 'Focus',
    icon: '🧠',
    title: 'Focus Reset',
    description: 'A short guided reset when your attention starts slipping',
    breakId: 'deep-breath',
    color: '#4ECDC4',
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: '⚡',
    title: 'Energy Lift',
    description: 'A quick movement reset between work blocks',
    breakId: 'walk',
    color: '#FFD166',
  },
  {
    id: 'stress',
    label: 'Stress',
    icon: '🌿',
    title: 'Calm Reset',
    description: 'A low-friction breathing reset when the day feels noisy',
    breakId: 'meditation',
    color: '#7DD3FC',
  },
];

export function getDefaultRecoveryStateId(
  painAreas: string[],
  breakStyle: string[],
  energyPattern?: string | null
): RecoveryStateId {
  if (painAreas.includes('eyes')) return 'eyes';
  if (painAreas.includes('neck') || painAreas.includes('shoulders')) return 'neck';
  if (painAreas.includes('upper_back') || painAreas.includes('lower_back')) return 'posture';
  if (breakStyle.includes('mindful')) return 'focus';
  if (breakStyle.includes('active')) return 'energy';
  if (breakStyle.includes('stretch')) return 'posture';
  if (energyPattern === 'afternoon_slump') return 'energy';
  if (energyPattern === 'night_owl') return 'stress';
  if (energyPattern === 'morning_person') return 'focus';
  return 'eyes';
}

export function getRecommendationContextForRecoveryState(
  stateId: RecoveryStateId
): RecoveryRecommendationContext {
  switch (stateId) {
    case 'eyes':
      return {
        painAreas: ['eyes'],
        painSeverity: { eyes: 'moderate' },
        breakStyle: ['quick'],
      };
    case 'neck':
      return {
        painAreas: ['neck', 'shoulders'],
        painSeverity: { neck: 'moderate', shoulders: 'moderate' },
        breakStyle: ['quick', 'stretch'],
      };
    case 'posture':
      return {
        painAreas: ['upper_back', 'lower_back'],
        painSeverity: { upper_back: 'moderate', lower_back: 'moderate' },
        breakStyle: ['stretch', 'active'],
      };
    case 'focus':
      return {
        painAreas: ['head'],
        painSeverity: { head: 'mild' },
        breakStyle: ['mindful', 'quick'],
      };
    case 'energy':
      return {
        painAreas: [],
        painSeverity: {},
        breakStyle: ['active'],
      };
    case 'stress':
      return {
        painAreas: ['head'],
        painSeverity: { head: 'moderate' },
        breakStyle: ['mindful'],
      };
    default:
      return {
        painAreas: [],
        painSeverity: {},
        breakStyle: [],
      };
  }
}

export function formatRelativeMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes >= 999) return 'Not yet today';
  if (minutes <= 0) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) {
    return `${hours}h ago`;
  }

  return `${hours}h ${remainder}m ago`;
}

export function formatNextBreakWindow(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
}

export function getRecoveryReason(
  stateId: RecoveryStateId,
  lastBreakMinutesAgo: number,
  breaksTaken: number,
  isNewUser: boolean
): string {
  if (isNewUser && breaksTaken === 0) {
    return 'Start with one short reset to get your first relief win before you explore the rest of the app.';
  }

  if (lastBreakMinutesAgo > 90) {
    return `You have gone ${formatRelativeMinutes(lastBreakMinutesAgo)} without a reset. This is the fastest way back into a better work rhythm.`;
  }

  switch (stateId) {
    case 'eyes':
      return 'Best after screen-heavy blocks, visual fatigue, or dry-eye moments.';
    case 'neck':
      return 'Best when your neck or shoulders start tightening during desk work.';
    case 'posture':
      return 'Best when you feel compressed after long seated focus sessions.';
    case 'focus':
      return 'Best between tasks when you want to reset attention without losing momentum.';
    case 'energy':
      return 'Best during slow patches, afternoon dips, or after back-to-back meetings.';
    case 'stress':
      return 'Best when the workday feels noisy and you need a calmer reset.';
    default:
      return 'A short reset matched to the kind of relief you want right now.';
  }
}

/**
 * Combines the base recovery reason with an optional adaptive-recommendation
 * reason and work-pattern timing hint into the single line shown on Home.
 *
 * A null `adaptiveReason` (no recommendation) or the generic
 * "Recommended for you" reason is treated as no adaptive lead-in.
 */
export function composeRecoveryReason(input: {
  baseReason: string;
  adaptiveReason: string | null;
  workPatternHint: string | null;
}): string {
  const { baseReason, adaptiveReason, workPatternHint } = input;

  if (adaptiveReason === null || adaptiveReason === 'Recommended for you') {
    return workPatternHint ? `${baseReason} ${workPatternHint}` : baseReason;
  }

  return `${adaptiveReason}. ${baseReason}${workPatternHint ? ` ${workPatternHint}` : ''}`;
}
