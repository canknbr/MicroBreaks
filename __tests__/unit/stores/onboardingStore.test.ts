/**
 * Onboarding Store Unit Tests
 * 100% coverage with all edge cases
 */

import { act } from '@testing-library/react-native';
import { ACTIVE_ONBOARDING_TOTAL_STEPS } from '@/constants/onboarding';
import { onboardingStoreTestUtils, useOnboardingStore } from '@/store/onboardingStore';

describe('OnboardingStore', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useOnboardingStore.getState().resetOnboarding();
    });
  });

  describe('Initial State', () => {
    it('should have isComplete as false initially', () => {
      const state = useOnboardingStore.getState();
      expect(state.isComplete).toBe(false);
    });

    it('should have currentStep as 0 initially', () => {
      const state = useOnboardingStore.getState();
      expect(state.currentStep).toBe(0);
    });

    it('should have the active onboarding step count', () => {
      const state = useOnboardingStore.getState();
      expect(state.totalSteps).toBe(ACTIVE_ONBOARDING_TOTAL_STEPS);
    });

    it('should have correct initial data values', () => {
      const state = useOnboardingStore.getState();

      expect(state.data.workRole).toBeNull();
      expect(state.data.screenTime).toBeNull();
      expect(state.data.painAreas).toEqual([]);
      expect(state.data.painSeverity).toEqual({});
      expect(state.data.workPattern).toBeNull();
      expect(state.data.energyPattern).toBeNull();
      expect(state.data.breakStyle).toEqual([]);
      expect(state.data.breakInterval).toBe(25);
      expect(state.data.notificationsEnabled).toBe(true);
      expect(state.data.calendarIntegration).toBe(false);
    });
  });

  describe('setCurrentStep', () => {
    it('should set current step to a valid number', () => {
      act(() => {
        useOnboardingStore.getState().setCurrentStep(5);
      });

      expect(useOnboardingStore.getState().currentStep).toBe(5);
    });

    it('should set current step to 0', () => {
      act(() => {
        useOnboardingStore.getState().setCurrentStep(10);
        useOnboardingStore.getState().setCurrentStep(0);
      });

      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });

    it('should set current step to the active maximum', () => {
      act(() => {
        useOnboardingStore.getState().setCurrentStep(ACTIVE_ONBOARDING_TOTAL_STEPS);
      });

      expect(useOnboardingStore.getState().currentStep).toBe(ACTIVE_ONBOARDING_TOTAL_STEPS);
    });

    it('should handle setting same step twice', () => {
      act(() => {
        useOnboardingStore.getState().setCurrentStep(3);
        useOnboardingStore.getState().setCurrentStep(3);
      });

      expect(useOnboardingStore.getState().currentStep).toBe(3);
    });
  });

  describe('updateData', () => {
    it('should update workRole', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ workRole: 'developer' });
      });

      expect(useOnboardingStore.getState().data.workRole).toBe('developer');
    });

    it('should update screenTime with number', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ screenTime: 8 });
      });

      expect(useOnboardingStore.getState().data.screenTime).toBe(8);
    });

    it('should update screenTime with 0', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ screenTime: 0 });
      });

      expect(useOnboardingStore.getState().data.screenTime).toBe(0);
    });

    it('should update painAreas with array', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ painAreas: ['neck', 'back', 'eyes'] });
      });

      expect(useOnboardingStore.getState().data.painAreas).toEqual(['neck', 'back', 'eyes']);
    });

    it('should update painSeverity with a persisted severity map', () => {
      act(() => {
        useOnboardingStore.getState().updateData({
          painSeverity: { neck: 'severe', eyes: 'moderate' },
        });
      });

      expect(useOnboardingStore.getState().data.painSeverity).toEqual({
        neck: 'severe',
        eyes: 'moderate',
      });
    });

    it('should update painAreas with empty array', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ painAreas: ['neck'] });
        useOnboardingStore.getState().updateData({ painAreas: [] });
      });

      expect(useOnboardingStore.getState().data.painAreas).toEqual([]);
    });

    it('should update workPattern', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ workPattern: '9-to-5' });
      });

      expect(useOnboardingStore.getState().data.workPattern).toBe('9-to-5');
    });

    it('should update energyPattern', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ energyPattern: 'morning' });
      });

      expect(useOnboardingStore.getState().data.energyPattern).toBe('morning');
    });

    it('should update breakStyle with array', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ breakStyle: ['stretch', 'mindful'] });
      });

      expect(useOnboardingStore.getState().data.breakStyle).toEqual(['stretch', 'mindful']);
    });

    it('should normalize legacy breakStyle values to exercise categories', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ breakStyle: ['movement', 'breathing', 'mixed'] });
      });

      expect(useOnboardingStore.getState().data.breakStyle).toEqual(['active', 'stretch', 'mindful']);
    });

    it('should update breakInterval', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ breakInterval: 30 });
      });

      expect(useOnboardingStore.getState().data.breakInterval).toBe(30);
    });

    it('should update breakInterval with minimum value (1)', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ breakInterval: 1 });
      });

      expect(useOnboardingStore.getState().data.breakInterval).toBe(1);
    });

    it('should update notificationsEnabled to false', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ notificationsEnabled: false });
      });

      expect(useOnboardingStore.getState().data.notificationsEnabled).toBe(false);
    });

    it('should update notificationsEnabled to true', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ notificationsEnabled: false });
        useOnboardingStore.getState().updateData({ notificationsEnabled: true });
      });

      expect(useOnboardingStore.getState().data.notificationsEnabled).toBe(true);
    });

    it('should update calendarIntegration to true', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ calendarIntegration: true });
      });

      expect(useOnboardingStore.getState().data.calendarIntegration).toBe(true);
    });

    it('should update multiple fields at once', () => {
      act(() => {
        useOnboardingStore.getState().updateData({
          workRole: 'designer',
          screenTime: 6,
          painAreas: ['wrists'],
          painSeverity: { wrists: 'moderate' },
          breakInterval: 20,
        });
      });

      const data = useOnboardingStore.getState().data;
      expect(data.workRole).toBe('designer');
      expect(data.screenTime).toBe(6);
      expect(data.painAreas).toEqual(['wrists']);
      expect(data.painSeverity).toEqual({ wrists: 'moderate' });
      expect(data.breakInterval).toBe(20);
    });

    it('should preserve other fields when updating', () => {
      act(() => {
        useOnboardingStore.getState().updateData({
          workRole: 'developer',
          screenTime: 8,
        });
      });

      act(() => {
        useOnboardingStore.getState().updateData({ painAreas: ['neck'] });
      });

      const data = useOnboardingStore.getState().data;
      expect(data.workRole).toBe('developer');
      expect(data.screenTime).toBe(8);
      expect(data.painAreas).toEqual(['neck']);
    });

    it('should handle empty update object', () => {
      const initialData = useOnboardingStore.getState().data;

      act(() => {
        useOnboardingStore.getState().updateData({});
      });

      expect(useOnboardingStore.getState().data).toEqual(initialData);
    });
  });

  describe('completeOnboarding', () => {
    it('should set isComplete to true', () => {
      act(() => {
        useOnboardingStore.getState().completeOnboarding();
      });

      expect(useOnboardingStore.getState().isComplete).toBe(true);
    });

    it('should set currentStep to the active final onboarding step', () => {
      act(() => {
        useOnboardingStore.getState().setCurrentStep(5);
        useOnboardingStore.getState().completeOnboarding();
      });

      expect(useOnboardingStore.getState().currentStep).toBe(ACTIVE_ONBOARDING_TOTAL_STEPS);
    });

    it('should preserve data when completing', () => {
      act(() => {
        useOnboardingStore.getState().updateData({
          workRole: 'developer',
          screenTime: 8,
        });
        useOnboardingStore.getState().completeOnboarding();
      });

      const data = useOnboardingStore.getState().data;
      expect(data.workRole).toBe('developer');
      expect(data.screenTime).toBe(8);
    });

    it('should be idempotent (calling twice has same result)', () => {
      act(() => {
        useOnboardingStore.getState().completeOnboarding();
        useOnboardingStore.getState().completeOnboarding();
      });

      expect(useOnboardingStore.getState().isComplete).toBe(true);
      expect(useOnboardingStore.getState().currentStep).toBe(ACTIVE_ONBOARDING_TOTAL_STEPS);
    });
  });

  describe('skipOnboarding', () => {
    it('should set isComplete to true', () => {
      act(() => {
        useOnboardingStore.getState().skipOnboarding();
      });

      expect(useOnboardingStore.getState().isComplete).toBe(true);
    });

    it('should reset currentStep to 0', () => {
      act(() => {
        useOnboardingStore.getState().setCurrentStep(10);
        useOnboardingStore.getState().skipOnboarding();
      });

      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });

    it('should reset data to initial values', () => {
      act(() => {
        useOnboardingStore.getState().updateData({
          workRole: 'developer',
          screenTime: 8,
          painAreas: ['neck', 'back'],
        });
        useOnboardingStore.getState().skipOnboarding();
      });

      const data = useOnboardingStore.getState().data;
      expect(data.workRole).toBeNull();
      expect(data.screenTime).toBeNull();
      expect(data.painAreas).toEqual([]);
      expect(data.breakInterval).toBe(25);
      expect(data.notificationsEnabled).toBe(true);
      expect(data.calendarIntegration).toBe(false);
    });

    it('should differ from completeOnboarding in currentStep', () => {
      act(() => {
        useOnboardingStore.getState().completeOnboarding();
      });
      const completedStep = useOnboardingStore.getState().currentStep;

      act(() => {
        useOnboardingStore.getState().resetOnboarding();
        useOnboardingStore.getState().skipOnboarding();
      });
      const skippedStep = useOnboardingStore.getState().currentStep;

      expect(completedStep).toBe(ACTIVE_ONBOARDING_TOTAL_STEPS);
      expect(skippedStep).toBe(0);
    });
  });

  describe('resetOnboarding', () => {
    it('should set isComplete to false', () => {
      act(() => {
        useOnboardingStore.getState().completeOnboarding();
        useOnboardingStore.getState().resetOnboarding();
      });

      expect(useOnboardingStore.getState().isComplete).toBe(false);
    });

    it('should reset currentStep to 0', () => {
      act(() => {
        useOnboardingStore.getState().setCurrentStep(15);
        useOnboardingStore.getState().resetOnboarding();
      });

      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });

    it('should reset all data fields to initial values', () => {
      act(() => {
        useOnboardingStore.getState().updateData({
          workRole: 'developer',
          screenTime: 10,
          painAreas: ['neck', 'back', 'eyes', 'wrists'],
          workPattern: 'remote',
          energyPattern: 'evening',
          breakStyle: ['active', 'mindful'],
          breakInterval: 15,
          notificationsEnabled: false,
          calendarIntegration: true,
        });
        useOnboardingStore.getState().resetOnboarding();
      });

      const data = useOnboardingStore.getState().data;
      expect(data.workRole).toBeNull();
      expect(data.screenTime).toBeNull();
      expect(data.painAreas).toEqual([]);
      expect(data.workPattern).toBeNull();
      expect(data.energyPattern).toBeNull();
      expect(data.breakStyle).toEqual([]);
      expect(data.breakInterval).toBe(25);
      expect(data.notificationsEnabled).toBe(true);
      expect(data.calendarIntegration).toBe(false);
    });

    it('should work after skipOnboarding', () => {
      act(() => {
        useOnboardingStore.getState().skipOnboarding();
        useOnboardingStore.getState().resetOnboarding();
      });

      expect(useOnboardingStore.getState().isComplete).toBe(false);
      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });

    it('should work after completeOnboarding', () => {
      act(() => {
        useOnboardingStore.getState().completeOnboarding();
        useOnboardingStore.getState().resetOnboarding();
      });

      expect(useOnboardingStore.getState().isComplete).toBe(false);
      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });
  });

  describe('Persistence Safety', () => {
    it('should sanitize malformed persisted onboarding state', () => {
      const snapshot = onboardingStoreTestUtils.sanitizePersistedOnboardingState({
        isComplete: 'yes',
        currentStep: -4,
        totalSteps: 999,
        data: {
          workRole: 42,
          screenTime: 'all day',
          painAreas: ['neck', null, 7],
          painSeverity: { neck: 'severe', eyes: 'broken' },
          workPattern: ['deep-work'],
          energyPattern: 3,
          breakStyle: ['guided', false],
          breakInterval: 0,
          notificationsEnabled: 'sometimes',
          calendarIntegration: 'soon',
        },
      });

      expect(snapshot.isComplete).toBe(false);
      expect(snapshot.currentStep).toBe(0);
      expect(snapshot.totalSteps).toBe(ACTIVE_ONBOARDING_TOTAL_STEPS);
      expect(snapshot.data.workRole).toBeNull();
      expect(snapshot.data.screenTime).toBeNull();
      expect(snapshot.data.painAreas).toEqual(['neck']);
      expect(snapshot.data.painSeverity).toEqual({ neck: 'severe' });
      expect(snapshot.data.workPattern).toBeNull();
      expect(snapshot.data.energyPattern).toBeNull();
      expect(snapshot.data.breakStyle).toEqual([]);
      expect(snapshot.data.breakInterval).toBe(25);
      expect(snapshot.data.notificationsEnabled).toBe(true);
      expect(snapshot.data.calendarIntegration).toBe(false);
    });

    it('should migrate legacy persisted breakStyle values', () => {
      const snapshot = onboardingStoreTestUtils.sanitizePersistedOnboardingState({
        data: {
          breakStyle: ['movement', 'eye_micro', 'mixed'],
        },
      });

      expect(snapshot.data.breakStyle).toEqual(['active', 'stretch', 'quick']);
    });
  });

  describe('Full Flow Scenarios', () => {
    it('should handle complete onboarding flow', () => {
      // Step 1: Set work role
      act(() => {
        useOnboardingStore.getState().setCurrentStep(1);
        useOnboardingStore.getState().updateData({ workRole: 'developer' });
      });

      // Step 2: Set screen time
      act(() => {
        useOnboardingStore.getState().setCurrentStep(2);
        useOnboardingStore.getState().updateData({ screenTime: 8 });
      });

      // Step 3: Set pain areas
      act(() => {
        useOnboardingStore.getState().setCurrentStep(3);
        useOnboardingStore.getState().updateData({ painAreas: ['neck', 'eyes'] });
      });

      // Complete
      act(() => {
        useOnboardingStore.getState().completeOnboarding();
      });

      const state = useOnboardingStore.getState();
      expect(state.isComplete).toBe(true);
      expect(state.currentStep).toBe(ACTIVE_ONBOARDING_TOTAL_STEPS);
      expect(state.data.workRole).toBe('developer');
      expect(state.data.screenTime).toBe(8);
      expect(state.data.painAreas).toEqual(['neck', 'eyes']);
    });

    it('should handle user going back and changing values', () => {
      act(() => {
        useOnboardingStore.getState().setCurrentStep(5);
        useOnboardingStore.getState().updateData({ workRole: 'designer' });
      });

      // User goes back
      act(() => {
        useOnboardingStore.getState().setCurrentStep(3);
      });

      // User changes value
      act(() => {
        useOnboardingStore.getState().updateData({ workRole: 'developer' });
      });

      // User continues
      act(() => {
        useOnboardingStore.getState().setCurrentStep(5);
      });

      expect(useOnboardingStore.getState().data.workRole).toBe('developer');
      expect(useOnboardingStore.getState().currentStep).toBe(5);
    });

    it('should handle restart after skip', () => {
      // Skip first time
      act(() => {
        useOnboardingStore.getState().skipOnboarding();
      });

      // User wants to redo onboarding
      act(() => {
        useOnboardingStore.getState().resetOnboarding();
      });

      // Go through onboarding properly
      act(() => {
        useOnboardingStore.getState().setCurrentStep(1);
        useOnboardingStore.getState().updateData({ workRole: 'student' });
        useOnboardingStore.getState().setCurrentStep(2);
        useOnboardingStore.getState().updateData({ screenTime: 4 });
        useOnboardingStore.getState().completeOnboarding();
      });

      const state = useOnboardingStore.getState();
      expect(state.isComplete).toBe(true);
      expect(state.data.workRole).toBe('student');
      expect(state.data.screenTime).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null updates gracefully', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ workRole: null });
      });

      expect(useOnboardingStore.getState().data.workRole).toBeNull();
    });

    it('should handle very large screen time value', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ screenTime: 24 });
      });

      expect(useOnboardingStore.getState().data.screenTime).toBe(24);
    });

    it('should handle very large break interval value', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ breakInterval: 180 });
      });

      expect(useOnboardingStore.getState().data.breakInterval).toBe(180);
    });

    it('should handle large array of pain areas', () => {
      const manyPainAreas = ['neck', 'back', 'eyes', 'wrists', 'shoulders', 'legs', 'head'];

      act(() => {
        useOnboardingStore.getState().updateData({ painAreas: manyPainAreas });
      });

      expect(useOnboardingStore.getState().data.painAreas).toEqual(manyPainAreas);
    });

    it('should handle special characters in workRole', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ workRole: "Developer & Designer (Remote)" });
      });

      expect(useOnboardingStore.getState().data.workRole).toBe("Developer & Designer (Remote)");
    });

    it('should handle empty strings', () => {
      act(() => {
        useOnboardingStore.getState().updateData({ workRole: '' });
      });

      expect(useOnboardingStore.getState().data.workRole).toBe('');
    });
  });
});
