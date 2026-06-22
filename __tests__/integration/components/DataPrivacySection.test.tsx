import { fireEvent, render, screen, within } from '@/__tests__/utils/test-utils';
import { DataPrivacySection } from '@/components/profile/DataPrivacySection';
import { useTheme } from '@/hooks/useTheme';

function Harness({
  analyticsEnabled = false,
  crashReportingEnabled = false,
  onPressDownloadData = jest.fn(),
  onToggleAnalytics = jest.fn(),
  onToggleCrashReporting = jest.fn(),
  onPressDeleteAccount = jest.fn(),
}: {
  analyticsEnabled?: boolean;
  crashReportingEnabled?: boolean;
  onPressDownloadData?: () => void;
  onToggleAnalytics?: () => void;
  onToggleCrashReporting?: () => void;
  onPressDeleteAccount?: () => void;
}) {
  const theme = useTheme();
  return (
    <DataPrivacySection
      analyticsEnabled={analyticsEnabled}
      crashReportingEnabled={crashReportingEnabled}
      onPressDownloadData={onPressDownloadData}
      onToggleAnalytics={onToggleAnalytics}
      onToggleCrashReporting={onToggleCrashReporting}
      onPressDeleteAccount={onPressDeleteAccount}
      theme={theme}
    />
  );
}

describe('DataPrivacySection', () => {
  it('renders the header and all rows', () => {
    render(<Harness />);

    expect(screen.getByText('DATA & PRIVACY')).toBeTruthy();
    expect(screen.getByText('Download My Data')).toBeTruthy();
    expect(screen.getByText('Usage Analytics')).toBeTruthy();
    expect(screen.getByText('Crash Reporting')).toBeTruthy();
    expect(screen.getByText('Delete Account')).toBeTruthy();
  });

  it('invokes the download handler when the row is pressed', () => {
    const onPressDownloadData = jest.fn();
    render(<Harness onPressDownloadData={onPressDownloadData} />);

    fireEvent.press(screen.getByRole('button', { name: 'Download My Data' }));

    expect(onPressDownloadData).toHaveBeenCalled();
  });

  it('invokes the analytics toggle handler when the switch changes', () => {
    const onToggleAnalytics = jest.fn();
    render(<Harness onToggleAnalytics={onToggleAnalytics} />);

    const row = screen.getByRole('switch', { name: 'Usage Analytics' });
    const innerSwitch = within(row).getAllByRole('switch').find((el) => el !== row)!;
    fireEvent(innerSwitch, 'valueChange', true);

    expect(onToggleAnalytics).toHaveBeenCalled();
  });

  it('invokes the crash reporting toggle handler when the switch changes', () => {
    const onToggleCrashReporting = jest.fn();
    render(<Harness onToggleCrashReporting={onToggleCrashReporting} />);

    const row = screen.getByRole('switch', { name: 'Crash Reporting' });
    const innerSwitch = within(row).getAllByRole('switch').find((el) => el !== row)!;
    fireEvent(innerSwitch, 'valueChange', true);

    expect(onToggleCrashReporting).toHaveBeenCalled();
  });

  it('invokes the delete account handler when the row is pressed', () => {
    const onPressDeleteAccount = jest.fn();
    render(<Harness onPressDeleteAccount={onPressDeleteAccount} />);

    fireEvent.press(screen.getByRole('button', { name: 'Delete Account' }));

    expect(onPressDeleteAccount).toHaveBeenCalled();
  });
});
