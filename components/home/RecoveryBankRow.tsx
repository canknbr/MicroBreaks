import { View } from 'react-native';
import { useUserStore } from '@/store/userStore';
import RecoveryBank from './RecoveryBank';

export default function RecoveryBankRow() {
  const recoveryMinutes = useUserStore(
    (state) => state.progress.recoveryMinutes,
  );
  const recoveryBankSince = useUserStore(
    (state) => state.progress.recoveryBankSince,
  );
  if (!recoveryBankSince) return null;
  return (
    <View style={{ marginTop: 12 }}>
      <RecoveryBank minutes={recoveryMinutes} since={recoveryBankSince} />
    </View>
  );
}
