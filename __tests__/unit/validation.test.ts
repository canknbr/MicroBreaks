import {
  calculateDailyGoal,
  calculateDailyGoalFromBreakInterval,
  calculateWeeklyGoalFromBreakInterval,
  calculateWeeklyGoalFromDailyGoal,
} from '@/utils/validation';

describe('goal validation utilities', () => {
  describe('calculateDailyGoal', () => {
    it('derives daily goal from weekly goal using the app minimum', () => {
      expect(calculateDailyGoal(35)).toBe(5);
      expect(calculateDailyGoal(14)).toBe(3);
    });
  });

  describe('calculateDailyGoalFromBreakInterval', () => {
    it('normalizes a 25 minute interval to a realistic default daily goal', () => {
      expect(calculateDailyGoalFromBreakInterval(25)).toBe(5);
    });

    it('clamps aggressive intervals to a sustainable daily goal ceiling', () => {
      expect(calculateDailyGoalFromBreakInterval(15)).toBe(8);
    });

    it('respects the minimum daily goal for longer intervals', () => {
      expect(calculateDailyGoalFromBreakInterval(60)).toBe(3);
    });

    it('falls back to the default reminder interval for invalid values', () => {
      expect(calculateDailyGoalFromBreakInterval(0)).toBe(5);
      expect(calculateDailyGoalFromBreakInterval(Number.NaN)).toBe(5);
    });
  });

  describe('weekly goal helpers', () => {
    it('converts daily goals into the app weekly-goal model', () => {
      expect(calculateWeeklyGoalFromDailyGoal(5)).toBe(35);
      expect(calculateWeeklyGoalFromDailyGoal(2)).toBe(21);
    });

    it('derives weekly goals directly from the reminder interval', () => {
      expect(calculateWeeklyGoalFromBreakInterval(25)).toBe(35);
      expect(calculateWeeklyGoalFromBreakInterval(45)).toBe(21);
    });
  });
});
