/**
 * TierSelector render tests
 */

import React, { useState } from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, screen } from '../../utils/test-utils';
import TierSelector from '@/components/subscription/TierSelector';
import type { Tier } from '@/services/subscription/tiers';

type PurchasableTier = Exclude<Tier, 'free'>;

function Harness({
  initial = 'pro',
  recommended,
  onChange,
}: {
  initial?: PurchasableTier;
  recommended?: PurchasableTier;
  onChange?: (t: PurchasableTier) => void;
}) {
  const [tier, setTier] = useState<PurchasableTier>(initial);
  return (
    <TierSelector
      selected={tier}
      recommended={recommended}
      onSelect={(next) => {
        setTier(next);
        onChange?.(next);
      }}
    />
  );
}

describe('TierSelector', () => {
  it('renders all three purchasable tiers', () => {
    render(<Harness />);
    expect(screen.getByTestId('tier-tab-solo')).toBeTruthy();
    expect(screen.getByTestId('tier-tab-pro')).toBeTruthy();
    expect(screen.getByTestId('tier-tab-family')).toBeTruthy();
  });

  it('marks the currently selected tab', () => {
    render(<Harness initial="family" />);
    expect(screen.getByTestId('tier-tab-family').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByTestId('tier-tab-solo').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  it('calls onSelect when a tab is pressed', () => {
    const onChange = jest.fn();
    render(<Harness initial="pro" onChange={onChange} />);
    fireEvent.press(screen.getByTestId('tier-tab-solo'));
    expect(onChange).toHaveBeenCalledWith('solo');
  });

  it('renders a recommended marker when a tier is highlighted', () => {
    render(<Harness initial="solo" recommended="pro" />);
    const label = screen.getByTestId('tier-tab-pro').props.accessibilityLabel as string;
    expect(label).toContain('Pro');
  });
});
