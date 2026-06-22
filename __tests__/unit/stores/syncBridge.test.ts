import {
  clearSyncHandlers,
  isApplyingRemoteData,
  notifyDataChange,
  notifySettingsChange,
  registerSyncHandlers,
  setApplyingRemoteData,
} from '@/store/syncBridge';

describe('syncBridge', () => {
  beforeEach(() => {
    clearSyncHandlers();
    setApplyingRemoteData(false);
  });

  it('forwards a local data change to the registered handler with type and data', () => {
    const onDataChange = jest.fn();
    registerSyncHandlers({ onDataChange, onSettingsChange: jest.fn() });

    notifyDataChange('profile');
    notifyDataChange('break', { id: 'b1' });

    expect(onDataChange).toHaveBeenNthCalledWith(1, 'profile', undefined);
    expect(onDataChange).toHaveBeenNthCalledWith(2, 'break', { id: 'b1' });
  });

  it('forwards a local settings change to the registered settings handler', () => {
    const onSettingsChange = jest.fn();
    registerSyncHandlers({ onDataChange: jest.fn(), onSettingsChange });

    notifySettingsChange();

    expect(onSettingsChange).toHaveBeenCalledTimes(1);
  });

  it('returns the handler result so awaitable callers can wait on the push', () => {
    const promise = Promise.resolve('done');
    registerSyncHandlers({ onDataChange: () => promise, onSettingsChange: jest.fn() });

    expect(notifyDataChange('progress')).toBe(promise);
  });

  it('suppresses outbound notifications while remote data is being applied', () => {
    const onDataChange = jest.fn();
    const onSettingsChange = jest.fn();
    registerSyncHandlers({ onDataChange, onSettingsChange });

    setApplyingRemoteData(true);
    expect(isApplyingRemoteData()).toBe(true);

    expect(notifyDataChange('profile')).toBeUndefined();
    notifySettingsChange();

    expect(onDataChange).not.toHaveBeenCalled();
    expect(onSettingsChange).not.toHaveBeenCalled();
  });

  it('resumes forwarding once the applying-remote window closes', () => {
    const onDataChange = jest.fn();
    registerSyncHandlers({ onDataChange, onSettingsChange: jest.fn() });

    setApplyingRemoteData(true);
    notifyDataChange('profile');
    setApplyingRemoteData(false);
    notifyDataChange('profile');

    expect(onDataChange).toHaveBeenCalledTimes(1);
  });

  it('no-ops after handlers are cleared', () => {
    const onDataChange = jest.fn();
    const onSettingsChange = jest.fn();
    registerSyncHandlers({ onDataChange, onSettingsChange });
    clearSyncHandlers();

    expect(notifyDataChange('profile')).toBeUndefined();
    notifySettingsChange();

    expect(onDataChange).not.toHaveBeenCalled();
    expect(onSettingsChange).not.toHaveBeenCalled();
  });
});
