import { fireEvent, render, screen, within } from '@/__tests__/utils/test-utils';
import { NotificationsSection } from '@/components/profile/NotificationsSection';
import { useTheme } from '@/hooks/useTheme';
import type { ReminderDecisionRecord } from '@/services/notifications/diagnostics';

function Harness({
  enabled = true,
  breakReminders = true,
  reminderIntervalMinutes = 5,
  streakAlerts = false,
  goalNotifications = false,
  quietHoursEnabled = false,
  reminderDecision = null,
  quietHoursLabel = '10 PM - 7 AM',
  onToggleNotifications = jest.fn(),
  onToggleBreakReminders = jest.fn(),
  onPressReminderInterval = jest.fn(),
  onToggleStreakAlerts = jest.fn(),
  onToggleGoalNotifications = jest.fn(),
  onToggleQuietHours = jest.fn(),
}: {
  enabled?: boolean;
  breakReminders?: boolean;
  reminderIntervalMinutes?: number;
  streakAlerts?: boolean;
  goalNotifications?: boolean;
  quietHoursEnabled?: boolean;
  reminderDecision?: ReminderDecisionRecord | null;
  quietHoursLabel?: string;
  onToggleNotifications?: () => void;
  onToggleBreakReminders?: () => void;
  onPressReminderInterval?: () => void;
  onToggleStreakAlerts?: () => void;
  onToggleGoalNotifications?: () => void;
  onToggleQuietHours?: () => void;
}) {
  const theme = useTheme();
  return (
    <NotificationsSection
      enabled={enabled}
      breakReminders={breakReminders}
      reminderIntervalMinutes={reminderIntervalMinutes}
      streakAlerts={streakAlerts}
      goalNotifications={goalNotifications}
      quietHoursEnabled={quietHoursEnabled}
      reminderDecision={reminderDecision}
      quietHoursLabel={quietHoursLabel}
      onToggleNotifications={onToggleNotifications}
      onToggleBreakReminders={onToggleBreakReminders}
      onPressReminderInterval={onPressReminderInterval}
      onToggleStreakAlerts={onToggleStreakAlerts}
      onToggleGoalNotifications={onToggleGoalNotifications}
      onToggleQuietHours={onToggleQuietHours}
      theme={theme}
    />
  );
}

describe('NotificationsSection', () => {
  it('renders the header, all rows, and the reminder interval value', () => {
    render(<Harness reminderIntervalMinutes={15} />);

    expect(screen.getByText('NOTIFICATIONS')).toBeTruthy();
    expect(screen.getByText('Push Notifications')).toBeTruthy();
    expect(screen.getByText('Break Reminders')).toBeTruthy();
    expect(screen.getByText('Reminder Interval')).toBeTruthy();
    expect(screen.getByText('15 min')).toBeTruthy();
    expect(screen.getByText('Streak Alerts')).toBeTruthy();
    expect(screen.getByText('Goal Notifications')).toBeTruthy();
    expect(screen.getByText('Quiet Hours')).toBeTruthy();
  });

  it('invokes the push notifications toggle handler when the switch changes', () => {
    const onToggleNotifications = jest.fn();
    render(<Harness onToggleNotifications={onToggleNotifications} />);

    const row = screen.getByRole('switch', { name: 'Push Notifications' });
    const innerSwitch = within(row).getAllByRole('switch').find((el) => el !== row)!;
    fireEvent(innerSwitch, 'valueChange', true);

    expect(onToggleNotifications).toHaveBeenCalled();
  });

  it('invokes the reminder interval handler when the row is pressed', () => {
    const onPressReminderInterval = jest.fn();
    render(
      <Harness
        enabled
        breakReminders
        reminderIntervalMinutes={5}
        onPressReminderInterval={onPressReminderInterval}
      />,
    );

    fireEvent.press(
      screen.getByRole('button', { name: 'Reminder Interval, current value 5 min' }),
    );

    expect(onPressReminderInterval).toHaveBeenCalled();
  });

  it('shows the disabled hint and hides the quiet-hours info when notifications are off', () => {
    render(<Harness enabled={false} quietHoursEnabled quietHoursLabel="10 PM - 7 AM" />);

    expect(
      screen.getByText('Turn on Push Notifications to manage the options below.'),
    ).toBeTruthy();
    expect(screen.queryByText('No notifications 10 PM - 7 AM')).toBeNull();
  });

  it('shows the quiet-hours window when enabled', () => {
    render(<Harness enabled quietHoursEnabled quietHoursLabel="9 PM - 6 AM" />);

    expect(screen.getByText('No notifications 9 PM - 6 AM')).toBeTruthy();
  });

  it('shows the reminder decision summary when present and notifications are on', () => {
    const reminderDecision: ReminderDecisionRecord = {
      kind: 'scheduled',
      recordedAt: '2026-06-22T10:00:00.000Z',
      summary: 'Next reminder scheduled in 25 min',
    };
    render(<Harness enabled reminderDecision={reminderDecision} />);

    expect(screen.getByText('Next reminder scheduled in 25 min')).toBeTruthy();
  });
});
