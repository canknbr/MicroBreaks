import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { AccountSection } from '@/components/profile/AccountSection';
import { useTheme } from '@/hooks/useTheme';

function Harness({
  isAuthenticated = false,
  emailVerified = false,
  onLinkEmail = jest.fn(),
  onSignIn = jest.fn(),
  onResendVerification = jest.fn(),
  onRefreshVerification = jest.fn(),
  onSendPasswordReset = jest.fn(),
}: {
  isAuthenticated?: boolean;
  emailVerified?: boolean;
  onLinkEmail?: () => void;
  onSignIn?: () => void;
  onResendVerification?: () => void;
  onRefreshVerification?: () => void;
  onSendPasswordReset?: () => void;
}) {
  const theme = useTheme();
  return (
    <AccountSection
      accountTypeLabel={isAuthenticated ? 'Linked' : 'Anonymous'}
      isAuthenticated={isAuthenticated}
      emailVerified={emailVerified}
      accountRecoveryLabel="user@example.com"
      accountVerificationLabel={emailVerified ? 'Verified' : 'Verification Needed'}
      onLinkEmail={onLinkEmail}
      onSignIn={onSignIn}
      onResendVerification={onResendVerification}
      onRefreshVerification={onRefreshVerification}
      onSendPasswordReset={onSendPasswordReset}
      theme={theme}
    />
  );
}

describe('AccountSection', () => {
  it('renders the anonymous account rows and footnote', () => {
    render(<Harness isAuthenticated={false} />);

    expect(screen.getByText('ACCOUNT')).toBeTruthy();
    expect(screen.getByText('Account Type')).toBeTruthy();
    expect(screen.getByText('Anonymous')).toBeTruthy();
    expect(screen.getByText('Secure My Progress')).toBeTruthy();
    expect(screen.getByText('Restore Linked Account')).toBeTruthy();
    expect(
      screen.getByText(
        'Link an email sign-in for this device, or sign in to restore a previously linked account.'
      )
    ).toBeTruthy();
  });

  it('invokes link and sign-in handlers from the anonymous rows', () => {
    const onLinkEmail = jest.fn();
    const onSignIn = jest.fn();
    render(<Harness isAuthenticated={false} onLinkEmail={onLinkEmail} onSignIn={onSignIn} />);

    fireEvent.press(screen.getByText('Secure My Progress'));
    expect(onLinkEmail).toHaveBeenCalled();

    fireEvent.press(screen.getByText('Restore Linked Account'));
    expect(onSignIn).toHaveBeenCalled();
  });

  it('renders authenticated rows when email is linked but unverified', () => {
    render(<Harness isAuthenticated emailVerified={false} />);

    expect(screen.getByText('Linked Email')).toBeTruthy();
    expect(screen.getByText('user@example.com')).toBeTruthy();
    expect(screen.getByText('Email Status')).toBeTruthy();
    expect(screen.getByText('Resend Verification Email')).toBeTruthy();
    expect(screen.getByText('Refresh Verification Status')).toBeTruthy();
    expect(screen.getByText('Send Password Reset Email')).toBeTruthy();
  });

  it('invokes the resend-verification handler', () => {
    const onResendVerification = jest.fn();
    render(<Harness isAuthenticated emailVerified={false} onResendVerification={onResendVerification} />);

    fireEvent.press(screen.getByText('Resend Verification Email'));

    expect(onResendVerification).toHaveBeenCalled();
  });
});
