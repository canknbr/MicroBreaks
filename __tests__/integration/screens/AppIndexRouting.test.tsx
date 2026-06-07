/**
 * Smoke test for the `app/index.tsx` redirect — the very first surface a
 * cold-start user sees. Seeds `app/` directory coverage (audit task
 * C-TEST1) and locks in the routing contract: hydrated + onboarding-done
 * → tabs, hydrated + onboarding-pending → onboarding welcome, not yet
 * hydrated → ActivityIndicator.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

import { useOnboardingStore } from '@/store/onboardingStore';

// `mock`-prefixed name is allowed inside the jest.mock factory.
const mockRedirectFn = jest.fn();

jest.mock('expo-router', () => ({
  Redirect: (props: { href: string }) => {
    mockRedirectFn(props.href);
    return null;
  },
}));

// eslint-disable-next-line import/first
import AppIndex from '@/app/index';

describe('app/index.tsx routing', () => {
  beforeEach(() => {
    mockRedirectFn.mockClear();
    // Make the persist API behave as already-hydrated for the tests that
    // need a deterministic, non-flickery render.
    useOnboardingStore.persist.rehydrate?.();
  });

  it('redirects to the onboarding welcome when onboarding is not complete', () => {
    useOnboardingStore.setState((state) => ({
      ...state,
      isComplete: false,
    }));

    render(<AppIndex />);

    expect(mockRedirectFn).toHaveBeenCalledWith('/(onboarding)/welcome');
  });

  it('redirects to the tabs once onboarding is complete', () => {
    useOnboardingStore.setState((state) => ({
      ...state,
      isComplete: true,
    }));

    render(<AppIndex />);

    expect(mockRedirectFn).toHaveBeenCalledWith('/(tabs)');
  });
});
