import type { WeeklyRecoveryReport } from '@/hooks/useStatsData';

export type RecoveryStoryTone = 'positive' | 'steady' | 'attention';

export interface RecoveryStory {
  title: string;
  summary: string;
  nextStep: string;
  focusLabel: string;
  tone: RecoveryStoryTone;
  metrics: Array<{
    id: string;
    label: string;
    value: string;
  }>;
}

export function getPrimaryNeedLabel(painAreas: string[], breakStyle: string[]): string {
  if (painAreas.includes('eyes')) return 'eye relief';
  if (painAreas.includes('neck') || painAreas.includes('shoulders')) {
    return 'neck and shoulder relief';
  }
  if (painAreas.includes('upper_back') || painAreas.includes('lower_back')) {
    return 'posture recovery';
  }
  if (breakStyle.includes('mindful')) return 'focus recovery';
  if (breakStyle.includes('active')) return 'energy recovery';
  return 'desk recovery';
}

export function buildRecoveryStory({
  report,
  weekBreaks,
  todayBreaks,
  totalMinutes,
  currentStreak,
  primaryNeedLabel,
}: {
  report: WeeklyRecoveryReport | null;
  weekBreaks: number;
  todayBreaks: number;
  totalMinutes: number;
  currentStreak: number;
  primaryNeedLabel: string;
}): RecoveryStory {
  if (!report) {
    return {
      title: 'No recovery pattern yet',
      summary: `You have not logged any ${primaryNeedLabel} sessions yet, so there is no weekly rhythm to analyze.`,
      nextStep: `Start one short ${primaryNeedLabel} reset today so the app can begin building your recovery story.`,
      focusLabel: 'Start your first reset',
      tone: 'attention',
      metrics: [
        { id: 'today', label: 'Today', value: '0' },
        { id: 'week', label: 'This week', value: '0' },
        { id: 'streak', label: 'Streak', value: '0d' },
      ],
    };
  }

  const tone: RecoveryStoryTone =
    report.score >= 80 ? 'positive' : report.score >= 55 ? 'steady' : 'attention';

  let title = 'Your weekly recovery rhythm is building';
  if (report.score >= 85) {
    title = 'Your weekly recovery rhythm looks strong';
  } else if (report.score >= 65) {
    title = 'Your weekly recovery rhythm is holding together';
  } else if (report.score >= 45) {
    title = 'Your weekly recovery rhythm is still fragile';
  } else {
    title = 'Your weekly recovery rhythm needs a reset';
  }

  return {
    title,
    summary: report.summary,
    nextStep: report.recommendation,
    focusLabel: report.focusArea,
    tone,
    metrics: [
      { id: 'today', label: 'Today', value: `${todayBreaks}` },
      { id: 'week', label: 'This week', value: `${weekBreaks}` },
      { id: 'streak', label: 'Streak', value: `${currentStreak}d` },
      { id: 'minutes', label: 'Minutes', value: `${Math.round(totalMinutes)}m` },
    ],
  };
}
