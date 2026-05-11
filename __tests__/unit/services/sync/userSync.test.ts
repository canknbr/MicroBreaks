import AsyncStorage from '@react-native-async-storage/async-storage';
import { pullUserProfile } from '@/services/sync/userSync';
import { useUserStore } from '@/store/userStore';
import { STORAGE_KEYS } from '@/services/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/services/firebase/firestore', () => ({
  getUserDoc: jest.fn(() => ({
    set: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve({ exists: false })),
  })),
}));

describe('userSync', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
    useUserStore.getState().signOut();
  });

  it('should sync merged remote progress into stored user stats', async () => {
    const prefetchedDoc = {
      exists: true,
      data: () => ({
        progress: {
          level: 5,
          totalXP: 420,
          totalBreaks: 32,
          currentStreak: 4,
          longestStreak: 6,
          weeklyGoal: 49,
          dailyGoal: 7,
        },
      }),
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_STATS,
      JSON.stringify({
        totalBreaks: 3,
        totalMinutes: 18,
        totalXP: 25,
        level: 1,
        weeklyGoal: 35,
        weeklyProgress: 2,
      })
    );

    await pullUserProfile('user-1', prefetchedDoc);

    expect(useUserStore.getState().progress).toEqual({
      level: 5,
      totalXP: 420,
      totalBreaks: 32,
      currentStreak: 4,
      longestStreak: 6,
      weeklyGoal: 49,
      dailyGoal: 7,
    });

    const storedStats = JSON.parse((await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS)) ?? '{}');
    expect(storedStats).toEqual({
      totalBreaks: 32,
      totalMinutes: 18,
      totalXP: 420,
      level: 5,
      weeklyGoal: 49,
      weeklyProgress: 2,
    });
  });
});
