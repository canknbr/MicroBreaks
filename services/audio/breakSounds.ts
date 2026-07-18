/**
 * Break Sounds Service
 *
 * Named registry of every sound the app intends to play during a break,
 * a celebration, or a UI moment, backed by `expo-audio`.
 *
 * The API surface is the same one wave 1 shipped with — components do
 * `breakSounds.play('breathe-in')` and never see the playback engine. The
 * implementation underneath is now a real `expo-audio` `AudioPlayer`
 * cache: each named sound is lazily created on first play, kept warm for
 * the lifetime of the app, and reused across calls.
 *
 * ## Adding a sound file
 *
 * 1. Drop the `.m4a` / `.wav` into `assets/audio/<name>.m4a` matching the
 *    name in `SOUND_REGISTRY`.
 * 2. Uncomment the matching `require(...)` in `SOURCE_MAP` below.
 * 3. Done. Every call site lights up automatically — no component changes
 *    needed.
 *
 * Until an asset is bundled, `SOURCE_MAP[name]` returns `null` and the
 * service falls back to a no-op (logging in dev). Choreography work
 * shipped without waiting on the audio team this way.
 */

import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
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

/**
 * Maps each sound name to its bundled `require(...)` source — or `null`
 * if the asset has not been added yet. When the audio team drops a new
 * file, change the right-hand side here and every existing call site
 * lights up.
 *
 * NOTE: these MUST be `require(...)` calls (not string paths). Metro
 * resolves them at bundle time, so we ship the audio bytes with the app.
 */
const SOURCE_MAP: Record<BreakSoundName, number | null> = {
  'breathe-in':        null, // require('../../assets/audio/breathe-in.m4a'),
  'breathe-hold':      null, // require('../../assets/audio/breathe-hold.m4a'),
  'breathe-out':       null, // require('../../assets/audio/breathe-out.m4a'),
  'breathe-complete':  null, // require('../../assets/audio/breathe-complete.m4a'),
  'tap-soft':          null, // require('../../assets/audio/tap-soft.m4a'),
  'tap-confirm':       null, // require('../../assets/audio/tap-confirm.m4a'),
  'tap-success':       null, // require('../../assets/audio/tap-success.m4a'),
  'session-start':     null, // require('../../assets/audio/session-start.m4a'),
  'session-complete':  null, // require('../../assets/audio/session-complete.m4a'),
  'session-milestone': null, // require('../../assets/audio/session-milestone.m4a'),
  'ambient-nature':    null, // require('../../assets/audio/ambient-nature.m4a'),
  'ambient-chime':     null, // require('../../assets/audio/ambient-chime.m4a'),
};

/**
 * Remote fallback URLs for streaming when local assets are not bundled yet.
 * Streams high-fidelity ambient nature sounds and zen chimes from a CDN.
 */
const REMOTE_SOURCE_MAP: Record<BreakSoundName, string | null> = {
  'breathe-in':        'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
  'breathe-hold':      null,
  'breathe-out':       'https://assets.mixkit.co/active_storage/sfx/2566/2566-84.wav',
  'breathe-complete':  'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav',
  'tap-soft':          'https://assets.mixkit.co/active_storage/sfx/2571/2571-84.wav',
  'tap-confirm':       'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav',
  'tap-success':       'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav',
  'session-start':     'https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav',
  'session-complete':  'https://assets.mixkit.co/active_storage/sfx/1653/1653-84.wav',
  'session-milestone': 'https://assets.mixkit.co/active_storage/sfx/1435/1435-84.wav',
  'ambient-nature':    'https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav',
  'ambient-chime':     'https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav',
};

interface BreakSoundsService {
  /**
   * Play a sound by name. Resolves immediately whether or not playback
   * actually fires (sound disabled, asset missing, etc.) so callers can
   * fire-and-forget without `try`.
   */
  play(name: BreakSoundName, opts?: { volumeMultiplier?: number }): Promise<void>;
  /** Pre-warm one or more sounds. No-op for sounds without a bundled source. */
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

class ExpoAudioBreakSoundsService implements BreakSoundsService {
  /** AudioPlayer cache. One player per registered sound, created lazily. */
  private players = new Map<BreakSoundName, AudioPlayer>();

  /**
   * Returns a ready-to-play `AudioPlayer` for the named sound. Falls back
   * to a remote streaming CDN if local files are missing, ensuring
   * zero audio downtime.
   */
  private ensurePlayer(name: BreakSoundName): AudioPlayer | null {
    const cached = this.players.get(name);
    if (cached) return cached;

    let source: any = SOURCE_MAP[name];
    if (source == null) {
      const remoteUrl = REMOTE_SOURCE_MAP[name];
      if (remoteUrl) {
        source = { uri: remoteUrl };
      }
    }

    if (source == null) {
      if (__DEV__) {
        console.log(`[breakSounds] no asset or remote fallback for "${name}" — skipping`);
      }
      return null;
    }

    try {
      const meta = SOUND_REGISTRY[name];
      const player = createAudioPlayer(source);
      player.loop = meta.loop;
      player.volume = meta.baseVolume;
      this.players.set(name, player);
      return player;
    } catch (err) {
      if (__DEV__) {
        console.warn(`[breakSounds] failed to create player for "${name}":`, err);
      }
      return null;
    }
  }

  async play(name: BreakSoundName, opts?: { volumeMultiplier?: number }): Promise<void> {
    if (!isSoundEnabled()) return;

    // Prevent overlapping breathing phase loops
    const breathingSounds: BreakSoundName[] = ['breathe-in', 'breathe-hold', 'breathe-out'];
    if (breathingSounds.includes(name)) {
      for (const other of breathingSounds) {
        if (other !== name) {
          await this.stop(other);
        }
      }
    }

    const player = this.ensurePlayer(name);
    if (!player) return;

    try {
      // Re-apply volume each call so a per-call multiplier sticks (e.g.
      // a "soft" tap-confirm during a quiet phase).
      const baseVolume = SOUND_REGISTRY[name].baseVolume;
      const multiplier = opts?.volumeMultiplier ?? 1;
      player.volume = Math.max(0, Math.min(1, baseVolume * multiplier));

      // Rewind so re-triggering a one-shot (tap-soft, session-start)
      // always plays from the top instead of resuming mid-clip.
      await player.seekTo(0);
      player.play();
    } catch (err) {
      if (__DEV__) {
        console.warn(`[breakSounds] play "${name}" failed:`, err);
      }
    }
  }

  async preload(names: BreakSoundName[]): Promise<void> {
    // Touching the player constructor is enough — expo-audio loads the
    // sample on creation. We don't need a separate prefetch step.
    for (const name of names) {
      this.ensurePlayer(name);
    }
  }

  async stop(name: BreakSoundName): Promise<void> {
    const player = this.players.get(name);
    if (!player) return;
    try {
      player.pause();
      await player.seekTo(0);
    } catch (err) {
      if (__DEV__) {
        console.warn(`[breakSounds] stop "${name}" failed:`, err);
      }
    }
  }

  async stopAll(): Promise<void> {
    for (const player of this.players.values()) {
      try {
        player.pause();
      } catch {
        /* one bad player must not block the others */
      }
    }
  }
}

export const breakSounds: BreakSoundsService = new ExpoAudioBreakSoundsService();
