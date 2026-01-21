/**
 * Voice Guidance Hook
 * Wrapper for expo-speech with queue management
 */

import { useCallback, useRef, useEffect } from 'react';
import * as Speech from 'expo-speech';

interface VoiceGuidanceOptions {
  language?: string;
  pitch?: number;
  rate?: number;
}

interface UseVoiceGuidanceReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: () => Promise<boolean>;
}

const DEFAULT_OPTIONS: VoiceGuidanceOptions = {
  language: 'en-US',
  pitch: 1.0,
  rate: 0.9, // Slightly slower for clarity
};

export function useVoiceGuidance(
  options: VoiceGuidanceOptions = {}
): UseVoiceGuidanceReturn {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const isMountedRef = useRef(true);
  const queueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      Speech.stop();
    };
  }, []);

  // Use iterative approach instead of recursion to avoid stack overflow
  const processQueue = useCallback(async () => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;

    // Process all items in queue using iteration instead of recursion
    while (queueRef.current.length > 0 && isMountedRef.current) {
      const text = queueRef.current.shift();

      if (text && isMountedRef.current) {
        try {
          await new Promise<void>((resolve, reject) => {
            Speech.speak(text, {
              language: mergedOptions.language,
              pitch: mergedOptions.pitch,
              rate: mergedOptions.rate,
              onDone: () => resolve(),
              onError: (error) => reject(error),
              onStopped: () => resolve(),
            });
          });
        } catch (error) {
          if (__DEV__) {
            console.warn('Speech error:', error);
          }
          // Continue processing queue even if one item fails
        }
      }
    }

    isProcessingRef.current = false;
  }, [mergedOptions.language, mergedOptions.pitch, mergedOptions.rate]);

  const speak = useCallback(
    async (text: string): Promise<void> => {
      if (!isMountedRef.current) return;

      // Clear queue and stop current speech for immediate feedback
      queueRef.current = [];
      await Speech.stop();

      // Add to queue and process
      queueRef.current.push(text);
      processQueue();
    },
    [processQueue]
  );

  const stop = useCallback(() => {
    queueRef.current = [];
    isProcessingRef.current = false;
    Speech.stop();
  }, []);

  const isSpeaking = useCallback(async (): Promise<boolean> => {
    return Speech.isSpeakingAsync();
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
  };
}

export default useVoiceGuidance;
