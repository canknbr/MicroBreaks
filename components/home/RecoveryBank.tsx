/**
 * RecoveryBank
 *
 * Calm, non-judgmental companion to the streak indicator. Shows the
 * total recovery minutes the user has accumulated since they started
 * using the app — a balance that only grows. Designed for users who
 * find a streak counter (with its "you can lose it" subtext) more
 * stressful than motivating.
 *
 * This is additive. The streak system stays exactly as it is —
 * RecoveryBank is a parallel narrative the product can promote or
 * demote independently. Render it where it makes sense; don't show it
 * if the user hasn't logged any breaks yet (`recoveryBankSince`
 * being null means the bank is empty).
 */

import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface RecoveryBankProps {
  /** Cumulative minutes banked. */
  minutes: number;
  /** ISO date the bank started accruing. Null = no breaks yet. */
  since: string | null;
}

function formatBank(minutes: number): string {
  if (minutes < 1) return '0m';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const rem = Math.round(minutes - hours * 60);
  if (rem === 0) return `${hours}h`;
  return `${hours}h ${rem}m`;
}

function formatSince(since: string | null): string | null {
  if (!since) return null;
  const date = new Date(since);
  if (!Number.isFinite(date.getTime())) return null;
  // Locale-aware short date — "Jun 10" in English, "10 Haz" in Turkish.
  // We deliberately don't show the year; the bank is meant to feel
  // current, not archival.
  try {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

function RecoveryBank({ minutes, since }: RecoveryBankProps) {
  const theme = useTheme();
  if (!since) return null;

  const sinceLabel = formatSince(since);
  const bankLabel = formatBank(minutes);
  const accessibilitySince = sinceLabel
    ? `accumulated since ${sinceLabel}`
    : 'lifetime total';

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: theme.border.subtle,
          backgroundColor: theme.isDark
            ? `${theme.accent.primary}14`
            : theme.background.card,
        },
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`Recovery bank: ${bankLabel} ${accessibilitySince}`}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: `${theme.accent.primary}22` },
        ]}
      >
        <Ionicons name="leaf-outline" size={18} color={theme.accent.primary} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.label, { color: theme.text.muted }]}>
          RECOVERY BANK
        </Text>
        <Text style={[styles.value, { color: theme.text.primary }]}>
          {bankLabel}
        </Text>
        {sinceLabel && (
          <Text style={[styles.since, { color: theme.text.secondary }]}>
            since {sinceLabel}
          </Text>
        )}
      </View>
    </View>
  );
}

export default memo(RecoveryBank);
export { formatBank as __formatBankForTests };

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  since: {
    fontSize: 11,
    marginTop: 2,
  },
});
