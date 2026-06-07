/**
 * Break Sounds Service
 *
 * Named registry of every sound the app intends to play during a break,
 * a celebration, or a UI moment. The runtime implementation is a no-op
 * stub today — the real `expo-audio` (or `expo-av`) playback will be
 * wired in once the team drops the `.wav` / `.m4a` assets into
 * `assets/audio/`.
 *
 * The API is stable: call sites do `breakSounds.play('breathe-in')`
 * regardless of whether playback is connected. This means we can ship
 * the choreography work TODAY and turn the audio on tomorrow without
 * touching a single component.
 *
 * ## Adding the real implementation
 * 1. `npx expo install expo-audio`
 * 2. Drop the asset files into `assets/audio/<sound-name>.m4a`
 *    matching the names in `SOUND_REGISTRY` below.
 * 3. Replace the stub `play/preload/stop` bodies with the expo-audio
 *    `useAudioPlayer` / `createAudioPlayer` calls. The function
 *    signatures already match the expo-audio shape.
 */

import { useSettingsStore } from '@/store/settingsStore';

export type BreakSoundName =
  // Breathing exercise — one sound per phase, looped during the phase.
  | 'breathe-in'
  | 'breathe-hold'
  | 'breathe-out'
  | 'breathe-complete'
  // UI tap layer — subtle, never aggressive.
  | 'tap-soft'
  | 'tap-confirm'
  | 'tap-success'
  // Session boundaries.
  | 'session-start'
  | 'session-complete'
  | 'session-milestone'
  // Optional ambient background.
  | 'ambient-nature'
  | 'ambient-chime';

interface SoundMeta {
  /** Asset path the future expo-audio loader will use. */
  assetPath: string;
  /** Whether this sound is supposed to loop (ambient + breathing phase). */
  loop: boolean;
  /** Suggested base volume (0–1) for parity across the library. */
  baseVolume: number;
}

/**
 * Single source of truth for every sound. When adding a new sound,
 * register it here first — components reference the name only.
 */
export const SOUND_REGISTRY: Record<BreakSoundName, SoundMeta> = {
  'breathe-in':         { assetPath: 'assets/audio/breathe-in.m4a',         loop: true,  baseVolume: 0.4 },
  'breathe-hold':       { assetPath: 'assets/audio/breathe-hold.m4a',       loop: true,  baseVolume: 0.3 },
  'breathe-out':        { assetPath: 'assets/audio/breathe-out.m4a',        loop: true,  baseVolume: 0.4 },
  'breathe-complete':   { assetPath: 'assets/audio/breathe-complete.m4a',   loop: false, baseVolume: 0.6 },
  'tap-soft':           { assetPath: 'assets/audio/tap-soft.m4a',           loop: false, baseVolume: 0.3 },
  'tap-confirm':        { assetPath: 'assets/audio/tap-confirm.m4a',        loop: false, baseVolume: 0.4 },
  'tap-success':        { assetPath: 'assets/audio/tap-success.m4a',        loop: false, baseVolume: 0.5 },
  'session-start':      { assetPath: 'assets/audio/session-start.m4a',      loop: false, baseVolume: 0.55 },
  'session-complete':   { assetPath: 'assets/audio/session-complete.m4a',   loop: false, baseVolume: 0.7 },
  'session-milestone':  { assetPath: 'assets/audio/session-milestone.m4a',  loop: false, baseVolume: 0.75 },
  'ambient-nature':     { assetPath: 'assets/audio/ambient-nature.m4a',     loop: true,  baseVolume: 0.25 },
  'ambient-chime':      { assetPath: 'assets/audio/ambient-chime.m4a',      loop: true,  baseVolume: 0.2 },
};

interface BreakSoundsService {
  /**
   * Play a sound by name. Resolves immediately whether or not playback
   * actually fires (sound disabled, asset missing, etc.) so callers can
   * fire-and-forget without `try`.
   */
  play(name: BreakSoundName, opts?: { volumeMultiplier?: number }): Promise<void>;
  /** Pre-warm one or more sounds. No-op until playback is wired. */
  preload(names: BreakSoundName[]): Promise<void>;
  /** Stop a specific looped sound; safe to call when nothing is playing. */
  stop(name: BreakSoundName): Promise<void>;
  /** Stop everything (e.g. session end, app backgrounded). */
  stopAll(): Promise<void>;
}

function isSoundEnabled(): boolean {
  try {
    return useSettingsStore.getState().settings.soundEnabled;
  } catch {
    return false;
  }
}

class StubBreakSoundsService implements BreakSoundsService {
  async play(name: BreakSoundName, _opts?: { volumeMultiplier?: number }): Promise<void> {
    if (!isSoundEnabled()) return;
    if (__DEV__) {
      // Surface so we can see the choreography fire in dev tools even
      // while the audio engine is still a stub.
      console.log(`[breakSounds] play ${name}`);
    }
  }

  async preload(_names: BreakSoundName[]): Promise<void> {
    /* no-op until expo-audio is wired */
  }

  async stop(name: BreakSoundName): Promise<void> {
    if (__DEV__) {
      console.log(`[breakSounds] stop ${name}`);
    }
  }

  async stopAll(): Promise<void> {
    /* no-op */
  }
}

export const breakSounds: BreakSoundsService = new StubBreakSoundsService();
