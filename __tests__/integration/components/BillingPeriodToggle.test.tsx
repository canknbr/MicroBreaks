/**
 * BillingPeriodToggle render tests
 */

import React, { useState } from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, screen } from '../../utils/test-utils';
import BillingPeriodToggle, {
  type BillingPeriod,
} from '@/components/subscription/BillingPeriodToggle';

function Harness({
  initial = 'yearly',
  annualSavingsLabel,
  onChange,
}: {
  initial?: BillingPeriod;
  annualSavingsLabel?: string;
  onChange?: (p: BillingPeriod) => void;
}) {
  const [period, setPeriod] = useState<BillingPeriod>(initial);
  return (
    <BillingPeriodToggle
      selected={period}
      annualSavingsLabel={annualSavingsLabel}
      onSelect={(next) => {
        setPeriod(next);
        onChange?.(next);
      }}
    />
  );
}

describe('BillingPeriodToggle', () => {
  it('renders both pills with sensible labels', () => {
    render(<Harness />);
    expect(screen.getByTestId('billing-period-monthly')).toBeTruthy();
    expect(screen.getByTestId('billing-period-yearly')).toBeTruthy();
    expect(screen.getByText('Monthly')).toBeTruthy();
    expect(screen.getByText('Annual')).toBeTruthy();
  });

  it('marks the selected period', () => {
    render(<Harness initial="monthly" />);
    expect(screen.getByTestId('billing-period-monthly').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByTestId('billing-period-yearly').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  it('shows the savings label only when provided', () => {
    const { rerender, queryByText } = render(<Harness />);
    expect(queryByText(/save/i)).toBeNull();

    rerender(<Harness annualSavingsLabel="Save 50%" />);
    expect(screen.getByText('Save 50%')).toBeTruthy();
  });

  it('calls onSelect when a pill is pressed', () => {
    const onChange = jest.fn();
    render(<Harness initial="yearly" onChange={onChange} />);
    fireEvent.press(screen.getByTestId('billing-period-monthly'));
    expect(onChange).toHaveBeenCalledWith('monthly');
  });
});
