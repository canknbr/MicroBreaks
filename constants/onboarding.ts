/**
 * Onboarding Flow Constants
 * Screen configurations and content for the onboarding experience
 */

import { OnboardingScreenId } from '@/types/onboarding';

// Keep the broader ID union in `types/onboarding.ts` for analytics history,
// but the active runtime path only includes the screens below.
export const ONBOARDING_SCREENS: OnboardingScreenId[] = [
  'ONB_001',
  'ONB_004',
  'ONB_006',
  'ONB_012',
  'ONB_013',
  'ONB_017',
  'ONB_020',
  'ONB_021',
];

export const ACTIVE_ONBOARDING_TOTAL_STEPS = 7;

export const PRIMARY_NEEDS = [
  {
    id: 'eyes',
    label: 'Eye strain',
    description: 'Dry, tired, or blurry eyes during screen-heavy work',
    icon: '👀',
  },
  {
    id: 'neck',
    label: 'Neck tension',
    description: 'Tight neck and shoulders after long desk blocks',
    icon: '🧍',
  },
  {
    id: 'focus',
    label: 'Focus reset',
    description: 'Mental fog, task-switching fatigue, and attention drops',
    icon: '🧠',
  },
  {
    id: 'energy',
    label: 'Energy dip',
    description: 'Low energy between meetings or during afternoon slumps',
    icon: '⚡',
  },
] as const;

export const SCREEN_TIME_BANDS = [
  {
    id: 'light',
    label: '0-4 hours',
    description: 'Light screen work',
    hours: 4,
  },
  {
    id: 'steady',
    label: '5-8 hours',
    description: 'Typical desk day',
    hours: 8,
  },
  {
    id: 'heavy',
    label: '9-10 hours',
    description: 'Screen-heavy workday',
    hours: 10,
  },
  {
    id: 'marathon',
    label: '11+ hours',
    description: 'Long intense days',
    hours: 12,
  },
] as const;

export const WORK_ROLES = [
  { id: 'developer', label: 'Software Developer', icon: '💻' },
  { id: 'designer', label: 'Designer/Creative', icon: '🎨' },
  { id: 'analyst', label: 'Data Analyst', icon: '📊' },
  { id: 'student', label: 'Student', icon: '📚' },
  { id: 'manager', label: 'Manager/Executive', icon: '👔' },
  { id: 'writer', label: 'Writer/Editor', icon: '✍️' },
  { id: 'support', label: 'Customer Support', icon: '🎧' },
  { id: 'other', label: 'Other', icon: '➕' },
] as const;

export const PAIN_AREAS = [
  { id: 'eyes', label: 'Eyes', icon: '◉' },
  { id: 'head', label: 'Head', icon: '○' },
  { id: 'neck', label: 'Neck', icon: '│' },
  { id: 'shoulders', label: 'Shoulders', icon: '─' },
  { id: 'upper_back', label: 'Upper Back', icon: '▲' },
  { id: 'lower_back', label: 'Lower Back', icon: '▼' },
  { id: 'wrists', label: 'Wrists', icon: '║' },
  { id: 'hands', label: 'Hands', icon: '╬' },
  { id: 'none', label: "I'm pain-free!", icon: '✓' },
] as const;

export const WORK_PATTERNS = [
  {
    id: 'deep_focus',
    label: 'Deep Focus Blocks',
    description: 'Long uninterrupted sessions',
  },
  {
    id: 'task_switching',
    label: 'Task Switching',
    description: 'Jumping between many tasks',
  },
  {
    id: 'meeting_heavy',
    label: 'Meeting Heavy',
    description: 'Lots of calls and meetings',
  },
  { id: 'flexible', label: 'Flexible', description: 'It changes daily' },
] as const;

export const ERGONOMIC_CHECKLIST = [
  { id: 'monitor', label: 'Monitor at eye level' },
  { id: 'feet', label: 'Feet flat on floor' },
  { id: 'keyboard', label: 'Keyboard at elbow height' },
  { id: 'chair', label: 'Good chair support' },
  { id: 'lighting', label: 'Adequate lighting' },
] as const;

export const NOTIFICATION_STYLES = [
  {
    id: 'gentle',
    label: 'Gentle',
    description: 'Subtle reminders, easy to snooze',
  },
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Regular reminders with flexibility',
  },
  {
    id: 'strict',
    label: 'Strict',
    description: 'Keep me accountable, harder to skip',
  },
  {
    id: 'smart',
    label: 'Adaptive',
    description: 'Adjusts around my workday preferences',
  },
] as const;

export const ENERGY_PATTERNS = [
  { id: 'morning_person', label: 'Morning Person', icon: '☀️' },
  { id: 'night_owl', label: 'Night Owl', icon: '🦉' },
  { id: 'afternoon_slump', label: 'Afternoon Slump', icon: '😴' },
  { id: 'steady_energy', label: 'Steady Energy', icon: '⚡' },
] as const;

export const BREAK_STYLES = [
  {
    id: 'movement',
    label: 'Movement Breaks',
    description: 'Stand, stretch, walk',
  },
  {
    id: 'desk_exercises',
    label: 'Desk Exercises',
    description: 'Stay seated, gentle stretches',
  },
  {
    id: 'breathing',
    label: 'Breathing/Mindfulness',
    description: 'Calm, focused, mental reset',
  },
  {
    id: 'eye_micro',
    label: 'Eye & Micro-movements',
    description: 'Quick, subtle, effective',
  },
  {
    id: 'mixed',
    label: 'Mixed Variety',
    description: 'Surprise me with different types',
  },
] as const;

export const TIMER_PRESETS = [
  {
    id: 'pomodoro',
    label: 'Pomodoro Classic',
    description: '25 min work → 5 min break',
    work: 25,
    break: 5,
  },
  {
    id: 'deep_work',
    label: 'Deep Work',
    description: '50 min work → 10 min break',
    work: 50,
    break: 10,
  },
  {
    id: 'micro_session',
    label: 'Micro-Session',
    description: '15 min work → 2 min break',
    work: 15,
    break: 2,
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Set your own timing',
    work: 25,
    break: 5,
  },
] as const;
