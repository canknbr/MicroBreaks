import { extractSyncableSettings, pullSettings, pushSettings } from '@/services/sync/settingsSync';
import { defaultAppSettings, useSettingsStore } from '@/store/settingsStore';

const mockSet = jest.fn(() => Promise.resolve());
const mockGet = jest.fn();

jest.mock('@/services/firebase/firestore', () => ({
  getUserDoc: jest.fn(() => ({
    set: mockSet,
    get: mockGet,
  })),
}));

describe('settingsSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({
      settings: { ...defaultAppSettings },
      settingsUpdatedAt: 0,
    });
  });

  it('extracts only syncable settings keys', () => {
    const syncable = extractSyncableSettings({
      ...defaultAppSettings,
      soundEnabled: false,
      notificationsEnabled: false,
    });

    expect(syncable).toEqual({
      theme: defaultAppSettings.theme,
      accentColor: defaultAppSettings.accentColor,
      voiceGuidanceEnabled: defaultAppSettings.voiceGuidanceEnabled,
      quietHoursEnabled: defaultAppSettings.quietHoursEnabled,
      quietHoursStart: defaultAppSettings.quietHoursStart,
      quietHoursEnd: defaultAppSettings.quietHoursEnd,
      workDaysOnly: defaultAppSettings.workDaysOnly,
      workDays: defaultAppSettings.workDays,
      defaultBreakDuration: defaultAppSettings.defaultBreakDuration,
      autoStartNextStep: defaultAppSettings.autoStartNextStep,
      showStepPreview: defaultAppSettings.showStepPreview,
    });
  });

  it('pushes only syncable settings to firestore', async () => {
    useSettingsStore.setState({
      settings: {
        ...defaultAppSettings,
        soundEnabled: false,
        notificationsEnabled: false,
        accentColor: '#123456',
      },
      settingsUpdatedAt: 42,
    });

    await pushSettings('user-1');

    expect(mockSet).toHaveBeenCalledTimes(1);
    const firstCall = mockSet.mock.calls[0] as unknown as
      | [payload: { settings: Record<string, unknown> }, options: { merge: boolean }]
      | undefined;
    expect(firstCall).toBeDefined();
    const payload = firstCall?.[0];
    const options = firstCall?.[1];
    expect(payload).toBeDefined();
    if (!payload) {
      throw new Error('Expected Firestore payload to be defined');
    }
    expect(payload.settings).toEqual(
      expect.objectContaining({
        accentColor: '#123456',
        theme: defaultAppSettings.theme,
      })
    );
    expect(payload.settings).not.toHaveProperty('soundEnabled');
    expect(payload.settings).not.toHaveProperty('notificationsEnabled');
    expect(options).toEqual({ merge: true });
  });

  it('pulls newer remote syncable settings and updates settingsUpdatedAt', async () => {
    const remoteUpdatedAt = Date.now();
    const doc = {
      exists: true,
      data: () => ({
        settings: {
          theme: 'light',
          accentColor: '#ff0000',
          voiceGuidanceEnabled: false,
          quietHoursEnabled: false,
          quietHoursStart: 20,
          quietHoursEnd: 7,
          workDaysOnly: false,
          workDays: [1, 2, 3],
          defaultBreakDuration: 90,
          autoStartNextStep: false,
          showStepPreview: false,
          updatedAt: remoteUpdatedAt,
        },
      }),
    };

    await pullSettings('user-1', doc);

    const state = useSettingsStore.getState();
    expect(state.settings.theme).toBe('light');
    expect(state.settings.accentColor).toBe('#ff0000');
    expect(state.settings.soundEnabled).toBe(defaultAppSettings.soundEnabled);
    expect(state.settings.notificationsEnabled).toBe(defaultAppSettings.notificationsEnabled);
    expect(state.settingsUpdatedAt).toBe(remoteUpdatedAt);
  });

  it('ignores stale remote settings', async () => {
    useSettingsStore.setState({
      settings: { ...defaultAppSettings, theme: 'system' },
      settingsUpdatedAt: 999,
    });

    const doc = {
      exists: true,
      data: () => ({
        settings: {
          theme: 'light',
          accentColor: '#ff0000',
          voiceGuidanceEnabled: false,
          quietHoursEnabled: false,
          quietHoursStart: 20,
          quietHoursEnd: 7,
          workDaysOnly: false,
          workDays: [1, 2, 3],
          defaultBreakDuration: 90,
          autoStartNextStep: false,
          showStepPreview: false,
          updatedAt: 500,
        },
      }),
    };

    await pullSettings('user-1', doc);

    const state = useSettingsStore.getState();
    expect(state.settings.theme).toBe('system');
    expect(state.settingsUpdatedAt).toBe(999);
  });
});
