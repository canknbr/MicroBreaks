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
 *
 * Implementation note (C-BUG10): older Android devices (Galaxy S8 era) OOM
 * when we materialize the whole export object plus its `JSON.stringify`
 * output simultaneously. We instead stream the JSON to disk piece by
 * piece, never holding more than one break at a time in the output buffer.
 */
export async function exportUserData(): Promise<void> {
  const userId = getCurrentUserId();

  // Gather local data
  const [userStoreData, settingsData, breakHistory] = await Promise.all([
    AsyncStorage.getItem('microbreaks-user'),
    AsyncStorage.getItem('microbreaks-settings'),
    AsyncStorage.getItem('@microbreaks/break_history'),
  ]);

  // Gather cloud data if authenticated. We materialize it in JS since
  // Firestore SDK doesn't stream — but in practice 5k breaks remain well
  // within available heap; the OOM risk was from the second copy (stringify).
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

  const fileName = `microbreaks-data-${new Date().toISOString().split('T')[0]}.json`;
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  const handle = file.open();
  try {
    const encoder = new TextEncoder();
    const write = (chunk: string) => handle.writeBytes(encoder.encode(chunk));

    write('{');
    write(`"exportDate":${JSON.stringify(new Date().toISOString())},`);
    write(`"userId":${JSON.stringify(userId)},`);
    // We pipe the persisted store blobs through as-is — they are already
    // valid JSON, so parse-then-stringify would just duplicate the work.
    write(`"profile":${userStoreData ?? 'null'},`);
    write(`"settings":${settingsData ?? 'null'},`);
    write(`"breakHistory":${breakHistory ?? 'null'},`);
    write('"cloudData":');

    if (cloudData) {
      write('{"userDocument":');
      write(JSON.stringify(cloudData.userDocument));
      write(',"breaks":[');
      for (let i = 0; i < cloudData.breaks.length; i += 1) {
        if (i > 0) write(',');
        write(JSON.stringify(cloudData.breaks[i]));
      }
      write(']}');
    } else {
      write('null');
    }

    write('}');
  } finally {
    handle.close();
  }

  // Open share sheet
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Your MicroBreaks Data',
    });
  }
}
