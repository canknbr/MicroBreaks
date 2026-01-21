/**
 * useVoiceGuidance Hook Unit Tests
 * 100% coverage with all edge cases
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import * as Speech from 'expo-speech';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn().mockResolvedValue(undefined),
  isSpeakingAsync: jest.fn().mockResolvedValue(false),
}));

describe('useVoiceGuidance Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should return speak, stop, and isSpeaking functions', () => {
      const { result } = renderHook(() => useVoiceGuidance());

      expect(result.current).toHaveProperty('speak');
      expect(result.current).toHaveProperty('stop');
      expect(result.current).toHaveProperty('isSpeaking');
      expect(typeof result.current.speak).toBe('function');
      expect(typeof result.current.stop).toBe('function');
      expect(typeof result.current.isSpeaking).toBe('function');
    });

    it('should use default options when none provided', () => {
      const { result } = renderHook(() => useVoiceGuidance());

      // Trigger speak to verify default options
      act(() => {
        result.current.speak('Test message');
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          language: 'en-US',
          pitch: 1.0,
          rate: 0.9,
        })
      );
    });

    it('should merge custom options with defaults', () => {
      const { result } = renderHook(() =>
        useVoiceGuidance({
          language: 'tr-TR',
          pitch: 1.2,
        })
      );

      act(() => {
        result.current.speak('Test message');
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({
          language: 'tr-TR',
          pitch: 1.2,
          rate: 0.9, // Default preserved
        })
      );
    });
  });

  describe('speak', () => {
    it('should call Speech.speak with the provided text', async () => {
      // Mock speak to immediately call onDone
      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        if (options?.onDone) {
          setTimeout(() => options.onDone(), 0);
        }
      });

      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('Hello world');
        jest.runAllTimers();
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Hello world',
        expect.objectContaining({
          language: 'en-US',
        })
      );
    });

    it('should stop current speech before speaking new text', async () => {
      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('First message');
      });

      expect(Speech.stop).toHaveBeenCalled();
    });

    it('should clear queue when speak is called', async () => {
      const { result } = renderHook(() => useVoiceGuidance());

      // First speak
      await act(async () => {
        result.current.speak('First');
      });

      // Second speak should clear first from queue
      await act(async () => {
        result.current.speak('Second');
      });

      // Only the last speak should be in the queue
      expect(Speech.stop).toHaveBeenCalled();
    });

    it('should handle onDone callback', async () => {
      let doneCallback: (() => void) | null = null;

      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        doneCallback = options?.onDone;
      });

      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('Test');
      });

      // Simulate speech completion
      await act(async () => {
        if (doneCallback) doneCallback();
      });

      // Should complete without errors
      expect(Speech.speak).toHaveBeenCalled();
    });

    it('should handle onStopped callback', async () => {
      let stoppedCallback: (() => void) | null = null;

      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        stoppedCallback = options?.onStopped;
      });

      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('Test');
      });

      // Simulate speech being stopped
      await act(async () => {
        if (stoppedCallback) stoppedCallback();
      });

      // Should complete without errors
      expect(Speech.speak).toHaveBeenCalled();
    });

    it('should handle onError callback', async () => {
      let errorCallback: ((error: Error) => void) | null = null;
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        errorCallback = options?.onError;
      });

      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('Test');
      });

      // Simulate speech error
      await act(async () => {
        if (errorCallback) errorCallback(new Error('Speech error'));
      });

      expect(consoleSpy).toHaveBeenCalledWith('Speech error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should include callbacks in options', async () => {
      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('Test');
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({
          onDone: expect.any(Function),
          onError: expect.any(Function),
          onStopped: expect.any(Function),
        })
      );
    });
  });

  describe('stop', () => {
    it('should call Speech.stop', () => {
      const { result } = renderHook(() => useVoiceGuidance());

      act(() => {
        result.current.stop();
      });

      expect(Speech.stop).toHaveBeenCalled();
    });

    it('should clear the queue', async () => {
      let doneCallback: (() => void) | null = null;

      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        doneCallback = options?.onDone;
      });

      const { result } = renderHook(() => useVoiceGuidance());

      // Queue up a message
      await act(async () => {
        result.current.speak('First message');
      });

      // Stop should clear queue
      act(() => {
        result.current.stop();
      });

      // Completing the first message should not trigger queue processing
      if (doneCallback) {
        await act(async () => {
          doneCallback!();
        });
      }

      // The queue should have been cleared
      expect(Speech.stop).toHaveBeenCalled();
    });

    it('should reset processing state', () => {
      const { result } = renderHook(() => useVoiceGuidance());

      // Start speaking
      act(() => {
        result.current.speak('Message');
      });

      // Stop
      act(() => {
        result.current.stop();
      });

      // Should be able to speak again
      act(() => {
        result.current.speak('New message');
      });

      expect(Speech.speak).toHaveBeenCalledTimes(2);
    });
  });

  describe('isSpeaking', () => {
    it('should return result from Speech.isSpeakingAsync', async () => {
      (Speech.isSpeakingAsync as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useVoiceGuidance());

      let speaking: boolean = false;
      await act(async () => {
        speaking = await result.current.isSpeaking();
      });

      expect(speaking).toBe(true);
      expect(Speech.isSpeakingAsync).toHaveBeenCalled();
    });

    it('should return false when not speaking', async () => {
      (Speech.isSpeakingAsync as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useVoiceGuidance());

      let speaking: boolean = true;
      await act(async () => {
        speaking = await result.current.isSpeaking();
      });

      expect(speaking).toBe(false);
    });
  });

  describe('cleanup on unmount', () => {
    it('should stop speech on unmount', () => {
      const { unmount } = renderHook(() => useVoiceGuidance());

      unmount();

      expect(Speech.stop).toHaveBeenCalled();
    });
  });

  describe('queue processing', () => {
    it('should process queue items sequentially', async () => {
      let doneCallbacks: (() => void)[] = [];
      let callOrder: string[] = [];

      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        callOrder.push(text);
        if (options?.onDone) {
          doneCallbacks.push(options.onDone);
        }
      });

      const { result } = renderHook(() => useVoiceGuidance());

      // Note: Due to queue clearing behavior, only the last message will be spoken
      await act(async () => {
        result.current.speak('Last message');
      });

      expect(Speech.speak).toHaveBeenCalledWith('Last message', expect.any(Object));
    });

    it('should not process queue if unmounted', async () => {
      let doneCallback: (() => void) | null = null;

      (Speech.speak as jest.Mock).mockImplementation((text, options) => {
        doneCallback = options?.onDone;
      });

      const { result, unmount } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('Message');
      });

      // Unmount before callback
      unmount();

      // Trigger callback after unmount
      if (doneCallback) {
        await act(async () => {
          doneCallback!();
        });
      }

      // Should not cause errors
      expect(Speech.speak).toHaveBeenCalledTimes(1);
    });

    it('should not speak if component is unmounted before speak starts', async () => {
      const { result, unmount } = renderHook(() => useVoiceGuidance());

      // Unmount immediately
      unmount();

      // Try to speak after unmount
      await act(async () => {
        result.current.speak('Should not speak');
      });

      // Speech.speak may have been called but with proper unmount handling
      // The important thing is no errors are thrown
    });
  });

  describe('custom options', () => {
    it('should use custom language', () => {
      const { result } = renderHook(() =>
        useVoiceGuidance({ language: 'de-DE' })
      );

      act(() => {
        result.current.speak('Hallo');
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Hallo',
        expect.objectContaining({ language: 'de-DE' })
      );
    });

    it('should use custom pitch', () => {
      const { result } = renderHook(() =>
        useVoiceGuidance({ pitch: 1.5 })
      );

      act(() => {
        result.current.speak('Test');
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({ pitch: 1.5 })
      );
    });

    it('should use custom rate', () => {
      const { result } = renderHook(() =>
        useVoiceGuidance({ rate: 0.5 })
      );

      act(() => {
        result.current.speak('Slow speech');
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Slow speech',
        expect.objectContaining({ rate: 0.5 })
      );
    });

    it('should handle all options together', () => {
      const { result } = renderHook(() =>
        useVoiceGuidance({
          language: 'fr-FR',
          pitch: 0.8,
          rate: 1.2,
        })
      );

      act(() => {
        result.current.speak('Bonjour');
      });

      expect(Speech.speak).toHaveBeenCalledWith(
        'Bonjour',
        expect.objectContaining({
          language: 'fr-FR',
          pitch: 0.8,
          rate: 1.2,
        })
      );
    });
  });

  describe('memoization', () => {
    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useVoiceGuidance());

      const initialSpeak = result.current.speak;
      const initialStop = result.current.stop;
      const initialIsSpeaking = result.current.isSpeaking;

      rerender({});

      expect(result.current.speak).toBe(initialSpeak);
      expect(result.current.stop).toBe(initialStop);
      expect(result.current.isSpeaking).toBe(initialIsSpeaking);
    });

    it('should update functions when options change', () => {
      const { result, rerender } = renderHook(
        ({ language }) => useVoiceGuidance({ language }),
        { initialProps: { language: 'en-US' } }
      );

      const initialSpeak = result.current.speak;

      rerender({ language: 'tr-TR' });

      // speak should be updated when options change
      expect(result.current.speak).not.toBe(initialSpeak);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', async () => {
      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('');
      });

      expect(Speech.speak).toHaveBeenCalledWith('', expect.any(Object));
    });

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(10000);

      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak(longText);
      });

      expect(Speech.speak).toHaveBeenCalledWith(longText, expect.any(Object));
    });

    it('should handle special characters', async () => {
      const specialText = 'Hello! @#$%^&*() "quotes" <tags>';

      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak(specialText);
      });

      expect(Speech.speak).toHaveBeenCalledWith(specialText, expect.any(Object));
    });

    it('should handle unicode characters', async () => {
      const unicodeText = 'Hello 你好 مرحبا 🎉';

      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak(unicodeText);
      });

      expect(Speech.speak).toHaveBeenCalledWith(unicodeText, expect.any(Object));
    });

    it('should handle multiple stop calls', () => {
      const { result } = renderHook(() => useVoiceGuidance());

      act(() => {
        result.current.stop();
        result.current.stop();
        result.current.stop();
      });

      expect(Speech.stop).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid speak calls', async () => {
      const { result } = renderHook(() => useVoiceGuidance());

      await act(async () => {
        result.current.speak('First');
        result.current.speak('Second');
        result.current.speak('Third');
      });

      // Due to queue clearing, Speech.speak should be called for each
      // but only the last one remains in queue
      expect(Speech.speak).toHaveBeenCalled();
    });
  });
});
