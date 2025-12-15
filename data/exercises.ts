/**
 * Exercise Data Definitions
 * Complete exercise library with step-by-step instructions
 */

export type AnimationType =
  | 'breathe-in'
  | 'breathe-hold'
  | 'breathe-out'
  | 'eye-move-circle'
  | 'eye-move-horizontal'
  | 'eye-move-vertical'
  | 'eye-focus-near'
  | 'eye-focus-far'
  | 'eye-rest'
  | 'rotate-left'
  | 'rotate-right'
  | 'tilt-left'
  | 'tilt-right'
  | 'tilt-forward'
  | 'tilt-back'
  | 'stretch-up'
  | 'stretch-side'
  | 'stretch-forward'
  | 'hold'
  | 'rest'
  | 'walk'
  | 'active';

export type ExerciseCategory = 'quick' | 'stretch' | 'mindful' | 'active';

export interface ExerciseStep {
  id: string;
  instruction: string;
  voiceInstruction?: string; // Optional different text for voice
  duration: number; // Seconds
  animation: AnimationType;
  visualGuide: string; // Emoji
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  totalDuration: number; // Seconds
  color: string;
  icon: string;
  steps: ExerciseStep[];
}

// ============================================
// QUICK BREAKS (1-2 minutes)
// ============================================

export const eyeRestExercise: Exercise = {
  id: 'eye-rest',
  title: 'Eye Rest',
  description: '20-20-20 rule for eye strain',
  category: 'quick',
  totalDuration: 60,
  color: '#00E5FF',
  icon: '👁️',
  steps: [
    {
      id: 'eye-1',
      instruction: 'Look at something 20 feet away',
      voiceInstruction: 'Look at something far away, about 20 feet from you',
      duration: 20,
      animation: 'eye-focus-far',
      visualGuide: '🏔️',
    },
    {
      id: 'eye-2',
      instruction: 'Slowly blink 5 times',
      voiceInstruction: 'Now slowly blink 5 times to moisten your eyes',
      duration: 10,
      animation: 'eye-rest',
      visualGuide: '😌',
    },
    {
      id: 'eye-3',
      instruction: 'Move eyes in a circle',
      voiceInstruction: 'Gently move your eyes in a circle, clockwise',
      duration: 10,
      animation: 'eye-move-circle',
      visualGuide: '🔄',
    },
    {
      id: 'eye-4',
      instruction: 'Look left and right',
      voiceInstruction: 'Now look left, then right, slowly',
      duration: 10,
      animation: 'eye-move-horizontal',
      visualGuide: '👀',
    },
    {
      id: 'eye-5',
      instruction: 'Close your eyes and relax',
      voiceInstruction: 'Finally, close your eyes and relax for a moment',
      duration: 10,
      animation: 'eye-rest',
      visualGuide: '😴',
    },
  ],
};

export const deepBreathExercise: Exercise = {
  id: 'deep-breath',
  title: 'Deep Breath',
  description: 'Quick breathing exercise',
  category: 'quick',
  totalDuration: 60,
  color: '#4ECDC4',
  icon: '🌬️',
  steps: [
    {
      id: 'breath-1',
      instruction: 'Breathe in slowly',
      voiceInstruction: 'Breathe in slowly through your nose',
      duration: 4,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'breath-2',
      instruction: 'Hold your breath',
      voiceInstruction: 'Hold your breath',
      duration: 4,
      animation: 'breathe-hold',
      visualGuide: '⏸️',
    },
    {
      id: 'breath-3',
      instruction: 'Breathe out slowly',
      voiceInstruction: 'Breathe out slowly through your mouth',
      duration: 4,
      animation: 'breathe-out',
      visualGuide: '💨',
    },
    {
      id: 'breath-4',
      instruction: 'Breathe in slowly',
      voiceInstruction: 'Breathe in again',
      duration: 4,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'breath-5',
      instruction: 'Hold your breath',
      voiceInstruction: 'Hold',
      duration: 4,
      animation: 'breathe-hold',
      visualGuide: '⏸️',
    },
    {
      id: 'breath-6',
      instruction: 'Breathe out slowly',
      voiceInstruction: 'And breathe out',
      duration: 4,
      animation: 'breathe-out',
      visualGuide: '💨',
    },
    {
      id: 'breath-7',
      instruction: 'Breathe in slowly',
      voiceInstruction: 'One more time, breathe in',
      duration: 4,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'breath-8',
      instruction: 'Hold your breath',
      voiceInstruction: 'Hold',
      duration: 4,
      animation: 'breathe-hold',
      visualGuide: '⏸️',
    },
    {
      id: 'breath-9',
      instruction: 'Breathe out slowly',
      voiceInstruction: 'And release',
      duration: 4,
      animation: 'breathe-out',
      visualGuide: '💨',
    },
    {
      id: 'breath-10',
      instruction: 'Return to normal breathing',
      voiceInstruction: 'Well done. Return to normal breathing',
      duration: 24,
      animation: 'rest',
      visualGuide: '😌',
    },
  ],
};

export const neckRollExercise: Exercise = {
  id: 'neck-roll',
  title: 'Neck Roll',
  description: 'Release neck tension',
  category: 'quick',
  totalDuration: 120,
  color: '#06FFA5',
  icon: '🧘',
  steps: [
    {
      id: 'neck-1',
      instruction: 'Tilt head to the right',
      voiceInstruction: 'Gently tilt your head to the right, bringing your ear toward your shoulder',
      duration: 10,
      animation: 'tilt-right',
      visualGuide: '➡️',
    },
    {
      id: 'neck-2',
      instruction: 'Hold the stretch',
      voiceInstruction: 'Hold this position and breathe',
      duration: 10,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'neck-3',
      instruction: 'Tilt head to the left',
      voiceInstruction: 'Now tilt your head to the left',
      duration: 10,
      animation: 'tilt-left',
      visualGuide: '⬅️',
    },
    {
      id: 'neck-4',
      instruction: 'Hold the stretch',
      voiceInstruction: 'Hold and breathe',
      duration: 10,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'neck-5',
      instruction: 'Tilt chin toward chest',
      voiceInstruction: 'Drop your chin toward your chest',
      duration: 10,
      animation: 'tilt-forward',
      visualGuide: '⬇️',
    },
    {
      id: 'neck-6',
      instruction: 'Hold the stretch',
      voiceInstruction: 'Hold and feel the stretch in the back of your neck',
      duration: 10,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'neck-7',
      instruction: 'Rotate head clockwise',
      voiceInstruction: 'Now slowly rotate your head in a circle, clockwise',
      duration: 15,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'neck-8',
      instruction: 'Rotate head counter-clockwise',
      voiceInstruction: 'And now counter-clockwise',
      duration: 15,
      animation: 'rotate-left',
      visualGuide: '🔃',
    },
    {
      id: 'neck-9',
      instruction: 'Shrug shoulders up',
      voiceInstruction: 'Raise your shoulders up toward your ears',
      duration: 5,
      animation: 'stretch-up',
      visualGuide: '⬆️',
    },
    {
      id: 'neck-10',
      instruction: 'Release and relax',
      voiceInstruction: 'And release. Let your shoulders drop. Well done!',
      duration: 25,
      animation: 'rest',
      visualGuide: '😌',
    },
  ],
};

// ============================================
// STRETCHING (3-5 minutes)
// ============================================

export const upperBodyStretch: Exercise = {
  id: 'upper-body',
  title: 'Upper Body',
  description: 'Shoulders, arms, and back',
  category: 'stretch',
  totalDuration: 180,
  color: '#B47EFF',
  icon: '💪',
  steps: [
    {
      id: 'upper-1',
      instruction: 'Reach arms overhead',
      voiceInstruction: 'Reach both arms up overhead and stretch tall',
      duration: 15,
      animation: 'stretch-up',
      visualGuide: '🙆',
    },
    {
      id: 'upper-2',
      instruction: 'Hold the stretch',
      voiceInstruction: 'Hold and breathe deeply',
      duration: 10,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'upper-3',
      instruction: 'Cross right arm over chest',
      voiceInstruction: 'Bring your right arm across your chest and hold with left hand',
      duration: 15,
      animation: 'stretch-side',
      visualGuide: '➡️',
    },
    {
      id: 'upper-4',
      instruction: 'Hold the stretch',
      voiceInstruction: 'Hold and feel the stretch in your shoulder',
      duration: 15,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'upper-5',
      instruction: 'Cross left arm over chest',
      voiceInstruction: 'Now switch to the left arm across your chest',
      duration: 15,
      animation: 'stretch-side',
      visualGuide: '⬅️',
    },
    {
      id: 'upper-6',
      instruction: 'Hold the stretch',
      voiceInstruction: 'Hold and breathe',
      duration: 15,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'upper-7',
      instruction: 'Clasp hands behind back',
      voiceInstruction: 'Clasp your hands behind your back and lift slightly',
      duration: 15,
      animation: 'stretch-forward',
      visualGuide: '🙏',
    },
    {
      id: 'upper-8',
      instruction: 'Hold and open chest',
      voiceInstruction: 'Open your chest and squeeze shoulder blades together',
      duration: 15,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'upper-9',
      instruction: 'Roll shoulders backward',
      voiceInstruction: 'Roll your shoulders backward in circles',
      duration: 20,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'upper-10',
      instruction: 'Roll shoulders forward',
      voiceInstruction: 'Now roll them forward',
      duration: 20,
      animation: 'rotate-left',
      visualGuide: '🔃',
    },
    {
      id: 'upper-11',
      instruction: 'Relax and breathe',
      voiceInstruction: 'Excellent work! Relax your arms and take a deep breath',
      duration: 25,
      animation: 'rest',
      visualGuide: '😌',
    },
  ],
};

export const lowerBodyStretch: Exercise = {
  id: 'lower-body',
  title: 'Lower Body',
  description: 'Legs, hips, and ankles',
  category: 'stretch',
  totalDuration: 240,
  color: '#B47EFF',
  icon: '🦵',
  steps: [
    {
      id: 'lower-1',
      instruction: 'Stand and shift weight to right leg',
      voiceInstruction: 'Stand tall and shift your weight to your right leg',
      duration: 10,
      animation: 'hold',
      visualGuide: '🦶',
    },
    {
      id: 'lower-2',
      instruction: 'Lift left knee to chest',
      voiceInstruction: 'Lift your left knee up toward your chest',
      duration: 15,
      animation: 'stretch-up',
      visualGuide: '🦵',
    },
    {
      id: 'lower-3',
      instruction: 'Hold the stretch',
      voiceInstruction: 'Hold and balance',
      duration: 15,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'lower-4',
      instruction: 'Switch to right knee',
      voiceInstruction: 'Now lift your right knee to your chest',
      duration: 15,
      animation: 'stretch-up',
      visualGuide: '🦵',
    },
    {
      id: 'lower-5',
      instruction: 'Hold the stretch',
      voiceInstruction: 'Hold and breathe',
      duration: 15,
      animation: 'hold',
      visualGuide: '⏸️',
    },
    {
      id: 'lower-6',
      instruction: 'Rotate left ankle clockwise',
      voiceInstruction: 'Rotate your left ankle in circles',
      duration: 15,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'lower-7',
      instruction: 'Rotate left ankle counter-clockwise',
      voiceInstruction: 'Now the other direction',
      duration: 15,
      animation: 'rotate-left',
      visualGuide: '🔃',
    },
    {
      id: 'lower-8',
      instruction: 'Rotate right ankle clockwise',
      voiceInstruction: 'Switch to your right ankle, clockwise',
      duration: 15,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'lower-9',
      instruction: 'Rotate right ankle counter-clockwise',
      voiceInstruction: 'And counter-clockwise',
      duration: 15,
      animation: 'rotate-left',
      visualGuide: '🔃',
    },
    {
      id: 'lower-10',
      instruction: 'Calf raises - rise on toes',
      voiceInstruction: 'Rise up on your toes for calf raises',
      duration: 30,
      animation: 'stretch-up',
      visualGuide: '⬆️',
    },
    {
      id: 'lower-11',
      instruction: 'March in place',
      voiceInstruction: 'March in place to get the blood flowing',
      duration: 30,
      animation: 'walk',
      visualGuide: '🚶',
    },
    {
      id: 'lower-12',
      instruction: 'Relax and breathe',
      voiceInstruction: 'Great job! Relax and take a breath',
      duration: 50,
      animation: 'rest',
      visualGuide: '😌',
    },
  ],
};

export const fullBodyStretch: Exercise = {
  id: 'full-body',
  title: 'Full Body',
  description: 'Complete stretch routine',
  category: 'stretch',
  totalDuration: 300,
  color: '#B47EFF',
  icon: '🙆',
  steps: [
    {
      id: 'full-1',
      instruction: 'Deep breath to center',
      voiceInstruction: 'Take a deep breath to center yourself',
      duration: 10,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'full-2',
      instruction: 'Reach arms overhead',
      voiceInstruction: 'Reach both arms high overhead',
      duration: 15,
      animation: 'stretch-up',
      visualGuide: '🙆',
    },
    {
      id: 'full-3',
      instruction: 'Side stretch right',
      voiceInstruction: 'Lean to the right, stretching your left side',
      duration: 15,
      animation: 'stretch-side',
      visualGuide: '➡️',
    },
    {
      id: 'full-4',
      instruction: 'Side stretch left',
      voiceInstruction: 'Now lean to the left',
      duration: 15,
      animation: 'stretch-side',
      visualGuide: '⬅️',
    },
    {
      id: 'full-5',
      instruction: 'Forward fold',
      voiceInstruction: 'Fold forward, reaching toward your toes',
      duration: 20,
      animation: 'stretch-forward',
      visualGuide: '⬇️',
    },
    {
      id: 'full-6',
      instruction: 'Neck rolls',
      voiceInstruction: 'Gently roll your neck in a circle',
      duration: 20,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'full-7',
      instruction: 'Shoulder shrugs',
      voiceInstruction: 'Shrug your shoulders up and release',
      duration: 15,
      animation: 'stretch-up',
      visualGuide: '⬆️',
    },
    {
      id: 'full-8',
      instruction: 'Wrist circles',
      voiceInstruction: 'Rotate your wrists in circles',
      duration: 15,
      animation: 'rotate-right',
      visualGuide: '✋',
    },
    {
      id: 'full-9',
      instruction: 'Arm crossovers',
      voiceInstruction: 'Cross your arms in front of you alternating',
      duration: 20,
      animation: 'stretch-side',
      visualGuide: '💪',
    },
    {
      id: 'full-10',
      instruction: 'Hip circles',
      voiceInstruction: 'Make big circles with your hips',
      duration: 20,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'full-11',
      instruction: 'Knee lifts',
      voiceInstruction: 'Lift each knee up alternating',
      duration: 30,
      animation: 'stretch-up',
      visualGuide: '🦵',
    },
    {
      id: 'full-12',
      instruction: 'Ankle circles',
      voiceInstruction: 'Rotate each ankle in circles',
      duration: 20,
      animation: 'rotate-right',
      visualGuide: '🦶',
    },
    {
      id: 'full-13',
      instruction: 'Final deep breath',
      voiceInstruction: 'Take one final deep breath',
      duration: 10,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'full-14',
      instruction: 'Exhale and relax',
      voiceInstruction: 'Exhale fully. Excellent work!',
      duration: 75,
      animation: 'rest',
      visualGuide: '😌',
    },
  ],
};

// ============================================
// MINDFULNESS (2-5 minutes)
// ============================================

export const miniMeditation: Exercise = {
  id: 'meditation',
  title: 'Mini Meditation',
  description: 'Calm your mind',
  category: 'mindful',
  totalDuration: 180,
  color: '#00E5FF',
  icon: '🧘‍♀️',
  steps: [
    {
      id: 'med-1',
      instruction: 'Find a comfortable position',
      voiceInstruction: 'Find a comfortable seated position and close your eyes',
      duration: 10,
      animation: 'rest',
      visualGuide: '🧘‍♀️',
    },
    {
      id: 'med-2',
      instruction: 'Breathe naturally',
      voiceInstruction: 'Breathe naturally and notice your breath',
      duration: 20,
      animation: 'breathe-in',
      visualGuide: '🌬️',
    },
    {
      id: 'med-3',
      instruction: 'Let go of thoughts',
      voiceInstruction: 'If thoughts arise, gently let them go',
      duration: 30,
      animation: 'rest',
      visualGuide: '☁️',
    },
    {
      id: 'med-4',
      instruction: 'Focus on your breath',
      voiceInstruction: 'Bring your attention back to your breath',
      duration: 30,
      animation: 'breathe-in',
      visualGuide: '🎯',
    },
    {
      id: 'med-5',
      instruction: 'Feel your body relax',
      voiceInstruction: 'Notice any tension and let it melt away',
      duration: 30,
      animation: 'rest',
      visualGuide: '✨',
    },
    {
      id: 'med-6',
      instruction: 'Deep breath in',
      voiceInstruction: 'Take a deep breath in',
      duration: 5,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'med-7',
      instruction: 'Slowly exhale',
      voiceInstruction: 'And slowly exhale',
      duration: 5,
      animation: 'breathe-out',
      visualGuide: '💨',
    },
    {
      id: 'med-8',
      instruction: 'Gently open your eyes',
      voiceInstruction: 'When ready, gently open your eyes',
      duration: 50,
      animation: 'rest',
      visualGuide: '👁️',
    },
  ],
};

export const bodyScan: Exercise = {
  id: 'body-scan',
  title: 'Body Scan',
  description: 'Release physical tension',
  category: 'mindful',
  totalDuration: 240,
  color: '#00E5FF',
  icon: '✨',
  steps: [
    {
      id: 'scan-1',
      instruction: 'Close your eyes',
      voiceInstruction: 'Close your eyes and take a deep breath',
      duration: 10,
      animation: 'rest',
      visualGuide: '😌',
    },
    {
      id: 'scan-2',
      instruction: 'Notice your feet',
      voiceInstruction: 'Bring your attention to your feet. Notice any sensations',
      duration: 25,
      animation: 'rest',
      visualGuide: '🦶',
    },
    {
      id: 'scan-3',
      instruction: 'Move to your legs',
      voiceInstruction: 'Move your attention up to your legs. Relax any tension',
      duration: 25,
      animation: 'rest',
      visualGuide: '🦵',
    },
    {
      id: 'scan-4',
      instruction: 'Notice your hips and lower back',
      voiceInstruction: 'Focus on your hips and lower back. Let them soften',
      duration: 25,
      animation: 'rest',
      visualGuide: '🧘',
    },
    {
      id: 'scan-5',
      instruction: 'Feel your stomach and chest',
      voiceInstruction: 'Notice your stomach and chest rising and falling',
      duration: 25,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'scan-6',
      instruction: 'Relax your shoulders',
      voiceInstruction: 'Drop your shoulders away from your ears',
      duration: 25,
      animation: 'rest',
      visualGuide: '💆',
    },
    {
      id: 'scan-7',
      instruction: 'Release tension in arms and hands',
      voiceInstruction: 'Let your arms and hands feel heavy and relaxed',
      duration: 25,
      animation: 'rest',
      visualGuide: '✋',
    },
    {
      id: 'scan-8',
      instruction: 'Soften your face',
      voiceInstruction: 'Relax your jaw, eyes, and forehead',
      duration: 25,
      animation: 'rest',
      visualGuide: '😊',
    },
    {
      id: 'scan-9',
      instruction: 'Feel your whole body at ease',
      voiceInstruction: 'Notice your whole body feeling calm and relaxed',
      duration: 30,
      animation: 'rest',
      visualGuide: '🌟',
    },
    {
      id: 'scan-10',
      instruction: 'Slowly return',
      voiceInstruction: 'When ready, slowly open your eyes',
      duration: 25,
      animation: 'rest',
      visualGuide: '👁️',
    },
  ],
};

export const gratitudeExercise: Exercise = {
  id: 'gratitude',
  title: 'Gratitude',
  description: 'Positive reflection moment',
  category: 'mindful',
  totalDuration: 120,
  color: '#00E5FF',
  icon: '🙏',
  steps: [
    {
      id: 'grat-1',
      instruction: 'Take a deep breath',
      voiceInstruction: 'Take a deep breath and settle into the moment',
      duration: 10,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'grat-2',
      instruction: 'Think of one thing you appreciate',
      voiceInstruction: 'Think of one thing you appreciate right now',
      duration: 25,
      animation: 'rest',
      visualGuide: '💝',
    },
    {
      id: 'grat-3',
      instruction: 'Feel the gratitude',
      voiceInstruction: 'Let that feeling of gratitude fill your heart',
      duration: 25,
      animation: 'rest',
      visualGuide: '❤️',
    },
    {
      id: 'grat-4',
      instruction: 'Think of a person you are grateful for',
      voiceInstruction: 'Now think of someone you are grateful to have in your life',
      duration: 25,
      animation: 'rest',
      visualGuide: '👥',
    },
    {
      id: 'grat-5',
      instruction: 'Send them positive thoughts',
      voiceInstruction: 'Send them positive thoughts and wishes',
      duration: 20,
      animation: 'rest',
      visualGuide: '✨',
    },
    {
      id: 'grat-6',
      instruction: 'Take a final breath',
      voiceInstruction: 'Take a final deep breath, carrying this gratitude with you',
      duration: 15,
      animation: 'breathe-in',
      visualGuide: '🙏',
    },
  ],
};

// ============================================
// ACTIVE BREAKS (3-10 minutes)
// ============================================

export const quickWalk: Exercise = {
  id: 'walk',
  title: 'Quick Walk',
  description: 'Get moving and refresh',
  category: 'active',
  totalDuration: 300,
  color: '#FFD166',
  icon: '🚶',
  steps: [
    {
      id: 'walk-1',
      instruction: 'Stand up and stretch',
      voiceInstruction: 'Stand up from your desk and stretch your arms overhead',
      duration: 15,
      animation: 'stretch-up',
      visualGuide: '🙆',
    },
    {
      id: 'walk-2',
      instruction: 'Start walking',
      voiceInstruction: 'Start walking at a comfortable pace',
      duration: 60,
      animation: 'walk',
      visualGuide: '🚶',
    },
    {
      id: 'walk-3',
      instruction: 'Pick up the pace slightly',
      voiceInstruction: 'Increase your pace slightly',
      duration: 60,
      animation: 'walk',
      visualGuide: '🏃',
    },
    {
      id: 'walk-4',
      instruction: 'Continue at a brisk pace',
      voiceInstruction: 'Keep going, you are doing great!',
      duration: 60,
      animation: 'walk',
      visualGuide: '🚶‍♂️',
    },
    {
      id: 'walk-5',
      instruction: 'Slow down gradually',
      voiceInstruction: 'Start to slow down your pace',
      duration: 45,
      animation: 'walk',
      visualGuide: '🚶‍♀️',
    },
    {
      id: 'walk-6',
      instruction: 'Take a deep breath',
      voiceInstruction: 'Stop and take a deep refreshing breath',
      duration: 15,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'walk-7',
      instruction: 'Return to your workspace',
      voiceInstruction: 'Head back to your workspace feeling refreshed',
      duration: 45,
      animation: 'walk',
      visualGuide: '🎯',
    },
  ],
};

export const deskExercises: Exercise = {
  id: 'desk-exercises',
  title: 'Desk Exercises',
  description: 'Light exercises at desk',
  category: 'active',
  totalDuration: 300,
  color: '#FFD166',
  icon: '🏋️',
  steps: [
    {
      id: 'desk-1',
      instruction: 'Seated leg raises',
      voiceInstruction: 'Sit tall and extend one leg out, hold, then switch',
      duration: 30,
      animation: 'stretch-up',
      visualGuide: '🦵',
    },
    {
      id: 'desk-2',
      instruction: 'Desk push-ups',
      voiceInstruction: 'Place hands on desk, step back, and do push-ups',
      duration: 30,
      animation: 'active',
      visualGuide: '💪',
    },
    {
      id: 'desk-3',
      instruction: 'Seated torso twist',
      voiceInstruction: 'Twist your torso to the right, then left',
      duration: 30,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'desk-4',
      instruction: 'Chair squats',
      voiceInstruction: 'Stand and sit repeatedly without using hands',
      duration: 30,
      animation: 'stretch-up',
      visualGuide: '🪑',
    },
    {
      id: 'desk-5',
      instruction: 'Calf raises',
      voiceInstruction: 'Rise on your toes and lower back down',
      duration: 30,
      animation: 'stretch-up',
      visualGuide: '⬆️',
    },
    {
      id: 'desk-6',
      instruction: 'Arm circles',
      voiceInstruction: 'Extend arms and make circles forward then backward',
      duration: 30,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'desk-7',
      instruction: 'March in place',
      voiceInstruction: 'March in place lifting knees high',
      duration: 45,
      animation: 'walk',
      visualGuide: '🚶',
    },
    {
      id: 'desk-8',
      instruction: 'Cool down stretch',
      voiceInstruction: 'Reach arms overhead and take a deep breath',
      duration: 30,
      animation: 'stretch-up',
      visualGuide: '🙆',
    },
    {
      id: 'desk-9',
      instruction: 'Relax and breathe',
      voiceInstruction: 'Excellent workout! Take a moment to breathe',
      duration: 45,
      animation: 'rest',
      visualGuide: '😌',
    },
  ],
};

export const energizerExercise: Exercise = {
  id: 'energizer',
  title: 'Energizer',
  description: 'Boost your energy',
  category: 'active',
  totalDuration: 180,
  color: '#FFD166',
  icon: '⚡',
  steps: [
    {
      id: 'energy-1',
      instruction: 'Shake out your hands',
      voiceInstruction: 'Shake out your hands vigorously',
      duration: 15,
      animation: 'active',
      visualGuide: '✋',
    },
    {
      id: 'energy-2',
      instruction: 'Jumping jacks',
      voiceInstruction: 'Do some jumping jacks to get your heart pumping',
      duration: 30,
      animation: 'active',
      visualGuide: '⭐',
    },
    {
      id: 'energy-3',
      instruction: 'High knees',
      voiceInstruction: 'March with high knees, pump those arms!',
      duration: 30,
      animation: 'walk',
      visualGuide: '🏃',
    },
    {
      id: 'energy-4',
      instruction: 'Arm punches',
      voiceInstruction: 'Punch the air in front of you alternating arms',
      duration: 20,
      animation: 'active',
      visualGuide: '👊',
    },
    {
      id: 'energy-5',
      instruction: 'Torso twists',
      voiceInstruction: 'Twist your torso side to side with energy',
      duration: 20,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'energy-6',
      instruction: 'Deep power breaths',
      voiceInstruction: 'Take 5 powerful breaths, in through nose, out through mouth',
      duration: 25,
      animation: 'breathe-in',
      visualGuide: '💨',
    },
    {
      id: 'energy-7',
      instruction: 'Celebrate!',
      voiceInstruction: 'Amazing! You are now energized and ready to go!',
      duration: 40,
      animation: 'rest',
      visualGuide: '🎉',
    },
  ],
};

// ============================================
// FEATURED / SPECIAL
// ============================================

export const afternoonReset: Exercise = {
  id: 'afternoon-reset',
  title: 'Afternoon Reset',
  description: 'Perfect mid-day break combining stretching and breathing',
  category: 'mindful',
  totalDuration: 300,
  color: '#06FFA5',
  icon: '🌟',
  steps: [
    {
      id: 'reset-1',
      instruction: 'Deep centering breath',
      voiceInstruction: 'Take a deep breath to center yourself',
      duration: 10,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'reset-2',
      instruction: 'Neck stretches',
      voiceInstruction: 'Gently tilt your head side to side',
      duration: 30,
      animation: 'tilt-right',
      visualGuide: '🧘',
    },
    {
      id: 'reset-3',
      instruction: 'Shoulder rolls',
      voiceInstruction: 'Roll your shoulders backward slowly',
      duration: 20,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'reset-4',
      instruction: 'Arms overhead stretch',
      voiceInstruction: 'Reach your arms high overhead',
      duration: 15,
      animation: 'stretch-up',
      visualGuide: '🙆',
    },
    {
      id: 'reset-5',
      instruction: '4-7-8 Breathing: Inhale',
      voiceInstruction: 'Breathe in for 4 counts',
      duration: 4,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'reset-6',
      instruction: '4-7-8 Breathing: Hold',
      voiceInstruction: 'Hold for 7 counts',
      duration: 7,
      animation: 'breathe-hold',
      visualGuide: '⏸️',
    },
    {
      id: 'reset-7',
      instruction: '4-7-8 Breathing: Exhale',
      voiceInstruction: 'Exhale for 8 counts',
      duration: 8,
      animation: 'breathe-out',
      visualGuide: '💨',
    },
    {
      id: 'reset-8',
      instruction: 'Repeat breathing cycle',
      voiceInstruction: 'Lets do that again. Breathe in',
      duration: 4,
      animation: 'breathe-in',
      visualGuide: '🫁',
    },
    {
      id: 'reset-9',
      instruction: 'Hold',
      voiceInstruction: 'Hold',
      duration: 7,
      animation: 'breathe-hold',
      visualGuide: '⏸️',
    },
    {
      id: 'reset-10',
      instruction: 'Exhale slowly',
      voiceInstruction: 'And exhale slowly',
      duration: 8,
      animation: 'breathe-out',
      visualGuide: '💨',
    },
    {
      id: 'reset-11',
      instruction: 'Eye rest - look far',
      voiceInstruction: 'Rest your eyes by looking at something far away',
      duration: 20,
      animation: 'eye-focus-far',
      visualGuide: '👁️',
    },
    {
      id: 'reset-12',
      instruction: 'Gentle spine twist',
      voiceInstruction: 'Twist gently to each side',
      duration: 30,
      animation: 'rotate-right',
      visualGuide: '🔄',
    },
    {
      id: 'reset-13',
      instruction: 'Forward fold',
      voiceInstruction: 'Fold forward and let your head hang',
      duration: 20,
      animation: 'stretch-forward',
      visualGuide: '⬇️',
    },
    {
      id: 'reset-14',
      instruction: 'Rise up slowly',
      voiceInstruction: 'Slowly rise back up',
      duration: 10,
      animation: 'stretch-up',
      visualGuide: '⬆️',
    },
    {
      id: 'reset-15',
      instruction: 'Final energizing breath',
      voiceInstruction: 'Take one final energizing breath',
      duration: 10,
      animation: 'breathe-in',
      visualGuide: '✨',
    },
    {
      id: 'reset-16',
      instruction: 'You are reset!',
      voiceInstruction: 'Wonderful! You are refreshed and ready to continue your day',
      duration: 97,
      animation: 'rest',
      visualGuide: '🌟',
    },
  ],
};

// ============================================
// EXERCISE LIBRARY
// ============================================

export const ALL_EXERCISES: Exercise[] = [
  // Quick
  eyeRestExercise,
  deepBreathExercise,
  neckRollExercise,
  // Stretch
  upperBodyStretch,
  lowerBodyStretch,
  fullBodyStretch,
  // Mindful
  miniMeditation,
  bodyScan,
  gratitudeExercise,
  // Active
  quickWalk,
  deskExercises,
  energizerExercise,
  // Featured
  afternoonReset,
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return ALL_EXERCISES.find((ex) => ex.id === id);
};

export const getExercisesByCategory = (category: ExerciseCategory): Exercise[] => {
  return ALL_EXERCISES.filter((ex) => ex.category === category);
};
