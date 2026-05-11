const mockCommit = jest.fn(() => Promise.resolve());
const mockBatchDelete = jest.fn();
const mockBatch = jest.fn(() => ({
  delete: mockBatchDelete,
  commit: mockCommit,
}));
const allBreaksDocs = Array.from({ length: 901 }, (_, index) => ({
  ref: { id: `break-${index}` },
}));
const allDeviceDocs = Array.from({ length: 2 }, (_, index) => ({
  ref: { id: `device-${index}` },
}));
let mockBreaksPages: Array<Array<{ ref: { id: string } }>> = [];
let mockDevicePages: Array<Array<{ ref: { id: string } }>> = [];
const mockBreaksGet = jest.fn(() =>
  Promise.resolve({
    docs: mockBreaksPages.shift() ?? [],
  })
);
const mockDevicesGet = jest.fn(() =>
  Promise.resolve({
    docs: mockDevicePages.shift() ?? [],
  })
);
const mockBreaksLimit = jest.fn(() => ({
  get: mockBreaksGet,
}));
const mockDevicesLimit = jest.fn(() => ({
  get: mockDevicesGet,
}));
const mockUserDelete = jest.fn(() => Promise.resolve());
const mockUserDocRef = {
  collection: jest.fn((name: string) => {
    if (name === 'devices') {
      return {
        limit: mockDevicesLimit,
      };
    }

    return {
      limit: mockBreaksLimit,
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
    mockBreaksPages = [
      allBreaksDocs.slice(0, 450),
      allBreaksDocs.slice(450, 900),
      allBreaksDocs.slice(900),
    ];
    mockDevicePages = [allDeviceDocs];
  });

  it('deletes large subcollections in multiple batches before deleting the user doc', async () => {
    await deleteAllUserData('user-1');

    expect(mockBatch).toHaveBeenCalledTimes(4);
    expect(mockBatchDelete).toHaveBeenCalledTimes(903);
    expect(mockCommit).toHaveBeenCalledTimes(4);
    expect(mockUserDelete).toHaveBeenCalledTimes(1);
    expect(mockBreaksLimit).toHaveBeenCalledTimes(3);
    expect(mockDevicesLimit).toHaveBeenCalledTimes(1);
    expect(mockCommit.mock.invocationCallOrder[3]).toBeLessThan(
      mockUserDelete.mock.invocationCallOrder[0]
    );
  });
});
