import {
  applyOnboardingNotificationChoice,
  buildOnboardingNotificationSettings,
  buildOnboardingTimerDurations,
  syncOnboardingRuntimeState,
} from '@/features/onboarding/runtime';

describe('onboarding runtime settings', () => {
  it('maps onboarding notification choices into app notification settings', () => {
    expect(
      buildOnboardingNotificationSettings({
        notificationsEnabled: true,
        breakInterval: 30,
      })
    ).toEqual({
      enabled: true,
      breakReminders: true,
      reminderIntervalMinutes: 30,
    });
  });

  it('clamps overly aggressive or invalid break intervals', () => {
    expect(
      buildOnboardingNotificationSettings({
        notificationsEnabled: false,
        breakInterval: 1,
      })
    ).toEqual({
      enabled: false,
      breakReminders: false,
      reminderIntervalMinutes: 5,
    });

    expect(
      buildOnboardingNotificationSettings({
        notificationsEnabled: true,
        breakInterval: 999,
      })
    ).toEqual({
      enabled: true,
      breakReminders: true,
      reminderIntervalMinutes: 120,
    });
  });

  it('builds timer durations that match the onboarding work rhythm', () => {
    expect(buildOnboardingTimerDurations(15)).toEqual({
      work: 15,
      breakMins: 2,
      longBreak: 5,
      sessions: 6,
    });

    expect(buildOnboardingTimerDurations(25)).toEqual({
      work: 25,
      breakMins: 5,
      longBreak: 15,
      sessions: 4,
    });

    expect(buildOnboardingTimerDurations(50)).toEqual({
      work: 50,
      breakMins: 10,
      longBreak: 20,
      sessions: 3,
    });
  });

  it('syncs onboarding runtime state without stopping on non-fatal failures', async () => {
    const deps = {
      setWeeklyGoal: jest.fn(),
      saveNotificationSettings: jest.fn().mockRejectedValue(new Error('storage unavailable')),
      setCustomDurations: jest.fn(),
      updateProfile: jest.fn(),
      unlockAchievement: jest.fn(),
      addXP: jest.fn(),
      addNotification: jest.fn(),
    };

    const result = await syncOnboardingRuntimeState(
      {
        breakInterval: 30,
        notificationsEnabled: true,
      },
      deps,
      { joinedAt: '2026-05-11T10:00:00.000Z' }
    );

    expect(result.weeklyGoal).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.step).toBe('notification_settings');
    expect(deps.setWeeklyGoal).toHaveBeenCalledWith(result.weeklyGoal);
    expect(deps.setCustomDurations).toHaveBeenCalledWith(30, 5, 15, 4);
    expect(deps.updateProfile).toHaveBeenCalledWith({
      joinedAt: '2026-05-11T10:00:00.000Z',
    });
    expect(deps.unlockAchievement).toHaveBeenCalledWith('health-pioneer');
    expect(deps.addXP).toHaveBeenCalledWith(25);
    expect(deps.addNotification).toHaveBeenCalledTimes(2);
  });

  it('applies onboarding notification choice without blocking on permission or push errors', async () => {
    const deps = {
      updateData: jest.fn(),
      saveNotificationSettings: jest.fn().mockResolvedValue(undefined),
      getCurrentUserId: jest.fn().mockReturnValue('user-123'),
      registerForPushNotifications: jest.fn().mockRejectedValue(new Error('push unavailable')),
    };

    const result = await applyOnboardingNotificationChoice(
      true,
      jest.fn().mockResolvedValue(true),
      deps
    );

    expect(result.granted).toBe(true);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.step).toBe('push_registration');
    expect(deps.updateData).toHaveBeenCalledWith({ notificationsEnabled: true });
    expect(deps.saveNotificationSettings).toHaveBeenCalledWith({
      enabled: true,
      breakReminders: true,
    });
  });

  it('falls back to notifications disabled when opt-in permission throws', async () => {
    const deps = {
      updateData: jest.fn(),
      saveNotificationSettings: jest.fn().mockResolvedValue(undefined),
      getCurrentUserId: jest.fn().mockReturnValue('user-123'),
      registerForPushNotifications: jest.fn(),
    };

    const result = await applyOnboardingNotificationChoice(
      true,
      jest.fn().mockRejectedValue(new Error('permission request failed')),
      deps
    );

    expect(result.granted).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.step).toBe('request_permission');
    expect(deps.updateData).toHaveBeenCalledWith({ notificationsEnabled: false });
    expect(deps.saveNotificationSettings).toHaveBeenCalledWith({
      enabled: false,
      breakReminders: false,
    });
    expect(deps.registerForPushNotifications).not.toHaveBeenCalled();
  });
});
