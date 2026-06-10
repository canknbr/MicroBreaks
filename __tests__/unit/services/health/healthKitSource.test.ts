import { Platform } from 'react-native';
import {
  __resetHealthKitSourceForTests,
  __setHealthKitModuleForTests,
  requestMindfulSessionPermission,
  writeMindfulSession,
} from '@/services/health/healthKitSource';
import {
  __resetTierStateForTests,
  __setEffectiveTier,
} from '@/services/subscription/tierState';
import { useSettingsStore } from '@/store/settingsStore';
import type { MindfulSample } from '@/services/health/mindfulMinutes';

function makeMockKit(opts: {
  initError?: string | null;
  saveError?: string | null;
} = {}) {
  const initHealthKit = jest.fn((_perms, cb) => cb(opts.initError ?? null));
  const saveMindfulSession = jest.fn((_args, cb) => cb(opts.saveError ?? null));
  return {
    Constants: { Permissions: { MindfulSession: 'MindfulSession' } },
    initHealthKit,
    saveMindfulSession,
  };
}

function sample(): MindfulSample {
  return {
    startMs: new Date('2026-06-08T10:00:00Z').getTime(),
    endMs: new Date('2026-06-08T10:01:00Z').getTime(),
    source: 'eye-rest',
  };
}

describe('healthKitSource', () => {
  beforeEach(() => {
    __resetHealthKitSourceForTests();
    __resetTierStateForTests();
    // Default to a paying tier so the existing success paths still
    // exercise HealthKit behavior. Tier-gate cases set 'free'
    // explicitly below.
    __setEffectiveTier('pro');
    // User consent is now a separate gate above the tier check. The
    // settings store defaults to off so the user is asked to opt in;
    // for the historical write tests we flip it on so they exercise
    // the HealthKit-touching code paths. The consent-off case has its
    // own test below.
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        appleHealthMirrorEnabled: true,
      },
    });
    (Platform as { OS: string }).OS = 'ios';
  });

  it('returns false from requestMindfulSessionPermission when HealthKit is unavailable', async () => {
    __setHealthKitModuleForTests(null);
    const ok = await requestMindfulSessionPermission();
    expect(ok).toBe(false);
  });

  it('returns true once HealthKit init succeeds', async () => {
    const kit = makeMockKit();
    __setHealthKitModuleForTests(kit);
    const ok = await requestMindfulSessionPermission();
    expect(ok).toBe(true);
    expect(kit.initHealthKit).toHaveBeenCalledWith(
      { permissions: { write: ['MindfulSession'] } },
      expect.any(Function)
    );
  });

  it('returns false when init reports an error', async () => {
    const kit = makeMockKit({ initError: 'denied' });
    __setHealthKitModuleForTests(kit);
    const ok = await requestMindfulSessionPermission();
    expect(ok).toBe(false);
  });

  it('skips repeat inits after a successful first call', async () => {
    const kit = makeMockKit();
    __setHealthKitModuleForTests(kit);
    await requestMindfulSessionPermission();
    await requestMindfulSessionPermission();
    expect(kit.initHealthKit).toHaveBeenCalledTimes(1);
  });

  it('writes a mindful session and resolves true on success', async () => {
    const kit = makeMockKit();
    __setHealthKitModuleForTests(kit);
    const ok = await writeMindfulSession(sample());
    expect(ok).toBe(true);
    expect(kit.saveMindfulSession).toHaveBeenCalledWith(
      {
        startDate: '2026-06-08T10:00:00.000Z',
        endDate: '2026-06-08T10:01:00.000Z',
      },
      expect.any(Function)
    );
  });

  it('resolves false when the native write reports an error', async () => {
    const kit = makeMockKit({ saveError: 'unauthorized' });
    __setHealthKitModuleForTests(kit);
    const ok = await writeMindfulSession(sample());
    expect(ok).toBe(false);
  });

  it('resolves false (never rejects) when the native call throws', async () => {
    const throwingKit = {
      Constants: { Permissions: { MindfulSession: 'MindfulSession' } },
      initHealthKit: jest.fn(),
      saveMindfulSession: jest.fn(() => {
        throw new Error('native boom');
      }),
    };
    __setHealthKitModuleForTests(throwingKit);
    await expect(writeMindfulSession(sample())).resolves.toBe(false);
  });

  it('returns false on Android even when a mock module is injected', async () => {
    (Platform as { OS: string }).OS = 'android';
    __setHealthKitModuleForTests(makeMockKit());
    // The platform check happens before the cache, so even with a
    // mock module injected we must short-circuit.
    const ok = await writeMindfulSession(sample());
    expect(ok).toBe(false);
  });

  describe('tier gate', () => {
    it('skips the write for free-tier users without touching HealthKit', async () => {
      const kit = makeMockKit();
      __setHealthKitModuleForTests(kit);
      __setEffectiveTier('free');

      const ok = await writeMindfulSession(sample());
      expect(ok).toBe(false);
      expect(kit.saveMindfulSession).not.toHaveBeenCalled();
    });

    it('skips the write for solo-tier users (apple_health_export requires Pro)', async () => {
      const kit = makeMockKit();
      __setHealthKitModuleForTests(kit);
      __setEffectiveTier('solo');

      const ok = await writeMindfulSession(sample());
      expect(ok).toBe(false);
      expect(kit.saveMindfulSession).not.toHaveBeenCalled();
    });

    it('writes for pro and family tiers', async () => {
      for (const tier of ['pro', 'family'] as const) {
        __resetHealthKitSourceForTests();
        const kit = makeMockKit();
        __setHealthKitModuleForTests(kit);
        __setEffectiveTier(tier);

        const ok = await writeMindfulSession(sample());
        expect(ok).toBe(true);
        expect(kit.saveMindfulSession).toHaveBeenCalled();
      }
    });
  });

  describe('consent gate', () => {
    it('skips the write when the user has not opted in, even on Pro', async () => {
      const kit = makeMockKit();
      __setHealthKitModuleForTests(kit);
      __setEffectiveTier('pro');
      useSettingsStore.setState({
        settings: {
          ...useSettingsStore.getState().settings,
          appleHealthMirrorEnabled: false,
        },
      });

      const ok = await writeMindfulSession(sample());
      expect(ok).toBe(false);
      expect(kit.saveMindfulSession).not.toHaveBeenCalled();
    });
  });
});
