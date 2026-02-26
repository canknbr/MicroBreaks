/**
 * Data Export Service
 * Exports all user data for GDPR compliance
 */

import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserId } from '@/services/firebase/auth';
import { getUserDoc, getBreaksCollection } from '@/services/firebase/firestore';

interface ExportedData {
  exportDate: string;
  userId: string | null;
  profile: unknown;
  settings: unknown;
  breakHistory: unknown;
  cloudData: {
    userDocument: unknown;
    breaks: unknown[];
  } | null;
}

/**
 * Export all user data as a JSON file and open the share sheet.
 */
export async function exportUserData(): Promise<void> {
  const userId = getCurrentUserId();

  // Gather local data
  const [userStoreData, settingsData, breakHistory] = await Promise.all([
    AsyncStorage.getItem('microbreaks-user'),
    AsyncStorage.getItem('microbreaks-settings'),
    AsyncStorage.getItem('@microbreaks/break_history'),
  ]);

  // Gather cloud data if authenticated
  let cloudData: ExportedData['cloudData'] = null;
  if (userId) {
    try {
      const userDoc = await getUserDoc(userId).get();
      const breaksSnapshot = await getBreaksCollection(userId).get();
      const breaks = breaksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      cloudData = {
        userDocument: userDoc.exists() ? userDoc.data() : null,
        breaks,
      };
    } catch {
      // Cloud data fetch failed — continue with local only
    }
  }

  const exportData: ExportedData = {
    exportDate: new Date().toISOString(),
    userId,
    profile: userStoreData ? JSON.parse(userStoreData) : null,
    settings: settingsData ? JSON.parse(settingsData) : null,
    breakHistory: breakHistory ? JSON.parse(breakHistory) : null,
    cloudData,
  };

  // Write to a temporary file
  const fileName = `microbreaks-data-${new Date().toISOString().split('T')[0]}.json`;
  const file = new File(Paths.cache, fileName);
  await file.write(JSON.stringify(exportData, null, 2));

  // Open share sheet
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Your MicroBreaks Data',
    });
  }
}
