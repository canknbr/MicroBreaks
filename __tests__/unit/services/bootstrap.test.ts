import { runBootstrapSteps } from '@/services/bootstrap';

describe('runBootstrapSteps', () => {
  it('returns ready when all steps succeed', async () => {
    const result = await runBootstrapSteps([
      { name: 'firebase', critical: true, run: jest.fn().mockResolvedValue(undefined) },
      { name: 'analytics', run: jest.fn().mockResolvedValue(undefined) },
    ]);

    expect(result).toEqual({
      phase: 'ready',
      issues: [],
    });
  });

  it('returns degraded when only optional steps fail', async () => {
    const result = await runBootstrapSteps([
      { name: 'firebase', critical: true, run: jest.fn().mockResolvedValue(undefined) },
      { name: 'notifications', run: jest.fn().mockRejectedValue(new Error('Notifications failed')) },
      { name: 'analytics', run: jest.fn().mockResolvedValue(undefined) },
    ]);

    expect(result.phase).toBe('degraded');
    expect(result.issues).toEqual([
      {
        step: 'notifications',
        critical: false,
        message: 'Notifications failed',
      },
    ]);
  });

  it('returns blocked and stops after a critical failure', async () => {
    const afterFailure = jest.fn().mockResolvedValue(undefined);

    const result = await runBootstrapSteps([
      { name: 'firebase', critical: true, run: jest.fn().mockRejectedValue(new Error('Missing config')) },
      { name: 'analytics', run: afterFailure },
    ]);

    expect(result).toEqual({
      phase: 'blocked',
      issues: [
        {
          step: 'firebase',
          critical: true,
          message: 'Missing config',
        },
      ],
    });
    expect(afterFailure).not.toHaveBeenCalled();
  });

  it('normalizes unknown errors into a safe message', async () => {
    const result = await runBootstrapSteps([
      { name: 'firestore', run: jest.fn().mockRejectedValue({ code: 'permission-denied' }) },
    ]);

    expect(result).toEqual({
      phase: 'degraded',
      issues: [
        {
          step: 'firestore',
          critical: false,
          message: 'Unknown bootstrap failure',
        },
      ],
    });
  });
});
