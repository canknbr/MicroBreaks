import type { Exercise } from '@/data/exercises';
import { boxBreathing, eyeFigure8, eyeRestExercise, spineTwistExercise } from '@/data/exercises';
import { generatePersonalizedPlan, getSuggestedBreak } from '@/services/recommendations/engine';
import { getMatchedPainAreas, scoreExercise } from '@/services/recommendations/scoring';

describe('recommendation severity weighting', () => {
  it('scores a targeted exercise higher when the matching pain area is more severe', () => {
    const mildScore = scoreExercise(eyeRestExercise, {
      painAreas: ['eyes'],
      painSeverity: { eyes: 'mild' },
      breakStyle: [],
      recentBreakIds: [],
      timeOfDay: 'afternoon',
      todayBreakCount: 3,
    });

    const severeScore = scoreExercise(eyeRestExercise, {
      painAreas: ['eyes'],
      painSeverity: { eyes: 'severe' },
      breakStyle: [],
      recentBreakIds: [],
      timeOfDay: 'afternoon',
      todayBreakCount: 3,
    });

    expect(severeScore).toBeGreaterThan(mildScore);
  });

  it('treats persisted severity as additional personalization signal in the plan', () => {
    const basePlan = generatePersonalizedPlan({
      painAreas: ['eyes'],
      breakStyle: ['quick'],
      breakInterval: 25,
      screenTime: 8,
    });

    const severityPlan = generatePersonalizedPlan({
      painAreas: ['eyes'],
      painSeverity: { eyes: 'severe' },
      breakStyle: ['quick'],
      breakInterval: 25,
      screenTime: 8,
    });

    expect(severityPlan.matchScore).toBeGreaterThan(basePlan.matchScore);
  });

  it('uses real onboarding pain-area ids like lower_back when scoring the catalog', () => {
    const neutralScore = scoreExercise(spineTwistExercise, {
      painAreas: [],
      painSeverity: {},
      breakStyle: [],
      recentBreakIds: [],
      timeOfDay: 'afternoon',
      todayBreakCount: 3,
    });

    const targetedScore = scoreExercise(spineTwistExercise, {
      painAreas: ['lower_back'],
      painSeverity: { lower_back: 'moderate' },
      breakStyle: [],
      recentBreakIds: [],
      timeOfDay: 'afternoon',
      todayBreakCount: 3,
    });

    expect(targetedScore).toBeGreaterThan(neutralScore);
  });

  it('normalizes legacy onboarding break-style values when scoring recommendations', () => {
    const mindfulScore = scoreExercise(boxBreathing, {
      painAreas: [],
      painSeverity: {},
      breakStyle: ['breathing'],
      recentBreakIds: [],
      timeOfDay: 'afternoon',
      todayBreakCount: 0,
    });

    const quickScore = scoreExercise(eyeRestExercise, {
      painAreas: [],
      painSeverity: {},
      breakStyle: ['breathing'],
      recentBreakIds: [],
      timeOfDay: 'afternoon',
      todayBreakCount: 0,
    });

    expect(mindfulScore).toBeGreaterThan(quickScore);
  });

  it('does not describe a pain-free user as needing \"none\" relief', () => {
    const plan = generatePersonalizedPlan({
      painAreas: ['none'],
      breakStyle: ['movement'],
      breakInterval: 25,
      screenTime: 8,
    });

    expect(plan.primaryConcern).toBe('General wellness');
    expect(plan.recommendedFocus).toContain('Active movement breaks');
  });

  it('matches pain areas from exercise metadata signals instead of relying on hardcoded ids', () => {
    const customEyeExercise: Exercise = {
      id: 'custom-vision-reset',
      title: 'Vision Reset',
      description: 'Relieve digital fatigue with a far-focus reset',
      category: 'quick',
      totalDuration: 45,
      color: '#000000',
      icon: '👀',
      steps: [
        {
          id: 'vision-1',
          instruction: 'Shift your gaze to a point across the room',
          duration: 20,
          animation: 'eye-focus-far',
          visualGuide: '🏔️',
        },
      ],
    };

    expect(getMatchedPainAreas(customEyeExercise, ['eyes', 'neck'])).toEqual(['eyes']);
  });

  it('uses step animations to recognize strain-specific exercises across the catalog', () => {
    expect(getMatchedPainAreas(spineTwistExercise, ['lower_back', 'eyes'])).toContain('lower_back');
    expect(getMatchedPainAreas(boxBreathing, ['head', 'wrists'])).toContain('head');
  });

  it('boosts exercises that have produced strong relief before', () => {
    const baseScore = scoreExercise(eyeRestExercise, {
      painAreas: ['eyes'],
      painSeverity: { eyes: 'mild' },
      breakStyle: [],
      recentBreakIds: [],
      timeOfDay: 'evening',
      todayBreakCount: 3,
      historicalOutcomes: [],
    });

    const reliefWeightedScore = scoreExercise(eyeRestExercise, {
      painAreas: ['eyes'],
      painSeverity: { eyes: 'mild' },
      breakStyle: [],
      recentBreakIds: [],
      timeOfDay: 'evening',
      todayBreakCount: 3,
      historicalOutcomes: [
        {
          breakId: 'eye-rest',
          category: 'quick',
          rating: 'good',
          reliefScore: 'much_better',
        },
      ],
    });

    expect(reliefWeightedScore).toBeGreaterThan(baseScore);
  });

  it('steers away from a low-relief exercise when a better alternative exists', () => {
    const suggestion = getSuggestedBreak(
      ['eyes'],
      { eyes: 'moderate' },
      ['quick'],
      [],
      0,
      [
        {
          breakId: 'eye-rest',
          category: 'quick',
          rating: 'bad',
          reliefScore: 'worse',
        },
      ]
    );

    expect(suggestion).not.toBeNull();
    expect(suggestion?.exercise.id).not.toBe('eye-rest');
    expect(getMatchedPainAreas(suggestion?.exercise ?? eyeFigure8, ['eyes'])).toContain('eyes');
  });
});
