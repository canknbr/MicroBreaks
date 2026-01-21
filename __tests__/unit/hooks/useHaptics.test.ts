/**
 * useHaptics Hook Unit Tests
 * 100% coverage with all edge cases
 */

import { renderHook, act } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { useHaptics, HapticStyle } from '@/hooks/useHaptics';
import { useSettingsStore } from '@/store';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock settings store
jest.mock('@/store', () => ({
  useSettingsStore: jest.fn(),
}));

describe('useHaptics Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when haptics are enabled', () => {
    beforeEach(() => {
      (useSettingsStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ settings: { hapticsEnabled: true } })
      );
    });

    describe('light', () => {
      it('should trigger light impact feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.light();
        });

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      });
    });

    describe('medium', () => {
      it('should trigger medium impact feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.medium();
        });

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      });
    });

    describe('heavy', () => {
      it('should trigger heavy impact feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.heavy();
        });

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
      });
    });

    describe('success', () => {
      it('should trigger success notification feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.success();
        });

        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
      });
    });

    describe('warning', () => {
      it('should trigger warning notification feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.warning();
        });

        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning);
      });
    });

    describe('error', () => {
      it('should trigger error notification feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.error();
        });

        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
      });
    });

    describe('selection', () => {
      it('should trigger selection feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.selection();
        });

        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });

    describe('impact (generic)', () => {
      it('should default to light impact when no style specified', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.impact();
        });

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      });

      it('should trigger light impact when specified', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.impact('light');
        });

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      });

      it('should trigger medium impact when specified', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.impact('medium');
        });

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
      });

      it('should trigger heavy impact when specified', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.impact('heavy');
        });

        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
      });

      it('should trigger success notification when specified', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.impact('success');
        });

        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Success);
      });

      it('should trigger warning notification when specified', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.impact('warning');
        });

        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Warning);
      });

      it('should trigger error notification when specified', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.impact('error');
        });

        expect(Haptics.notificationAsync).toHaveBeenCalledWith(Haptics.NotificationFeedbackType.Error);
      });

      it('should trigger selection feedback when specified', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.impact('selection');
        });

        expect(Haptics.selectionAsync).toHaveBeenCalled();
      });
    });

    describe('isEnabled', () => {
      it('should return true when haptics are enabled', () => {
        const { result } = renderHook(() => useHaptics());

        expect(result.current.isEnabled).toBe(true);
      });
    });
  });

  describe('when haptics are disabled', () => {
    beforeEach(() => {
      (useSettingsStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ settings: { hapticsEnabled: false } })
      );
    });

    describe('light', () => {
      it('should not trigger haptic feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.light();
        });

        expect(Haptics.impactAsync).not.toHaveBeenCalled();
      });
    });

    describe('medium', () => {
      it('should not trigger haptic feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.medium();
        });

        expect(Haptics.impactAsync).not.toHaveBeenCalled();
      });
    });

    describe('heavy', () => {
      it('should not trigger haptic feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.heavy();
        });

        expect(Haptics.impactAsync).not.toHaveBeenCalled();
      });
    });

    describe('success', () => {
      it('should not trigger notification feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.success();
        });

        expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      });
    });

    describe('warning', () => {
      it('should not trigger notification feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.warning();
        });

        expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('should not trigger notification feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.error();
        });

        expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      });
    });

    describe('selection', () => {
      it('should not trigger selection feedback', () => {
        const { result } = renderHook(() => useHaptics());

        act(() => {
          result.current.selection();
        });

        expect(Haptics.selectionAsync).not.toHaveBeenCalled();
      });
    });

    describe('impact (generic)', () => {
      it('should not trigger any haptic feedback', () => {
        const { result } = renderHook(() => useHaptics());

        const styles: HapticStyle[] = ['light', 'medium', 'heavy', 'success', 'warning', 'error', 'selection'];

        styles.forEach((style) => {
          act(() => {
            result.current.impact(style);
          });
        });

        expect(Haptics.impactAsync).not.toHaveBeenCalled();
        expect(Haptics.notificationAsync).not.toHaveBeenCalled();
        expect(Haptics.selectionAsync).not.toHaveBeenCalled();
      });
    });

    describe('isEnabled', () => {
      it('should return false when haptics are disabled', () => {
        const { result } = renderHook(() => useHaptics());

        expect(result.current.isEnabled).toBe(false);
      });
    });
  });

  describe('memoization', () => {
    it('should maintain stable function references when haptics setting does not change', () => {
      (useSettingsStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ settings: { hapticsEnabled: true } })
      );

      const { result, rerender } = renderHook(() => useHaptics());

      const initialLight = result.current.light;
      const initialMedium = result.current.medium;
      const initialHeavy = result.current.heavy;
      const initialSuccess = result.current.success;
      const initialWarning = result.current.warning;
      const initialError = result.current.error;
      const initialSelection = result.current.selection;
      const initialImpact = result.current.impact;

      rerender({});

      expect(result.current.light).toBe(initialLight);
      expect(result.current.medium).toBe(initialMedium);
      expect(result.current.heavy).toBe(initialHeavy);
      expect(result.current.success).toBe(initialSuccess);
      expect(result.current.warning).toBe(initialWarning);
      expect(result.current.error).toBe(initialError);
      expect(result.current.selection).toBe(initialSelection);
      expect(result.current.impact).toBe(initialImpact);
    });

    it('should update function references when haptics setting changes', () => {
      let hapticsEnabled = true;
      (useSettingsStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ settings: { hapticsEnabled } })
      );

      const { result, rerender } = renderHook(() => useHaptics());

      const initialLight = result.current.light;

      // Change settings
      hapticsEnabled = false;
      (useSettingsStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ settings: { hapticsEnabled } })
      );

      rerender({});

      // Function reference should change when setting changes
      expect(result.current.light).not.toBe(initialLight);
    });
  });

  describe('return value structure', () => {
    it('should return all expected properties', () => {
      (useSettingsStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ settings: { hapticsEnabled: true } })
      );

      const { result } = renderHook(() => useHaptics());

      expect(result.current).toHaveProperty('light');
      expect(result.current).toHaveProperty('medium');
      expect(result.current).toHaveProperty('heavy');
      expect(result.current).toHaveProperty('success');
      expect(result.current).toHaveProperty('warning');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('selection');
      expect(result.current).toHaveProperty('impact');
      expect(result.current).toHaveProperty('isEnabled');
    });

    it('should have all properties as functions except isEnabled', () => {
      (useSettingsStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ settings: { hapticsEnabled: true } })
      );

      const { result } = renderHook(() => useHaptics());

      expect(typeof result.current.light).toBe('function');
      expect(typeof result.current.medium).toBe('function');
      expect(typeof result.current.heavy).toBe('function');
      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.selection).toBe('function');
      expect(typeof result.current.impact).toBe('function');
      expect(typeof result.current.isEnabled).toBe('boolean');
    });
  });

  describe('multiple rapid calls', () => {
    beforeEach(() => {
      (useSettingsStore as unknown as jest.Mock).mockImplementation((selector) =>
        selector({ settings: { hapticsEnabled: true } })
      );
    });

    it('should handle multiple rapid calls to the same function', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.light();
        result.current.light();
        result.current.light();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed rapid calls', () => {
      const { result } = renderHook(() => useHaptics());

      act(() => {
        result.current.light();
        result.current.success();
        result.current.selection();
      });

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(1);
      expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
      expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
    });
  });
});
