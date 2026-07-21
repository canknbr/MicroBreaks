import type { ExerciseCategory } from '@/data/exercises';
import type { IoniconsName } from '@/types/icons';
import { FREE_EXERCISE_IDS } from '@/constants/subscription';
import type { RecoveryStateId } from './states';

export type OutcomePackId = RecoveryStateId;

export const CATEGORY_DEFINITIONS: Array<{
  id: ExerciseCategory;
  title: string;
  subtitle: string;
  icon: IoniconsName;
  color: string;
}> = [
  {
    id: 'quick',
    title: 'Quick Breaks',
    subtitle: 'Fast resets for eyes, neck, and breathing',
    icon: 'flash',
    color: '#6CE9CC',
  },
  {
    id: 'stretch',
    title: 'Stretching',
    subtitle: 'Posture, hips, spine, and desk mobility',
    icon: 'body',
    color: '#BC26F4',
  },
  {
    id: 'mindful',
    title: 'Mindfulness',
    subtitle: 'Calm, focus, and mental reset routines',
    icon: 'leaf',
    color: '#21A3E6',
  },
  {
    id: 'active',
    title: 'Active Breaks',
    subtitle: 'Movement and energy boosts between work blocks',
    icon: 'walk',
    color: '#FAE34B',
  },
];

export const FEATURED_EXERCISE_ID = 'afternoon-reset';
export const FEATURED_GRADIENT = ['#6CE9CC', '#21A3E6'] as const;

export const OUTCOME_PACKS: Array<{
  id: OutcomePackId;
  shortLabel: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: ExerciseCategory;
  featuredBreakId: string;
}> = [
  {
    id: 'eyes',
    shortLabel: 'Eyes',
    title: 'Eye Rescue',
    description: 'For dry, tired, or blurry screen-heavy work sessions.',
    icon: '👀',
    color: '#21A3E6',
    category: 'quick',
    featuredBreakId: 'eye-rest',
  },
  {
    id: 'neck',
    shortLabel: 'Neck',
    title: 'Desk Neck Reset',
    description: 'For tight neck and shoulders after long desk blocks.',
    icon: '🧍',
    color: '#6CE9CC',
    category: 'quick',
    featuredBreakId: 'neck-roll',
  },
  {
    id: 'posture',
    shortLabel: 'Posture',
    title: 'Posture Rescue',
    description: 'For upper-body compression and desk posture fatigue.',
    icon: '💺',
    color: '#BC26F4',
    category: 'stretch',
    featuredBreakId: 'upper-body',
  },
  {
    id: 'focus',
    shortLabel: 'Focus',
    title: 'Focus Reset',
    description: 'For attention drift between tasks and meetings.',
    icon: '🧠',
    color: '#5BC741',
    category: 'mindful',
    featuredBreakId: 'deep-breath',
  },
  {
    id: 'energy',
    shortLabel: 'Energy',
    title: 'Energy Lift',
    description: 'For slow patches and afternoon dips when you need movement.',
    icon: '⚡',
    color: '#FAE34B',
    category: 'active',
    featuredBreakId: 'walk',
  },
  {
    id: 'stress',
    shortLabel: 'Stress',
    title: 'Calm Reset',
    description: 'For noisy workdays when you need a lower-friction reset.',
    icon: '🌿',
    color: '#54C4E8',
    category: 'mindful',
    featuredBreakId: 'meditation',
  },
];

export function formatDurationMinutes(totalDurationSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalDurationSeconds / 60));
  return `${minutes}m`;
}

export function isStarterExercise(exerciseId: string): boolean {
  return FREE_EXERCISE_IDS.some((id) => id === exerciseId);
}

export function getDefaultOutcomePackId(
  painAreas: string[],
  breakStyle: string[]
): OutcomePackId {
  if (painAreas.includes('eyes')) return 'eyes';
  if (painAreas.includes('neck') || painAreas.includes('shoulders')) return 'neck';
  if (painAreas.includes('upper_back') || painAreas.includes('lower_back')) return 'posture';
  if (breakStyle.includes('mindful')) return 'focus';
  if (breakStyle.includes('active')) return 'energy';
  if (breakStyle.includes('stretch')) return 'posture';
  return 'eyes';
}
