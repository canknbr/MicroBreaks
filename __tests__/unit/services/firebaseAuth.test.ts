import auth from '@react-native-firebase/auth';
import {
  deleteAuthAccount,
  getAuthErrorMessage,
  getCurrentUserEmail,
  isCurrentUserEmailVerified,
  getCurrentUserId,
  initializeAuth,
  isCurrentUserAnonymous,
  linkCurrentAnonymousUserWithEmail,
  onAuthStateChanged,
  refreshAnonymousSession,
  reloadCurrentUser,
  sendCurrentUserEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailPassword,
  signOut,
} from '@/services/firebase/auth';

type MockUser = {
  uid: string;
  email?: string | null;
  isAnonymous?: boolean;
  emailVerified?: boolean;
  delete?: jest.Mock;
  linkWithCredential?: jest.Mock;
  sendEmailVerification?: jest.Mock;
  reload?: jest.Mock;
};

type MockAuthInstance = {
  signInAnonymously: jest.Mock;
  signInWithEmailAndPassword: jest.Mock;
  sendPasswordResetEmail: jest.Mock;
  currentUser: MockUser | null;
  onAuthStateChanged: jest.Mock;
  onUserChanged?: jest.Mock;
  signOut: jest.Mock;
};

const authFactory = auth as unknown as jest.Mock & {
  EmailAuthProvider: {
    credential: jest.Mock;
  };
};

function getMockAuthInstance(): MockAuthInstance {
  return authFactory() as MockAuthInstance;
}

describe('firebase auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const authInstance = getMockAuthInstance();
    authInstance.currentUser = null;
    authInstance.signInAnonymously = jest.fn(() => {
      const user = { uid: 'anon-user', isAnonymous: true, email: null };
      authInstance.currentUser = user;
      return Promise.resolve({ user });
    });
    authInstance.signInWithEmailAndPassword = jest.fn((email: string, password: string) => {
      const user = {
        uid: 'email-user',
        isAnonymous: false,
        email,
        password,
        emailVerified: false,
        reload: jest.fn(() => Promise.resolve()),
        sendEmailVerification: jest.fn(() => Promise.resolve()),
      };
      authInstance.currentUser = user;
      return Promise.resolve({ user });
    });
    authInstance.sendPasswordResetEmail = jest.fn(() => Promise.resolve());
    authInstance.signOut = jest.fn(() => Promise.resolve());
    authInstance.onAuthStateChanged = jest.fn(() => jest.fn());
    authInstance.onUserChanged = undefined;

    authFactory.EmailAuthProvider = {
      credential: jest.fn((email: string, password: string) => ({
        providerId: 'password',
        email,
        password,
      })),
    };
  });

  it('initializes an anonymous user when no session exists', async () => {
    const user = await initializeAuth();

    expect(user?.uid).toBe('anon-user');
    expect(getMockAuthInstance().signInAnonymously).toHaveBeenCalledTimes(1);
  });

  it('reuses the current session when one already exists', async () => {
    getMockAuthInstance().currentUser = {
      uid: 'existing-user',
      isAnonymous: false,
      email: 'existing@example.com',
      emailVerified: true,
    };

    const user = await initializeAuth();

    expect(user?.uid).toBe('existing-user');
    expect(getMockAuthInstance().signInAnonymously).not.toHaveBeenCalled();
  });

  it('exposes current user helpers', () => {
    getMockAuthInstance().currentUser = {
      uid: 'helper-user',
      isAnonymous: false,
      email: 'helper@example.com',
      emailVerified: true,
    };

    expect(getCurrentUserId()).toBe('helper-user');
    expect(getCurrentUserEmail()).toBe('helper@example.com');
    expect(isCurrentUserEmailVerified()).toBe(true);
    expect(isCurrentUserAnonymous()).toBe(false);
  });

  it('prefers user-changed events when available', () => {
    const unsubscribe = jest.fn();
    const authInstance = getMockAuthInstance();
    authInstance.onUserChanged = jest.fn(() => unsubscribe);

    const result = onAuthStateChanged(jest.fn());

    expect(authInstance.onUserChanged).toHaveBeenCalledTimes(1);
    expect(authInstance.onAuthStateChanged).not.toHaveBeenCalled();
    expect(result).toBe(unsubscribe);
  });

  it('links the current anonymous user with email credentials', async () => {
    const linkedUser = {
      uid: 'linked-user',
      email: 'user@example.com',
      isAnonymous: false,
      emailVerified: false,
    };
    const currentUser: MockUser = {
      uid: 'anon-user',
      email: null,
      isAnonymous: true,
      linkWithCredential: jest.fn(() => Promise.resolve({ user: linkedUser })),
    };
    getMockAuthInstance().currentUser = currentUser;

    const result = await linkCurrentAnonymousUserWithEmail(' User@Example.com ', 'secret123');

    expect(authFactory.EmailAuthProvider.credential).toHaveBeenCalledWith('user@example.com', 'secret123');
    expect(currentUser.linkWithCredential).toHaveBeenCalledWith({
      providerId: 'password',
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(result).toEqual(linkedUser);
  });

  it('rejects linking when the active user is already permanent', async () => {
    getMockAuthInstance().currentUser = {
      uid: 'linked-user',
      email: 'linked@example.com',
      isAnonymous: false,
      emailVerified: true,
      linkWithCredential: jest.fn(),
    };

    await expect(
      linkCurrentAnonymousUserWithEmail('linked@example.com', 'secret123')
    ).rejects.toThrow('already linked');
  });

  it('rejects invalid email/password input before linking', async () => {
    getMockAuthInstance().currentUser = {
      uid: 'anon-user',
      email: null,
      isAnonymous: true,
      linkWithCredential: jest.fn(),
    };

    await expect(linkCurrentAnonymousUserWithEmail('', '123')).rejects.toThrow('Email is required');
    await expect(linkCurrentAnonymousUserWithEmail('user@example.com', '123')).rejects.toThrow(
      'Password must be at least 6 characters'
    );
  });

  it('signs in with normalized email/password credentials', async () => {
    const user = await signInWithEmailPassword(' Test@Example.com ', 'secret123');

    expect(getMockAuthInstance().signInWithEmailAndPassword).toHaveBeenCalledWith(
      'test@example.com',
      'secret123'
    );
    expect(user.uid).toBe('email-user');
    expect(getCurrentUserEmail()).toBe('test@example.com');
  });

  it('refreshes the anonymous session by signing out first', async () => {
    getMockAuthInstance().currentUser = {
      uid: 'existing-user',
      isAnonymous: false,
      email: 'existing@example.com',
      emailVerified: true,
    };

    const user = await refreshAnonymousSession();

    expect(getMockAuthInstance().signOut).toHaveBeenCalledTimes(1);
    expect(getMockAuthInstance().signInAnonymously).toHaveBeenCalledTimes(1);
    expect(user?.uid).toBe('anon-user');
  });

  it('deletes the active auth account', async () => {
    const deleteMock = jest.fn(() => Promise.resolve());
    getMockAuthInstance().currentUser = {
      uid: 'delete-user',
      isAnonymous: false,
      email: 'delete@example.com',
      emailVerified: true,
      delete: deleteMock,
    };

    await deleteAuthAccount();

    expect(deleteMock).toHaveBeenCalledTimes(1);
  });

  it('signs out the current user session', async () => {
    await signOut();

    expect(getMockAuthInstance().signOut).toHaveBeenCalledTimes(1);
  });

  it('reloads the current user when refreshing account state', async () => {
    const reload = jest.fn(() => Promise.resolve());
    const user = {
      uid: 'reload-user',
      isAnonymous: false,
      email: 'reload@example.com',
      emailVerified: false,
      reload,
    };
    getMockAuthInstance().currentUser = user;

    const result = await reloadCurrentUser();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(result).toBe(user);
  });

  it('sends a verification email for an unverified linked account', async () => {
    const sendVerification = jest.fn(() => Promise.resolve());
    getMockAuthInstance().currentUser = {
      uid: 'verify-user',
      isAnonymous: false,
      email: 'verify@example.com',
      emailVerified: false,
      sendEmailVerification: sendVerification,
    };

    await sendCurrentUserEmailVerification();

    expect(sendVerification).toHaveBeenCalledTimes(1);
  });

  it('sends a password reset email with normalized credentials', async () => {
    await sendPasswordResetEmail(' Reset@Example.com ');

    expect(getMockAuthInstance().sendPasswordResetEmail).toHaveBeenCalledWith('reset@example.com');
  });

  it('maps Firebase auth errors to user-friendly copy', () => {
    expect(
      getAuthErrorMessage({ code: 'auth/email-already-in-use' }, 'link')
    ).toContain('already in use');
    expect(
      getAuthErrorMessage({ code: 'auth/network-request-failed' }, 'sign_in')
    ).toContain('Network unavailable');
    expect(getAuthErrorMessage(new Error('fallback message'))).toBe('fallback message');
  });
});
