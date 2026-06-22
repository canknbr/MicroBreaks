import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { AboutSection } from '@/components/profile/AboutSection';
import { useTheme } from '@/hooks/useTheme';

function Harness({
  onPressSupport = jest.fn(),
  onPressPrivacyPolicy = jest.fn(),
  onPressTermsOfService = jest.fn(),
}: {
  onPressSupport?: () => void;
  onPressPrivacyPolicy?: () => void;
  onPressTermsOfService?: () => void;
}) {
  const theme = useTheme();
  return (
    <AboutSection
      onPressSupport={onPressSupport}
      onPressPrivacyPolicy={onPressPrivacyPolicy}
      onPressTermsOfService={onPressTermsOfService}
      theme={theme}
    />
  );
}

describe('AboutSection', () => {
  it('renders the header, all rows, and the version value', () => {
    render(<Harness />);

    expect(screen.getByText('ABOUT')).toBeTruthy();
    expect(screen.getByText('Help & Support')).toBeTruthy();
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
    expect(screen.getByText('Terms of Service')).toBeTruthy();
    expect(screen.getByText('Version')).toBeTruthy();
    expect(screen.getByText('1.0.0')).toBeTruthy();
  });

  it('invokes the support handler when the row is pressed', () => {
    const onPressSupport = jest.fn();
    render(<Harness onPressSupport={onPressSupport} />);

    fireEvent.press(screen.getByRole('button', { name: 'Help & Support' }));

    expect(onPressSupport).toHaveBeenCalled();
  });

  it('invokes the privacy policy handler when the row is pressed', () => {
    const onPressPrivacyPolicy = jest.fn();
    render(<Harness onPressPrivacyPolicy={onPressPrivacyPolicy} />);

    fireEvent.press(screen.getByRole('button', { name: 'Privacy Policy' }));

    expect(onPressPrivacyPolicy).toHaveBeenCalled();
  });

  it('invokes the terms of service handler when the row is pressed', () => {
    const onPressTermsOfService = jest.fn();
    render(<Harness onPressTermsOfService={onPressTermsOfService} />);

    fireEvent.press(screen.getByRole('button', { name: 'Terms of Service' }));

    expect(onPressTermsOfService).toHaveBeenCalled();
  });
});
