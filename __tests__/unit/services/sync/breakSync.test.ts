import { pullBreakHistory, pushBreakHistory } from '@/services/sync/breakSync';
import { firestore, getBreaksCollection } from '@/services/firebase/firestore';
import { getBreakHistory } from '@/services/breakHistory';
import { mergeBreakHistories } from '@/services/sync/merger';
import { setItem, STORAGE_KEYS } from '@/services/storage';
import type { CompletedBreak } from '@/services/storage';

jest.mock('@/services/firebase/firestore', () => ({
  getBreaksCollection: jest.fn(),
  firestore: jest.fn(),
}));

jest.mock('@/services/breakHistory', () => ({
  getBreakHistory: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@/services/sync/merger', () => ({
  mergeBreakHistories: jest.fn((local, remote) => [...remote, ...local]),
}));

jest.mock('@/services/storage', () => ({
  STORAGE_KEYS: {
    BREAK_HISTORY: '@microbreaks/break_history',
  },
  setItem: jest.fn(() => Promise.resolve(true)),
}));

function createRemoteBreak(index: number): CompletedBreak {
  return {
    id: `break-${index}`,
    breakId: `pack-${index}`,
    title: `Break ${index}`,
    category: 'quick',
    icon: '👁️',
    color: '#06FFA5',
    duration: 60,
    stepsCompleted: 1,
    totalSteps: 1,
    xpEarned: 10,
    rating: 'good' as const,
    completedAt: new Date(Date.now() - index * 1000).toISOString(),
    updatedAt: new Date(Date.now() - index * 1000).toISOString(),
  };
}

describe('pullBreakHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('paginates remote history until all pages are merged locally', async () => {
    const firstPage = Array.from({ length: 500 }, (_, index) => ({
      data: () => createRemoteBreak(index),
    }));
    const secondPage = Array.from({ length: 120 }, (_, index) => ({
      data: () => createRemoteBreak(index + 500),
    }));

    const query = {
      where: jest.fn(),
      orderBy: jest.fn(),
      limit: jest.fn(),
      startAfter: jest.fn(),
      get: jest.fn(),
    } as any;

    query.where.mockReturnValue(query);
    query.orderBy.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    query.startAfter.mockReturnValue(query);
    query.get
      .mockResolvedValueOnce({
        empty: false,
        docs: firstPage,
      })
      .mockResolvedValueOnce({
        empty: false,
        docs: secondPage,
      });

    (getBreaksCollection as jest.Mock).mockReturnValue(query);

    await pullBreakHistory('user-1', Date.now() - 60_000);

    expect(query.where).toHaveBeenCalledWith('updatedAt', '>', expect.any(String));
    expect(query.orderBy).toHaveBeenCalledWith('updatedAt', 'desc');
    expect(query.startAfter).toHaveBeenCalledTimes(1);
    expect(mergeBreakHistories).toHaveBeenCalledWith([], expect.any(Array));
    expect((mergeBreakHistories as jest.Mock).mock.calls[0][1]).toHaveLength(620);
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.BREAK_HISTORY, expect.any(Array));
    expect(getBreakHistory).toHaveBeenCalledTimes(1);
  });
});

describe('pushBreakHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pushes breaks updated after the last push timestamp', async () => {
    const olderBreak = createRemoteBreak(1);
    olderBreak.updatedAt = '2024-01-01T10:00:00.000Z';

    const updatedBreak = createRemoteBreak(2);
    updatedBreak.updatedAt = '2024-01-01T10:05:00.000Z';
    updatedBreak.rating = 'bad';

    (getBreakHistory as jest.Mock).mockResolvedValueOnce([olderBreak, updatedBreak]);

    const set = jest.fn();
    const commit = jest.fn().mockResolvedValue(undefined);
    const batch = { set, commit };
    (firestore as unknown as jest.Mock).mockReturnValue({
      batch: () => batch,
    });
    (getBreaksCollection as jest.Mock).mockReturnValue({
      doc: (id: string) => ({ id }),
    });

    await pushBreakHistory('user-1', new Date('2024-01-01T10:03:00.000Z').getTime());

    expect(set).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ id: updatedBreak.id }),
      expect.objectContaining({ rating: 'bad', updatedAt: '2024-01-01T10:05:00.000Z' })
    );
    expect(commit).toHaveBeenCalledTimes(1);
  });
});
