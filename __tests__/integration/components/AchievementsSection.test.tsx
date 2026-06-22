import { render, screen } from '@/__tests__/utils/test-utils';
import { AchievementsSection } from '@/components/profile/AchievementsSection';
import type { AchievementWithStatus } from '@/hooks/useAchievements';
import { useTheme } from '@/hooks/useTheme';

function makeAchievement(overrides: Partial<AchievementWithStatus>): AchievementWithStatus {
  return {
    id: 'first-break',
    title: 'First Step',
    description: 'Complete your first break',
    icon: '🌱',
    category: 'breaks',
    color: '#06FFA5',
    criteria: { type: 'total_breaks', value: 1 },
    xpReward: 10,
    isUnlocked: true,
    unlockedAt: '2026-01-01T00:00:00.000Z',
    progress: 100,
    ...overrides,
  };
}

function Harness({
  unlocked = [],
  next = [],
  stats = { unlocked: 0, total: 50 },
}: {
  unlocked?: AchievementWithStatus[];
  next?: AchievementWithStatus[];
  stats?: { unlocked: number; total: number };
}) {
  const theme = useTheme();
  return (
    <AchievementsSection
      achievementStats={stats}
      unlockedAchievements={unlocked}
      nextToUnlock={next}
      theme={theme}
    />
  );
}

describe('AchievementsSection', () => {
  it('renders the header and unlocked/total count', () => {
    render(<Harness stats={{ unlocked: 3, total: 50 }} />);

    expect(screen.getByText('ACHIEVEMENTS')).toBeTruthy();
    expect(screen.getByText('3/50')).toBeTruthy();
  });

  it('renders unlocked achievement titles', () => {
    const unlocked = [
      makeAchievement({ id: 'first-break', title: 'First Step' }),
      makeAchievement({ id: 'break-10', title: 'Getting Started' }),
    ];
    render(<Harness unlocked={unlocked} stats={{ unlocked: 2, total: 50 }} />);

    expect(screen.getByText('First Step')).toBeTruthy();
    expect(screen.getByText('Getting Started')).toBeTruthy();
  });

  it('shows the empty state when nothing is unlocked', () => {
    render(<Harness unlocked={[]} stats={{ unlocked: 0, total: 50 }} />);

    expect(screen.getByText('Complete breaks to earn achievements!')).toBeTruthy();
  });

  it('shows a +N badge when more than 5 achievements are unlocked', () => {
    const unlocked = Array.from({ length: 7 }, (_, i) =>
      makeAchievement({ id: `a-${i}`, title: `Achievement ${i}` })
    );
    render(<Harness unlocked={unlocked} stats={{ unlocked: 7, total: 50 }} />);

    expect(screen.getByText('+2')).toBeTruthy();
  });

  it('renders the next-to-unlock achievement with its progress', () => {
    const next = [
      makeAchievement({
        id: 'streak-7',
        title: 'Week Warrior',
        isUnlocked: false,
        unlockedAt: null,
        progress: 42,
      }),
    ];
    render(<Harness next={next} stats={{ unlocked: 0, total: 50 }} />);

    expect(screen.getByText('Next to unlock:')).toBeTruthy();
    expect(screen.getByText('Week Warrior')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
  });
});
