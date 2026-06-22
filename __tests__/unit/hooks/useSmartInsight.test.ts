import { renderHook } from '@testing-library/react-native';
import { useSmartInsight } from '@/hooks/useSmartInsight';

describe('useSmartInsight', () => {
  it('does not fabricate a "working for Xh Ym" warning for a brand-new user with no breaks (null)', () => {
    // The old 999 in-band sentinel made a user with zero breaks look like they
    // had been working ~16h, firing a false "time for a break" warning.
    const { result } = renderHook(() => useSmartInsight(0, 8, null, 0));
    expect(result.current.type).not.toBe('warning');
  });

  it('still warns honestly when a real long gap has elapsed', () => {
    const { result } = renderHook(() => useSmartInsight(0, 8, 1500, 0));
    expect(result.current.type).toBe('warning');
    expect(result.current.message).toContain('25h 0m');
  });

  it('warns when more than 90 minutes have passed since the last break', () => {
    const { result } = renderHook(() => useSmartInsight(0, 8, 120, 0));
    expect(result.current.type).toBe('warning');
    expect(result.current.message).toContain('2h 0m');
  });
});
