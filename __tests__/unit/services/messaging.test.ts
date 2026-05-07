import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  hasPushNotificationPermission,
  onTokenRefresh,
  registerForPushNotifications,
  unregisterPushNotifications,
} from '@/services/firebase/messaging';
import { getDeviceDoc } from '@/services/firebase/firestore';

const mockDeviceDoc = {
  set: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
};

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/services/firebase/firestore', () => ({
  getDeviceDoc: jest.fn(() => mockDeviceDoc),
}));

describe('messaging service', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('checks push permission without triggering a prompt', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: true,
      ios: { status: Notifications.IosAuthorizationStatus.AUTHORIZED },
    });

    const granted = await hasPushNotificationPermission();

    expect(granted).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('registers the current device under a user-scoped device document', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: true,
      ios: { status: Notifications.IosAuthorizationStatus.AUTHORIZED },
    });

    const token = await registerForPushNotifications('user-1');

    expect(token).toBe('mock-fcm-token');
    expect(getDeviceDoc).toHaveBeenCalledWith('user-1', expect.stringMatching(/^device_/));
    expect(mockDeviceDoc.set).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'mock-fcm-token',
        platform: Platform.OS,
        notificationsEnabled: true,
      }),
      { merge: true }
    );
  });

  it('reuses the same installation id for token refresh updates', async () => {
    await AsyncStorage.setItem('@microbreaks/device_installation_id', 'device_existing');

    const unsubscribe = onTokenRefresh('user-1');
    const refreshHandler = (messaging() as any).onTokenRefresh.mock.calls[0][0];

    await refreshHandler('new-token');

    expect(getDeviceDoc).toHaveBeenCalledWith('user-1', 'device_existing');
    expect(mockDeviceDoc.set).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'new-token',
        installationId: 'device_existing',
      }),
      { merge: true }
    );

    unsubscribe();
  });

  it('removes the device registration on unregister', async () => {
    await AsyncStorage.setItem('@microbreaks/device_installation_id', 'device_existing');

    await unregisterPushNotifications('user-1');

    expect(getDeviceDoc).toHaveBeenCalledWith('user-1', 'device_existing');
    expect(mockDeviceDoc.delete).toHaveBeenCalledTimes(1);
  });
});
