import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { PremiumCard } from '@/components/profile/PremiumCard';
import type { PremiumHealthSummary } from '@/services/billing/healthSummary';

const healthSummary: PremiumHealthSummary = {
  label: 'Billing Ready',
  detail: 'Last sync 2026-06-22',
  icon: 'checkmark-circle',
  tone: 'healthy',
};

function Harness({ onPress = jest.fn() }: { onPress?: () => void }) {
  return (
    <PremiumCard
      premiumTitle="Go Pro"
      premiumDescription="Advanced insights, guided programs & more"
      premiumHealthSummary={healthSummary}
      premiumStyle={{}}
      onPress={onPress}
    />
  );
}

describe('PremiumCard', () => {
  it('renders the title and description', () => {
    render(<Harness />);

    expect(screen.getByText('Go Pro')).toBeTruthy();
    expect(screen.getByText('Advanced insights, guided programs & more')).toBeTruthy();
  });

  it('renders the billing health badge label and detail', () => {
    render(<Harness />);

    expect(screen.getByText('Billing Ready')).toBeTruthy();
    expect(screen.getByText('Last sync 2026-06-22')).toBeTruthy();
  });

  it('invokes onPress when the card is tapped', () => {
    const onPress = jest.fn();
    render(<Harness onPress={onPress} />);

    fireEvent.press(screen.getByText('Go Pro'));

    expect(onPress).toHaveBeenCalled();
  });
});
