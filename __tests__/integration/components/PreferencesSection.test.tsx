import { fireEvent, render, screen, within } from '@/__tests__/utils/test-utils';
import { PreferencesSection } from '@/components/profile/PreferencesSection';
import { useTheme } from '@/hooks/useTheme';

function Harness({
  themeLabel = 'System',
  soundEnabled = false,
  hapticsEnabled = false,
  voiceGuidanceEnabled = false,
  appleHealthMirrorEnabled = false,
  onPressTheme = jest.fn(),
  onToggleSound = jest.fn(),
  onToggleHaptics = jest.fn(),
  onToggleVoiceGuidance = jest.fn(),
  onToggleAppleHealth = jest.fn(),
  onPressStreakBuddies = jest.fn(),
}: {
  themeLabel?: string;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
  voiceGuidanceEnabled?: boolean;
  appleHealthMirrorEnabled?: boolean;
  onPressTheme?: () => void;
  onToggleSound?: () => void;
  onToggleHaptics?: () => void;
  onToggleVoiceGuidance?: () => void;
  onToggleAppleHealth?: () => void;
  onPressStreakBuddies?: () => void;
}) {
  const theme = useTheme();
  return (
    <PreferencesSection
      themeLabel={themeLabel}
      soundEnabled={soundEnabled}
      hapticsEnabled={hapticsEnabled}
      voiceGuidanceEnabled={voiceGuidanceEnabled}
      appleHealthMirrorEnabled={appleHealthMirrorEnabled}
      onPressTheme={onPressTheme}
      onToggleSound={onToggleSound}
      onToggleHaptics={onToggleHaptics}
      onToggleVoiceGuidance={onToggleVoiceGuidance}
      onToggleAppleHealth={onToggleAppleHealth}
      onPressStreakBuddies={onPressStreakBuddies}
      theme={theme}
    />
  );
}

describe('PreferencesSection', () => {
  it('renders the header, theme value, and preference rows', () => {
    render(<Harness themeLabel="Dark" />);

    expect(screen.getByText('PREFERENCES')).toBeTruthy();
    expect(screen.getByText('App Theme')).toBeTruthy();
    expect(screen.getByText('Dark')).toBeTruthy();
    expect(screen.getByText('Sounds')).toBeTruthy();
    expect(screen.getByText('Haptic Feedback')).toBeTruthy();
    expect(screen.getByText('Voice Guidance')).toBeTruthy();
    expect(screen.getByText('Streak Buddies')).toBeTruthy();
  });

  it('invokes the theme handler when the App Theme row is pressed', () => {
    const onPressTheme = jest.fn();
    render(<Harness themeLabel="Light" onPressTheme={onPressTheme} />);

    fireEvent.press(
      screen.getByRole('button', { name: 'App Theme, current value Light' }),
    );

    expect(onPressTheme).toHaveBeenCalled();
  });

  it('invokes the sound toggle handler when the switch changes', () => {
    const onToggleSound = jest.fn();
    render(<Harness onToggleSound={onToggleSound} />);

    const row = screen.getByRole('switch', { name: 'Sounds' });
    const innerSwitch = within(row).getAllByRole('switch').find((el) => el !== row)!;
    fireEvent(innerSwitch, 'valueChange', true);

    expect(onToggleSound).toHaveBeenCalled();
  });

  it('invokes the streak buddies handler when the row is pressed', () => {
    const onPressStreakBuddies = jest.fn();
    render(<Harness onPressStreakBuddies={onPressStreakBuddies} />);

    fireEvent.press(screen.getByRole('button', { name: 'Streak Buddies' }));

    expect(onPressStreakBuddies).toHaveBeenCalled();
  });

  it('invokes the apple health toggle handler when the switch changes (iOS)', () => {
    const onToggleAppleHealth = jest.fn();
    render(<Harness onToggleAppleHealth={onToggleAppleHealth} />);

    const row = screen.getByRole('switch', { name: 'Mirror to Apple Health' });
    const innerSwitch = within(row).getAllByRole('switch').find((el) => el !== row)!;
    fireEvent(innerSwitch, 'valueChange', true);

    expect(onToggleAppleHealth).toHaveBeenCalled();
  });
});
