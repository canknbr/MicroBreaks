/**
 * useDailyMissions
 *
 * Thin React hook wrapping `useMissionsStore`. Returns today's
 * mission set + the bonus XP already earned, and runs a rollover on
 * mount so a session that started yesterday still shows today's
 * missions the moment the user opens the app.
 */

import { useEffect } from 'react';
import { useMissionsStore } from '@/store/missionsStore';
import type { Mission } from '@/services/missions/types';

export interface DailyMissionsView {
  missions: Mission[];
  dayStart: string;
  bonusXPEarned: number;
  /** Count of missions completed today. */
  completedCount: number;
}

export function useDailyMissions(): DailyMissionsView {
  const missions = useMissionsStore((s) => s.missions);
  const dayStart = useMissionsStore((s) => s.dayStart);
  const bonusXPEarned = useMissionsStore((s) => s.bonusXPEarned);
  const rolloverIfNeeded = useMissionsStore((s) => s.rolloverIfNeeded);

  useEffect(() => {
    rolloverIfNeeded(new Date());
  }, [rolloverIfNeeded]);

  return {
    missions,
    dayStart,
    bonusXPEarned,
    completedCount: missions.filter((m) => m.completed).length,
  };
}
