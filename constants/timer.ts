/**
 * Timer / Pomodoro Constants
 * Presets, types, and configuration for the focus timer system
 */

// Timer phases
export type TimerPhase = 'work' | 'break' | 'longBreak';

// Preset definition
export interface TimerPreset {
  id: string;
  name: string;
  nameKey: string; // i18n key
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  icon: string;
  color: string;
}

// Built-in presets
export const TIMER_PRESETS: TimerPreset[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    nameKey: 'timer.presets.pomodoro',
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4,
    icon: '🍅',
    color: '#FF6B6B',
  },
  {
    id: 'deep-work',
    name: 'Deep Work',
    nameKey: 'timer.presets.deepWork',
    workMinutes: 50,
    breakMinutes: 10,
    longBreakMinutes: 20,
    sessionsUntilLongBreak: 3,
    icon: '🧠',
    color: '#B47EFF',
  },
  {
    id: 'micro-session',
    name: 'Micro Session',
    nameKey: 'timer.presets.microSession',
    workMinutes: 15,
    breakMinutes: 2,
    longBreakMinutes: 5,
    sessionsUntilLongBreak: 6,
    icon: '⚡',
    color: '#FFD166',
  },
  {
    id: 'custom',
    name: 'Custom',
    nameKey: 'timer.presets.custom',
    workMinutes: 25,
    breakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4,
    icon: '⚙️',
    color: '#06FFA5',
  },
] as const;

// Defaults
export const DEFAULT_PRESET_ID = 'pomodoro';

// Timer tick interval
export const TIMER_TICK_MS = 1000;

// Phase colors for UI
export const PHASE_COLORS: Record<TimerPhase, string> = {
  work: '#FF6B6B',
  break: '#06FFA5',
  longBreak: '#00E5FF',
};

// Phase icons for UI
export const PHASE_ICONS: Record<TimerPhase, string> = {
  work: '💻',
  break: '☕',
  longBreak: '🌿',
};

// Notification IDs
export const TIMER_NOTIFICATION_ID = 'pomodoro-timer-end';
export const TIMER_NOTIFICATION_CHANNEL = 'timer-alerts';
