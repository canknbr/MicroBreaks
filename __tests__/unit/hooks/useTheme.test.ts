/**
 * useTheme Hook Unit Tests
 * Tests for theme management and color resolution
 */

import { renderHook, act } from '@testing-library/react-native';
import { useTheme, useEffectiveTheme, useIsDarkMode } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/settingsStore';
import { useColorScheme } from 'react-native';

// Mock react-native's useColorScheme
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    useColorScheme: jest.fn(() => 'dark'),
  };
});

describe('useTheme Hook', () => {
  beforeEach(() => {
    // Reset settings store
    act(() => {
      useSettingsStore.getState().resetSettings();
    });
    // Reset mock
    (useColorScheme as jest.Mock).mockReturnValue('dark');
  });

  describe('useTheme', () => {
    it('should return dark theme colors when theme is dark', () => {
      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
      expect(result.current.background.primary).toBe('#000000');
      expect(result.current.text.primary).toBe('#FFFFFF');
      expect(result.current.statusBar).toBe('light');
    });

    it('should return light theme colors when theme is light', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
      expect(result.current.background.primary).toBe('#F2F2F7');
      expect(result.current.text.primary).toBe('#000000');
      expect(result.current.statusBar).toBe('dark');
    });

    it('should follow system theme when set to system', () => {
      act(() => {
        useSettingsStore.getState().setTheme('system');
      });

      // System is dark
      (useColorScheme as jest.Mock).mockReturnValue('dark');
      const { result: darkResult } = renderHook(() => useTheme());
      expect(darkResult.current.isDark).toBe(true);

      // System is light
      (useColorScheme as jest.Mock).mockReturnValue('light');
      const { result: lightResult } = renderHook(() => useTheme());
      expect(lightResult.current.isDark).toBe(false);
    });

    it('should have correct accent colors for dark theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.accent.primary).toBe('#06FFA5');
      expect(result.current.accent.secondary).toBe('#00E5FF');
      expect(result.current.accent.tertiary).toBe('#B47EFF');
      expect(result.current.accent.warning).toBe('#FFD166');
      expect(result.current.accent.error).toBe('#FF6B6B');
      expect(result.current.accent.success).toBe('#06FFA5');
    });

    it('should have correct accent colors for light theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.accent.primary).toBe('#34C759'); // Apple green
      expect(result.current.accent.secondary).toBe('#007AFF'); // Apple blue
      expect(result.current.accent.tertiary).toBe('#AF52DE'); // Apple purple
      expect(result.current.accent.warning).toBe('#FF9500'); // Apple orange
      expect(result.current.accent.error).toBe('#FF3B30'); // Apple red
    });

    it('should have correct background colors for dark theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.background.primary).toBe('#000000');
      expect(result.current.background.secondary).toBe('#0A0A0F');
      expect(result.current.background.card).toBe('rgba(25, 25, 35, 0.9)');
      expect(result.current.background.elevated).toBe('rgba(40, 40, 50, 0.9)');
    });

    it('should have correct background colors for light theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.background.primary).toBe('#F2F2F7');
      expect(result.current.background.secondary).toBe('#E5E5EA');
      expect(result.current.background.card).toBe('#FFFFFF');
      expect(result.current.background.elevated).toBe('#FFFFFF');
    });

    it('should have correct text colors for dark theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.text.primary).toBe('#FFFFFF');
      expect(result.current.text.secondary).toBe('rgba(255, 255, 255, 0.7)');
      expect(result.current.text.muted).toBe('rgba(255, 255, 255, 0.5)');
      expect(result.current.text.inverse).toBe('#000000');
    });

    it('should have correct text colors for light theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.text.primary).toBe('#000000');
      expect(result.current.text.secondary).toBe('#000000');
      expect(result.current.text.muted).toBe('#666666');
      expect(result.current.text.inverse).toBe('#FFFFFF');
    });

    it('should have correct border colors for dark theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.border.subtle).toBe('rgba(255, 255, 255, 0.08)');
      expect(result.current.border.medium).toBe('rgba(255, 255, 255, 0.15)');
      expect(result.current.border.strong).toBe('rgba(255, 255, 255, 0.25)');
    });

    it('should have correct border colors for light theme', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.border.subtle).toBe('rgba(0, 0, 0, 0.06)');
      expect(result.current.border.medium).toBe('rgba(0, 0, 0, 0.10)');
      expect(result.current.border.strong).toBe('rgba(0, 0, 0, 0.15)');
    });
  });

  describe('useEffectiveTheme', () => {
    it('should return dark when theme setting is dark', () => {
      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });

      const { result } = renderHook(() => useEffectiveTheme());
      expect(result.current).toBe('dark');
    });

    it('should return light when theme setting is light', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      const { result } = renderHook(() => useEffectiveTheme());
      expect(result.current).toBe('light');
    });

    it('should resolve system theme to dark when system is dark', () => {
      act(() => {
        useSettingsStore.getState().setTheme('system');
      });
      (useColorScheme as jest.Mock).mockReturnValue('dark');

      const { result } = renderHook(() => useEffectiveTheme());
      expect(result.current).toBe('dark');
    });

    it('should resolve system theme to light when system is light', () => {
      act(() => {
        useSettingsStore.getState().setTheme('system');
      });
      (useColorScheme as jest.Mock).mockReturnValue('light');

      const { result } = renderHook(() => useEffectiveTheme());
      expect(result.current).toBe('light');
    });

    it('should default to dark when system scheme is null', () => {
      act(() => {
        useSettingsStore.getState().setTheme('system');
      });
      (useColorScheme as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useEffectiveTheme());
      expect(result.current).toBe('dark');
    });
  });

  describe('useIsDarkMode', () => {
    it('should return true when effective theme is dark', () => {
      act(() => {
        useSettingsStore.getState().setTheme('dark');
      });

      const { result } = renderHook(() => useIsDarkMode());
      expect(result.current).toBe(true);
    });

    it('should return false when effective theme is light', () => {
      act(() => {
        useSettingsStore.getState().setTheme('light');
      });

      const { result } = renderHook(() => useIsDarkMode());
      expect(result.current).toBe(false);
    });

    it('should reflect system theme when set to system', () => {
      act(() => {
        useSettingsStore.getState().setTheme('system');
      });

      (useColorScheme as jest.Mock).mockReturnValue('dark');
      const { result: darkResult } = renderHook(() => useIsDarkMode());
      expect(darkResult.current).toBe(true);

      (useColorScheme as jest.Mock).mockReturnValue('light');
      const { result: lightResult } = renderHook(() => useIsDarkMode());
      expect(lightResult.current).toBe(false);
    });
  });
});
