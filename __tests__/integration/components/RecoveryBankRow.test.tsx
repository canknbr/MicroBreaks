import { render, screen } from '@/__tests__/utils/test-utils';
import RecoveryBankRow from '@/components/home/RecoveryBankRow';
import { useUserStore } from '@/store/userStore';

function setRecoveryBank(recoveryBankSince: string | null, recoveryMinutes: number) {
  useUserStore.setState({
    progress: {
      ...useUserStore.getState().progress,
      recoveryMinutes,
      recoveryBankSince,
    },
  });
}

describe('RecoveryBankRow', () => {
  it('renders nothing when the recovery bank has not started', () => {
    setRecoveryBank(null, 0);

    render(<RecoveryBankRow />);

    expect(screen.queryByText('RECOVERY BANK')).toBeNull();
  });

  it('renders the recovery bank once it has started accruing', () => {
    setRecoveryBank('2026-01-01T00:00:00.000Z', 180);

    render(<RecoveryBankRow />);

    expect(screen.getByText('RECOVERY BANK')).toBeTruthy();
    expect(screen.getByText('3h')).toBeTruthy();
  });
});
