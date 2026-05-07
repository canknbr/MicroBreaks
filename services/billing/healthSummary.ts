import type { IoniconsName } from '@/types/icons';
import type { BillingDiagnostics, EntitlementHealth } from './types';

export interface PremiumHealthSummary {
  label: string;
  detail: string;
  icon: IoniconsName;
  tone: 'healthy' | 'warning' | 'offline' | 'checking';
}

export function formatLastSyncLabel(value: number | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleString();
}

export function getPremiumHealthSummary(
  diagnostics: BillingDiagnostics,
  entitlementHealth: EntitlementHealth,
  lastSyncedAt: number | null
): PremiumHealthSummary {
  const lastSyncLabel = formatLastSyncLabel(lastSyncedAt);

  if (entitlementHealth.status !== 'healthy') {
    return {
      label: 'Needs Attention',
      detail: entitlementHealth.summary,
      icon: 'alert-circle',
      tone: 'warning',
    };
  }

  if (diagnostics.healthStatus === 'offline') {
    return {
      label: 'Billing Offline',
      detail: 'Purchases are disabled until a billing provider is enabled in this build.',
      icon: 'cloud-offline',
      tone: 'offline',
    };
  }

  if (diagnostics.healthStatus === 'degraded') {
    return {
      label: 'Needs Attention',
      detail: diagnostics.lastErrorMessage ?? 'Billing diagnostics found an issue that needs review.',
      icon: 'warning',
      tone: 'warning',
    };
  }

  if (diagnostics.healthStatus === 'healthy') {
    return {
      label: 'Billing Ready',
      detail: lastSyncLabel
        ? `Last sync ${lastSyncLabel}`
        : 'Subscription state looks healthy on this device.',
      icon: 'checkmark-circle',
      tone: 'healthy',
    };
  }

  return {
    label: 'Checking Billing',
    detail: 'Diagnostics are still warming up for this session.',
    icon: 'time-outline',
    tone: 'checking',
  };
}
