import { getCurrentUserId } from '@/services/firebase/auth';
import {
  clearLocalSessionState,
  replaceWithFreshAnonymousSession,
} from './sessionReset';

export async function clearLocalAppState(): Promise<void> {
  await clearLocalSessionState();
}

export async function resetToFreshAnonymousSession(): Promise<string | null> {
  await replaceWithFreshAnonymousSession();
  return getCurrentUserId();
}

export async function deleteCurrentAccountAndReset(): Promise<string | null> {
  await replaceWithFreshAnonymousSession({ deleteRemoteUserData: true });
  return getCurrentUserId();
}
