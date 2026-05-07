const mockCommit = jest.fn(() => Promise.resolve());
const mockBatchDelete = jest.fn();
const mockBatch = jest.fn(() => ({
  delete: mockBatchDelete,
  commit: mockCommit,
}));
const mockBreaksDocs = Array.from({ length: 901 }, (_, index) => ({
  ref: { id: `break-${index}` },
}));
const mockDeviceDocs = Array.from({ length: 2 }, (_, index) => ({
  ref: { id: `device-${index}` },
}));
const mockBreaksGet = jest.fn(() =>
  Promise.resolve({
    docs: mockBreaksDocs,
  })
);
const mockDevicesGet = jest.fn(() =>
  Promise.resolve({
    docs: mockDeviceDocs,
  })
);
const mockUserDelete = jest.fn(() => Promise.resolve());
const mockUserDocRef = {
  collection: jest.fn((name: string) => {
    if (name === 'devices') {
      return {
        get: mockDevicesGet,
      };
    }

    return {
      get: mockBreaksGet,
    };
  }),
  delete: mockUserDelete,
};
const mockUsersCollectionRef = {
  doc: jest.fn(() => mockUserDocRef),
};
const mockFirestore = {
  collection: jest.fn(() => mockUsersCollectionRef),
  batch: mockBatch,
  settings: jest.fn(() => Promise.resolve()),
};

jest.mock('@react-native-firebase/firestore', () => {
  const firestoreFn: any = jest.fn(() => mockFirestore);
  firestoreFn.CACHE_SIZE_UNLIMITED = -1;

  return {
    __esModule: true,
    default: firestoreFn,
  };
});

import { deleteAllUserData } from '@/services/firebase/firestore';

describe('deleteAllUserData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes large subcollections in multiple batches before deleting the user doc', async () => {
    await deleteAllUserData('user-1');

    expect(mockBatch).toHaveBeenCalledTimes(4);
    expect(mockBatchDelete).toHaveBeenCalledTimes(903);
    expect(mockCommit).toHaveBeenCalledTimes(4);
    expect(mockUserDelete).toHaveBeenCalledTimes(1);
    expect(mockCommit.mock.invocationCallOrder[3]).toBeLessThan(
      mockUserDelete.mock.invocationCallOrder[0]
    );
  });
});
