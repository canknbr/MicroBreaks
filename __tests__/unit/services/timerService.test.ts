/**
 * Timer Service Unit Tests
 * Tests for the timer service lifecycle management
 */

import { act } from '@testing-library/react-native';
import { useTimerStore } from '@/store/timerStore';
import {
  startTicking,
  stopTicking,
  initializeTimerService,
  shutdownTimerService,
} from '@/services/timerService';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('test-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

describe('TimerService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    act(() => {
      useTimerStore.getState().reset();
    });
    stopTicking();
    shutdownTimerService();
  });

  afterEach(() => {
    stopTicking();
    shutdownTimerService();
    jest.useRealTimers();
  });

  describe('startTicking', () => {
    it('should tick the store every second', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
      });

      const initialRemaining = useTimerStore.getState().session.remainingSeconds;

      startTicking();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      const newRemaining = useTimerStore.getState().session.remainingSeconds;
      expect(newRemaining).toBe(initialRemaining - 3);
    });

    it('should stop previous interval when called again', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
      });

      startTicking();
      startTicking(); // Should not create double intervals

      const initialRemaining = useTimerStore.getState().session.remainingSeconds;

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should only decrement by 1, not 2
      expect(useTimerStore.getState().session.remainingSeconds).toBe(initialRemaining - 1);
    });
  });

  describe('stopTicking', () => {
    it('should stop the interval', () => {
      act(() => {
        useTimerStore.getState().startWorkSession();
      });

      startTicking();

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const afterTick = useTimerStore.getState().session.remainingSeconds;

      stopTicking();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not have changed after stopping
      expect(useTimerStore.getState().session.remainingSeconds).toBe(afterTick);
    });
  });

  describe('initializeTimerService', () => {
    it('should recover active session on init', () => {
      const now = Date.now();
      act(() => {
        useTimerStore.setState({
          session: {
            isActive: true,
            isPaused: false,
            phase: 'work',
            remainingSeconds: 25 * 60,
            phaseDurationSeconds: 25 * 60,
            currentSession: 1,
            phaseStartedAt: now - 5000,
            pausedAt: null,
          },
        });
      });

      initializeTimerService();

      // Should have recovered and updated remaining
      const { session } = useTimerStore.getState();
      expect(session.remainingSeconds).toBeLessThan(25 * 60);
    });

    it('should not start ticking for inactive sessions', () => {
      // Default state: inactive
      initializeTimerService();

      const remaining = useTimerStore.getState().session.remainingSeconds;

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(useTimerStore.getState().session.remainingSeconds).toBe(remaining);
    });
  });
});
