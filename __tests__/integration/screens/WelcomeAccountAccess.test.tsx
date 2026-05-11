import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { render } from '@/__tests__/utils/test-utils';
import WelcomeScreen from '@/app/(onboarding)/welcome';
import { useOnboardingStore } from '@/store/onboardingStore';

describe('welcome account access', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();

    act(() => {
      useOnboardingStore.setState({
        isComplete: false,
        currentStep: 0,
        totalSteps: useOnboardingStore.getState().totalSteps,
        data: {
          workRole: '',
          screenTime: 0,
          painAreas: [],
          painSeverity: {},
          workPattern: '',
          energyPattern: '',
          breakStyle: [],
          breakInterval: 25,
          notificationsEnabled: false,
          calendarIntegration: false,
        },
      });
    });
  });

  it('opens restore-account access from onboarding welcome', () => {
    render(<WelcomeScreen />);

    fireEvent.press(screen.getByText('Restore linked account'));

    expect(screen.getByText('Restore Existing')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
  });
});
