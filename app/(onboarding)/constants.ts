/**
 * Onboarding Flow Constants
 * Screen configurations and content for the onboarding experience
 */

import { OnboardingScreenId } from './types';

export const ONBOARDING_SCREENS: OnboardingScreenId[] = [
  'ONB_001',
  'ONB_002',
  'ONB_003',
  'ONB_004',
  'ONB_005',
  'ONB_006',
  'ONB_007',
  'ONB_008',
  'ONB_009',
  'ONB_010',
  'ONB_011',
  'ONB_012',
  'ONB_013',
  'ONB_014',
  'ONB_015',
  'ONB_016',
  'ONB_017',
  'ONB_018',
  'ONB_019',
  'ONB_020',
  'ONB_021',
];

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
  { id: 'eyes', label: 'Eyes', icon: '👁️' },
  { id: 'head', label: 'Head', icon: '🧠' },
  { id: 'neck', label: 'Neck', icon: '🦴' },
  { id: 'shoulders', label: 'Shoulders', icon: '💪' },
  { id: 'upper_back', label: 'Upper Back', icon: '🔺' },
  { id: 'lower_back', label: 'Lower Back', icon: '🔻' },
  { id: 'wrists', label: 'Wrists', icon: '🖐️' },
  { id: 'hands', label: 'Hands', icon: '👐' },
  { id: 'none', label: "I'm pain-free!", icon: '✨' },
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
    label: 'Smart',
    description: 'AI-adjusted based on my behavior',
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

export const TESTIMONIALS = [
  {
    quote: 'My neck pain disappeared after just one week',
    author: 'Sarah, Developer',
    rating: 5,
  },
  {
    quote: 'Finally found an app that respects my workflow',
    author: 'Mike, Designer',
    rating: 5,
  },
  {
    quote: 'The exercises are quick and actually work',
    author: 'Emma, Product Manager',
    rating: 5,
  },
] as const;

export const PREMIUM_FEATURES = [
  { feature: 'Basic Exercises', free: true, premium: true },
  { feature: 'Smart Breaks', free: '3/day', premium: 'Unlimited' },
  { feature: 'Exercise Library', free: '20', premium: '200+' },
  { feature: 'AI Coaching', free: false, premium: true },
  { feature: 'Progress Tracking', free: 'Basic', premium: 'Advanced' },
  { feature: 'Custom Programs', free: false, premium: true },
] as const;
