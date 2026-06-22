import { fireEvent, render, screen } from '@/__tests__/utils/test-utils';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useTheme } from '@/hooks/useTheme';

function Harness({
  onEditPress = jest.fn(),
}: {
  onEditPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <ProfileCard
      profile={{ name: 'Can', avatar: '🙂' }}
      progress={{ totalBreaks: 42, totalXP: 360, currentStreak: 7 }}
      level={4}
      levelTitle="Focused"
      levelColors={['#06FFA5', '#00B4D8']}
      currentXP={60}
      xpProgress={60}
      profileStyle={{}}
      onEditPress={onEditPress}
      theme={theme}
    />
  );
}

describe('ProfileCard', () => {
  it('renders the user name, level title, and XP progress', () => {
    render(<Harness />);

    expect(screen.getByText('Can')).toBeTruthy();
    expect(screen.getByText('Focused')).toBeTruthy();
    expect(screen.getByText('60/100 XP')).toBeTruthy();
  });

  it('renders the lifetime stats row with labels', () => {
    render(<Harness />);

    expect(screen.getByText('42')).toBeTruthy();
    expect(screen.getByText('360')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('Total Breaks')).toBeTruthy();
    expect(screen.getByText('Total XP')).toBeTruthy();
    expect(screen.getByText('Day Streak')).toBeTruthy();
  });

  it('shows the level number in the badge', () => {
    render(<Harness />);

    expect(screen.getByText('4')).toBeTruthy();
  });

  it('invokes onEditPress when the avatar is tapped', () => {
    const onEditPress = jest.fn();
    render(<Harness onEditPress={onEditPress} />);

    fireEvent.press(screen.getByText('🙂'));

    expect(onEditPress).toHaveBeenCalled();
  });
});
