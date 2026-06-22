import { fireEvent, render, screen, within } from '@/__tests__/utils/test-utils';
import { TimerSettingsSection } from '@/components/profile/TimerSettingsSection';
import { useTheme } from '@/hooks/useTheme';

function Harness({
  autoStartBreak = false,
  autoStartWork = false,
  onToggleAutoStartBreak = jest.fn(),
  onToggleAutoStartWork = jest.fn(),
}: {
  autoStartBreak?: boolean;
  autoStartWork?: boolean;
  onToggleAutoStartBreak?: () => void;
  onToggleAutoStartWork?: () => void;
}) {
  const theme = useTheme();
  return (
    <TimerSettingsSection
      autoStartBreak={autoStartBreak}
      autoStartWork={autoStartWork}
      onToggleAutoStartBreak={onToggleAutoStartBreak}
      onToggleAutoStartWork={onToggleAutoStartWork}
      theme={theme}
    />
  );
}

describe('TimerSettingsSection', () => {
  it('renders the header and both timer toggles', () => {
    render(<Harness />);

    expect(screen.getByText('FOCUS TIMER')).toBeTruthy();
    expect(screen.getByText('Auto-start Break')).toBeTruthy();
    expect(screen.getByText('Auto-start Work')).toBeTruthy();
  });

  it('invokes the break toggle handler when the switch changes', () => {
    const onToggleAutoStartBreak = jest.fn();
    render(<Harness onToggleAutoStartBreak={onToggleAutoStartBreak} />);

    const row = screen.getByRole('switch', { name: 'Auto-start Break' });
    const innerSwitch = within(row).getAllByRole('switch').find((el) => el !== row)!;
    fireEvent(innerSwitch, 'valueChange', true);

    expect(onToggleAutoStartBreak).toHaveBeenCalled();
  });

  it('invokes the work toggle handler when the switch changes', () => {
    const onToggleAutoStartWork = jest.fn();
    render(<Harness onToggleAutoStartWork={onToggleAutoStartWork} />);

    const row = screen.getByRole('switch', { name: 'Auto-start Work' });
    const innerSwitch = within(row).getAllByRole('switch').find((el) => el !== row)!;
    fireEvent(innerSwitch, 'valueChange', true);

    expect(onToggleAutoStartWork).toHaveBeenCalled();
  });
});
