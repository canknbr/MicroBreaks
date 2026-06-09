/**
 * UpgradeGateCard render tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { render, screen } from '../../utils/test-utils';
import UpgradeGateCard from '@/components/subscription/UpgradeGateCard';

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

describe('UpgradeGateCard', () => {
  beforeEach(() => {
    (router.push as jest.Mock).mockClear();
  });

  it('defaults the title and CTA from the required tier label', () => {
    render(
      <UpgradeGateCard requiredTier="pro" body="Get deeper recovery data." />
    );
    expect(screen.getByText(/Unlock Pro/)).toBeTruthy();
    expect(screen.getByText(/Upgrade to Pro/)).toBeTruthy();
  });

  it('renders body copy verbatim', () => {
    render(
      <UpgradeGateCard
        requiredTier="solo"
        body="A clear weekly recap of your wellness rhythm."
      />
    );
    expect(
      screen.getByText('A clear weekly recap of your wellness rhythm.')
    ).toBeTruthy();
  });

  it('honors title override', () => {
    render(
      <UpgradeGateCard
        requiredTier="family"
        title="Streak with family"
        body="Up to 6 members."
      />
    );
    expect(screen.getByText('Streak with family')).toBeTruthy();
  });

  it('routes to /subscription on press', () => {
    render(
      <UpgradeGateCard requiredTier="pro" body="Pro perks." placement="weekly_story" />
    );
    fireEvent.press(screen.getByTestId('upgrade-gate-cta'));
    expect(router.push).toHaveBeenCalledTimes(1);
  });
});
