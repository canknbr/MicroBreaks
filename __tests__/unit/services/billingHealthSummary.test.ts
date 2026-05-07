import { getPremiumHealthSummary } from '@/services/billing/healthSummary';
import type { BillingDiagnostics, EntitlementHealth } from '@/services/billing';

describe('billing health summary', () => {
  const baseDiagnostics: BillingDiagnostics = {
    healthStatus: 'unknown',
    isInitialized: false,
    isConfigured: false,
    activeOperation: null,
    lastOperation: null,
    lastOperationAt: null,
    lastSuccessAt: null,
    lastErrorCode: null,
    lastErrorMessage: null,
  };

  const healthyEntitlement: EntitlementHealth = {
    status: 'healthy',
    summary: 'Entitlement state looks consistent.',
    issues: [],
    checkedAt: Date.now(),
  };

  it('returns offline summary when billing provider is offline', () => {
    const summary = getPremiumHealthSummary(
      {
        ...baseDiagnostics,
        healthStatus: 'offline',
      },
      healthyEntitlement,
      null
    );

    expect(summary.label).toBe('Billing Offline');
    expect(summary.icon).toBe('cloud-offline');
    expect(summary.tone).toBe('offline');
  });

  it('returns warning summary when entitlement state is invalid', () => {
    const summary = getPremiumHealthSummary(
      {
        ...baseDiagnostics,
        healthStatus: 'healthy',
        isInitialized: true,
        isConfigured: true,
      },
      {
        status: 'invalid',
        summary: 'Active access is missing an entitlement identifier.',
        issues: ['Active access is missing an entitlement identifier.'],
        checkedAt: Date.now(),
      },
      Date.now()
    );

    expect(summary.label).toBe('Needs Attention');
    expect(summary.detail).toBe('Active access is missing an entitlement identifier.');
    expect(summary.icon).toBe('alert-circle');
    expect(summary.tone).toBe('warning');
  });

  it('returns healthy summary when diagnostics are healthy', () => {
    const summary = getPremiumHealthSummary(
      {
        ...baseDiagnostics,
        healthStatus: 'healthy',
        isInitialized: true,
        isConfigured: true,
      },
      healthyEntitlement,
      Date.now()
    );

    expect(summary.label).toBe('Billing Ready');
    expect(summary.detail).toContain('Last sync');
    expect(summary.icon).toBe('checkmark-circle');
    expect(summary.tone).toBe('healthy');
  });

  it('returns degraded summary when diagnostics report a billing error', () => {
    const summary = getPremiumHealthSummary(
      {
        ...baseDiagnostics,
        healthStatus: 'degraded',
        isInitialized: true,
        isConfigured: true,
        lastErrorMessage: 'Purchase flow failed.',
      },
      healthyEntitlement,
      null
    );

    expect(summary.label).toBe('Needs Attention');
    expect(summary.detail).toBe('Purchase flow failed.');
    expect(summary.icon).toBe('warning');
    expect(summary.tone).toBe('warning');
  });

  it('returns checking summary while diagnostics are warming up', () => {
    const summary = getPremiumHealthSummary(
      baseDiagnostics,
      healthyEntitlement,
      null
    );

    expect(summary.label).toBe('Checking Billing');
    expect(summary.icon).toBe('time-outline');
    expect(summary.tone).toBe('checking');
  });
});
