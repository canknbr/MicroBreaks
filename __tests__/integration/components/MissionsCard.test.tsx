/**
 * MissionsCard Integration Tests
 * Renders the home-screen card with a few representative mission
 * states and verifies the visible/a11y surface.
 */

import React from 'react';
import { render, screen } from '../../utils/test-utils';
import MissionsCard from '@/components/home/MissionsCard';
import type { Mission } from '@/services/missions/types';

function mission(overrides: Partial<Mission> = {}): Mission {
  return {
    id: 'm-1',
    kind: 'take_breaks',
    target: 3,
    progress: 0,
    completed: false,
    completedAt: null,
    bonusXP: 10,
    description: 'Take 3 breaks today',
    ...overrides,
  };
}

describe('MissionsCard', () => {
  it('renders nothing when there are no missions', () => {
    const { queryByText } = render(
      <MissionsCard missions={[]} bonusXPEarned={0} completedCount={0} />
    );
    expect(queryByText(/missions/i)).toBeNull();
  });

  it('renders all mission descriptions', () => {
    render(
      <MissionsCard
        missions={[
          mission({ id: 'a', description: 'Take 3 breaks today' }),
          mission({ id: 'b', description: 'Take a break before noon', kind: 'morning_break' }),
          mission({ id: 'c', description: 'Take a 3-minute break', kind: 'long_break' }),
        ]}
        bonusXPEarned={0}
        completedCount={0}
      />
    );
    expect(screen.getByText('Take 3 breaks today')).toBeTruthy();
    expect(screen.getByText('Take a break before noon')).toBeTruthy();
    expect(screen.getByText('Take a 3-minute break')).toBeTruthy();
  });

  it('shows the XP chip only when bonus XP is earned', () => {
    const props = {
      missions: [mission()],
      completedCount: 0,
    };
    const { rerender, queryByText } = render(
      <MissionsCard {...props} bonusXPEarned={0} />
    );
    expect(queryByText(/\+\d+ XP/)).toBeNull();

    rerender(<MissionsCard {...props} bonusXPEarned={25} />);
    expect(screen.getByText('+25 XP')).toBeTruthy();
  });

  it('shows the all-done strip once every mission is complete', () => {
    const completedMissions = [
      mission({ id: 'a', completed: true, progress: 3 }),
      mission({ id: 'b', completed: true, progress: 1, target: 1 }),
    ];
    render(
      <MissionsCard
        missions={completedMissions}
        bonusXPEarned={50}
        completedCount={2}
      />
    );
    expect(screen.getByText(/All missions cleared/i)).toBeTruthy();
  });

  it('renders the headline progress counter', () => {
    render(
      <MissionsCard
        missions={[
          mission({ id: 'a', completed: true }),
          mission({ id: 'b' }),
          mission({ id: 'c' }),
        ]}
        bonusXPEarned={10}
        completedCount={1}
      />
    );
    expect(screen.getByText('1/3')).toBeTruthy();
  });
});
