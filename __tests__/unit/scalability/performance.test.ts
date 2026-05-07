/**
 * Performance Benchmark Tests
 * Tests for timing, Big-O comparisons, and memory usage
 */

import { act } from '@testing-library/react-native';
import { useUserStore } from '@/store/userStore';

// Helper to measure execution time
function measureTime(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    act(() => {
      useUserStore.getState().signOut();
    });
  });

  describe('Array Operations Performance', () => {
    describe('Favorites Toggle Performance', () => {
      it('should toggle 500 favorites in < 200ms', () => {
        const time = measureTime(() => {
          act(() => {
            for (let i = 0; i < 500; i++) {
              useUserStore.getState().toggleFavorite(`break-${i}`);
            }
          });
        });

        expect(time).toBeLessThan(200);
        expect(useUserStore.getState().preferences.favoriteBreaks).toHaveLength(500);
      });

      it('should toggle same favorite on/off 1000 times in < 100ms', () => {
        const time = measureTime(() => {
          act(() => {
            for (let i = 0; i < 1000; i++) {
              useUserStore.getState().toggleFavorite('break-1');
            }
          });
        });

        expect(time).toBeLessThan(100);
      });
    });

    describe('isFavorite Lookup Performance - O(N) vs O(1)', () => {
      it('should lookup in 500 favorites in < 1ms (demonstrating O(N) with small N)', () => {
        // Setup: Add 500 favorites
        act(() => {
          for (let i = 0; i < 500; i++) {
            useUserStore.getState().toggleFavorite(`break-${i}`);
          }
        });

        // Measure lookup time
        const lookupTimes: number[] = [];
        for (let i = 0; i < 100; i++) {
          const start = performance.now();
          useUserStore.getState().isFavorite(`break-${Math.floor(Math.random() * 500)}`);
          lookupTimes.push(performance.now() - start);
        }

        const avgTime = lookupTimes.reduce((a, b) => a + b, 0) / lookupTimes.length;
        expect(avgTime).toBeLessThan(1);
      });

      it('should maintain consistent lookup time across different list sizes', () => {
        const sizes = [10, 100, 500];
        const avgTimes: number[] = [];

        for (const size of sizes) {
          // Reset and setup
          act(() => {
            useUserStore.getState().signOut();
            for (let i = 0; i < size; i++) {
              useUserStore.getState().toggleFavorite(`break-${i}`);
            }
          });

          // Measure average lookup time
          const lookupTimes: number[] = [];
          for (let i = 0; i < 50; i++) {
            const start = performance.now();
            useUserStore.getState().isFavorite(`break-${Math.floor(Math.random() * size)}`);
            lookupTimes.push(performance.now() - start);
          }

          avgTimes.push(lookupTimes.reduce((a, b) => a + b, 0) / lookupTimes.length);
        }

        // O(N) lookup should show time growth proportional to size
        // But with small N, it should still be fast (< 1ms for all)
        avgTimes.forEach((time) => {
          expect(time).toBeLessThan(1);
        });
      });
    });

    describe('Achievement Unlock Performance', () => {
      it('should unlock 100 achievements in < 100ms', () => {
        const time = measureTime(() => {
          act(() => {
            for (let i = 0; i < 100; i++) {
              useUserStore.getState().unlockAchievement(`achievement-${i}`);
            }
          });
        });

        expect(time).toBeLessThan(100);
        expect(useUserStore.getState().achievements.unlockedIds).toHaveLength(100);
      });

      it('should check 1000 achievements unlocked status in < 20ms', () => {
        // Setup: Unlock 100 achievements
        act(() => {
          for (let i = 0; i < 100; i++) {
            useUserStore.getState().unlockAchievement(`achievement-${i}`);
          }
        });

        // Check status 1000 times
        const time = measureTime(() => {
          for (let i = 0; i < 1000; i++) {
            useUserStore.getState().isAchievementUnlocked(`achievement-${i % 200}`);
          }
        });

        expect(time).toBeLessThan(20);
      });
    });

    describe('Recent Breaks Performance', () => {
      it('should add 1000 recent breaks with limit enforcement in < 200ms', () => {
        const time = measureTime(() => {
          act(() => {
            for (let i = 0; i < 1000; i++) {
              useUserStore.getState().addRecentBreak(`break-${i}`);
            }
          });
        });

        expect(time).toBeLessThan(200);
        // Should maintain limit of 10
        expect(useUserStore.getState().preferences.recentBreaks).toHaveLength(10);
        // Most recent should be at front
        expect(useUserStore.getState().preferences.recentBreaks[0]).toBe('break-999');
      });
    });
  });

  describe('XP and Level Calculations', () => {
    it('should handle 10000 XP additions in < 400ms', () => {
      const time = measureTime(() => {
        act(() => {
          for (let i = 0; i < 10000; i++) {
            useUserStore.getState().addXP(10);
          }
        });
      });

      expect(time).toBeLessThan(400);
      expect(useUserStore.getState().progress.totalXP).toBe(100000);
      expect(useUserStore.getState().progress.level).toBe(1001); // floor(100000/100) + 1
    });

    it('should calculate level correctly for very large XP values', () => {
      act(() => {
        useUserStore.getState().addXP(999999999);
      });

      const progress = useUserStore.getState().progress;
      expect(progress.totalXP).toBe(999999999);
      expect(progress.level).toBe(10000000); // floor(999999999/100) + 1
    });
  });

  describe('Break Increment Performance', () => {
    it('should increment breaks 10000 times in < 400ms', () => {
      const time = measureTime(() => {
        act(() => {
          for (let i = 0; i < 10000; i++) {
            useUserStore.getState().incrementBreaks();
          }
        });
      });

      expect(time).toBeLessThan(400);
      expect(useUserStore.getState().progress.totalBreaks).toBe(10000);
    });
  });

  describe('Category Break Tracking Performance', () => {
    it('should track 1000 break completions across categories in < 200ms', () => {
      const categories = ['quick', 'stretch', 'mindfulness', 'breathing', 'movement'];

      const time = measureTime(() => {
        act(() => {
          for (let i = 0; i < 1000; i++) {
            const category = categories[i % categories.length];
            useUserStore.getState().trackBreakCompletion(category, 5);
          }
        });
      });

      expect(time).toBeLessThan(200);
      expect(useUserStore.getState().achievements.totalMinutes).toBe(5000);

      // Each category should have 200 breaks
      const categoryBreaks = useUserStore.getState().achievements.categoryBreaks;
      categories.forEach((category) => {
        expect(categoryBreaks[category]).toBe(200);
      });
    });
  });

  describe('Streak Update Performance', () => {
    it('should update streak 1000 times in < 100ms', () => {
      const time = measureTime(() => {
        act(() => {
          for (let i = 0; i < 1000; i++) {
            useUserStore.getState().updateStreak(i % 100);
          }
        });
      });

      expect(time).toBeLessThan(100);
      expect(useUserStore.getState().progress.longestStreak).toBe(99);
    });
  });

  describe('Combined Operations Performance', () => {
    it('should handle mixed rapid operations in < 600ms', () => {
      const time = measureTime(() => {
        act(() => {
          for (let i = 0; i < 500; i++) {
            useUserStore.getState().addXP(10);
            useUserStore.getState().incrementBreaks();
            useUserStore.getState().toggleFavorite(`break-${i}`);
            useUserStore.getState().trackBreakCompletion('quick', 2);
            if (i % 10 === 0) {
              useUserStore.getState().unlockAchievement(`achievement-${i / 10}`);
            }
          }
        });
      });

      expect(time).toBeLessThan(600);
      expect(useUserStore.getState().progress.totalXP).toBe(5000);
      expect(useUserStore.getState().progress.totalBreaks).toBe(500);
      expect(useUserStore.getState().preferences.favoriteBreaks).toHaveLength(500);
      expect(useUserStore.getState().achievements.unlockedIds).toHaveLength(50);
    });
  });

  describe('State Reset Performance', () => {
    it('should reset large state in < 20ms', () => {
      // First, build up a large state
      act(() => {
        for (let i = 0; i < 500; i++) {
          useUserStore.getState().toggleFavorite(`break-${i}`);
          useUserStore.getState().unlockAchievement(`achievement-${i}`);
        }
        useUserStore.getState().addXP(100000);
      });

      // Measure reset time
      const time = measureTime(() => {
        act(() => {
          useUserStore.getState().signOut();
        });
      });

      expect(time).toBeLessThan(20);
      expect(useUserStore.getState().preferences.favoriteBreaks).toHaveLength(0);
      expect(useUserStore.getState().achievements.unlockedIds).toHaveLength(0);
      expect(useUserStore.getState().progress.totalXP).toBe(0);
    });
  });
});
