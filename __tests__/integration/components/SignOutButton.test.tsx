import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { SignOutButton } from '@/components/profile/SignOutButton';

describe('SignOutButton', () => {
  it('renders the sign out label', () => {
    render(<SignOutButton onPress={jest.fn()} />);

    expect(screen.getByText('Sign Out')).toBeTruthy();
  });

  it('invokes the handler when pressed', () => {
    const onPress = jest.fn();
    render(<SignOutButton onPress={onPress} />);

    fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));

    expect(onPress).toHaveBeenCalled();
  });
});
