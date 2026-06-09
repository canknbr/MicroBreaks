import {
  __resetWinbackForTests,
  dismissWinback,
  isWinbackDismissed,
} from '@/services/subscription/winbackState';

describe('winbackState', () => {
  beforeEach(() => {
    __resetWinbackForTests();
  });

  it('starts as not dismissed', () => {
    expect(isWinbackDismissed()).toBe(false);
  });

  it('flips to dismissed after dismissWinback()', () => {
    dismissWinback();
    expect(isWinbackDismissed()).toBe(true);
  });

  it('reset clears the dismissed flag (test seam)', () => {
    dismissWinback();
    __resetWinbackForTests();
    expect(isWinbackDismissed()).toBe(false);
  });
});
