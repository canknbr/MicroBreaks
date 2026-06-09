import {
  __setEntitlementFirestoreForTests,
  fetchCurrentEntitlement,
  subscribeToEntitlement,
} from '@/services/entitlements/reader';
import {
  EMPTY_ENTITLEMENT,
  ENTITLEMENT_SCHEMA_VERSION,
  type EntitlementDoc,
} from '@/services/entitlements/types';

function makeDoc(overrides: Partial<EntitlementDoc> = {}): EntitlementDoc {
  return {
    schemaVersion: ENTITLEMENT_SCHEMA_VERSION,
    tier: 'pro',
    status: 'active',
    productId: 'pro_annual',
    billingPeriod: 'yearly',
    purchasedAt: '2026-01-01T00:00:00Z',
    expiresAt: '2027-01-01T00:00:00Z',
    inTrial: false,
    trialEndsAt: null,
    store: 'app_store',
    originalTransactionId: 'tx-1',
    lastEventType: 'INITIAL_PURCHASE',
    lastEventAt: 1_700_000_000_000,
    ...overrides,
  };
}

interface SnapshotShape {
  exists: boolean;
  data: () => unknown;
}

interface MockDocRef {
  get: jest.Mock<Promise<SnapshotShape>, []>;
  onSnapshot: jest.Mock<
    () => void,
    [(snap: SnapshotShape) => void, ((err: Error) => void)?]
  >;
}

function makeRef(initial: SnapshotShape | null): MockDocRef {
  return {
    get: jest.fn().mockResolvedValue(
      initial ?? { exists: false, data: () => undefined }
    ),
    onSnapshot: jest.fn(),
  };
}

afterEach(() => {
  __setEntitlementFirestoreForTests(null);
});

describe('fetchCurrentEntitlement', () => {
  it('returns the doc when one exists and the schema matches', async () => {
    const doc = makeDoc({ tier: 'family' });
    const ref = makeRef({ exists: true, data: () => doc });
    __setEntitlementFirestoreForTests({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getEntitlementDoc: () => ref as any,
    });

    const result = await fetchCurrentEntitlement('uid-1');
    expect(result.tier).toBe('family');
    expect(result.status).toBe('active');
  });

  it('returns EMPTY when the doc does not exist', async () => {
    const ref = makeRef({ exists: false, data: () => undefined });
    __setEntitlementFirestoreForTests({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getEntitlementDoc: () => ref as any,
    });

    const result = await fetchCurrentEntitlement('uid-1');
    expect(result).toEqual(EMPTY_ENTITLEMENT);
  });

  it('returns EMPTY when the doc schema does not match this build', async () => {
    const stale = makeDoc({ schemaVersion: ENTITLEMENT_SCHEMA_VERSION + 1 });
    const ref = makeRef({ exists: true, data: () => stale });
    __setEntitlementFirestoreForTests({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getEntitlementDoc: () => ref as any,
    });

    const result = await fetchCurrentEntitlement('uid-1');
    expect(result).toEqual(EMPTY_ENTITLEMENT);
  });

  it('returns EMPTY when the doc is malformed', async () => {
    const ref = makeRef({
      exists: true,
      data: () => ({ random: 'nonsense' }),
    });
    __setEntitlementFirestoreForTests({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getEntitlementDoc: () => ref as any,
    });

    const result = await fetchCurrentEntitlement('uid-1');
    expect(result).toEqual(EMPTY_ENTITLEMENT);
  });

  it('returns EMPTY when the read throws', async () => {
    const ref = {
      get: jest.fn().mockRejectedValue(new Error('permission-denied')),
      onSnapshot: jest.fn(),
    };
    __setEntitlementFirestoreForTests({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getEntitlementDoc: () => ref as any,
    });

    const result = await fetchCurrentEntitlement('uid-1');
    expect(result).toEqual(EMPTY_ENTITLEMENT);
  });

  it('returns EMPTY when no userId provided', async () => {
    __setEntitlementFirestoreForTests({
      getEntitlementDoc: jest.fn(),
    });
    const result = await fetchCurrentEntitlement('');
    expect(result).toEqual(EMPTY_ENTITLEMENT);
  });
});

describe('subscribeToEntitlement', () => {
  it('forwards snapshot updates and returns an unsubscribe handle', () => {
    let captured: ((snap: SnapshotShape) => void) | null = null;
    const unsub = jest.fn();
    const ref = {
      get: jest.fn(),
      onSnapshot: jest.fn((onNext) => {
        captured = onNext;
        return unsub;
      }),
    };
    __setEntitlementFirestoreForTests({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getEntitlementDoc: () => ref as any,
    });

    const seen: EntitlementDoc[] = [];
    const handle = subscribeToEntitlement('uid-1', (doc) => seen.push(doc));

    expect(captured).not.toBeNull();
    captured!({ exists: true, data: () => makeDoc({ tier: 'solo' }) });
    expect(seen).toHaveLength(1);
    expect(seen[0].tier).toBe('solo');

    handle.unsubscribe();
    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('emits EMPTY when the snapshot has no doc', () => {
    let captured: ((snap: SnapshotShape) => void) | null = null;
    const ref = {
      get: jest.fn(),
      onSnapshot: jest.fn((onNext) => {
        captured = onNext;
        return jest.fn();
      }),
    };
    __setEntitlementFirestoreForTests({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getEntitlementDoc: () => ref as any,
    });

    const seen: EntitlementDoc[] = [];
    subscribeToEntitlement('uid-1', (doc) => seen.push(doc));
    captured!({ exists: false, data: () => undefined });

    expect(seen[0]).toEqual(EMPTY_ENTITLEMENT);
  });

  it('emits EMPTY when the snapshot listener reports an error', () => {
    const onSnapshotCalls: Array<(err: Error) => void> = [];
    const ref = {
      get: jest.fn(),
      onSnapshot: jest.fn((_onNext, onError) => {
        if (onError) onSnapshotCalls.push(onError);
        return jest.fn();
      }),
    };
    __setEntitlementFirestoreForTests({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getEntitlementDoc: () => ref as any,
    });

    const seen: EntitlementDoc[] = [];
    subscribeToEntitlement('uid-1', (doc) => seen.push(doc));
    expect(onSnapshotCalls).toHaveLength(1);
    onSnapshotCalls[0](new Error('boom'));
    expect(seen[0]).toEqual(EMPTY_ENTITLEMENT);
  });

  it('returns a no-op unsubscribe when no userId is provided', () => {
    __setEntitlementFirestoreForTests({
      getEntitlementDoc: jest.fn(),
    });
    let last: EntitlementDoc | null = null;
    const handle = subscribeToEntitlement('', (doc) => {
      last = doc;
    });
    expect(last).toEqual(EMPTY_ENTITLEMENT);
    expect(() => handle.unsubscribe()).not.toThrow();
  });
});
