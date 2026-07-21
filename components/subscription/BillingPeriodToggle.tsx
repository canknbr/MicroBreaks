/**
 * BillingPeriodToggle
 *
 * Two-pill toggle between monthly and annual billing periods. Used
 * inside the paywall after the user has picked a tier.
 */

import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type BillingPeriod = 'monthly' | 'yearly';

interface BillingPeriodToggleProps {
  selected: BillingPeriod;
  onSelect: (period: BillingPeriod) => void;
  /** Optional savings hint shown beside the annual pill ("Save 50%"). */
  annualSavingsLabel?: string;
}

function BillingPeriodToggle({
  selected,
  onSelect,
  annualSavingsLabel,
}: BillingPeriodToggleProps) {
  const theme = useTheme();

  const renderOption = (
    period: BillingPeriod,
    label: string,
    sublabel?: string
  ) => {
    const isSelected = period === selected;
    return (
      <Pressable
        key={period}
        onPress={() => onSelect(period)}
        style={styles.option}
        accessibilityRole="tab"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${label}${sublabel ? `, ${sublabel}` : ''}`}
        testID={`billing-period-${period}`}
      >
        <View style={styles.optionRow}>
          <Text
            style={[
              styles.label,
              { color: isSelected ? theme.text.primary : 'rgba(255,255,255,0.34)' },
            ]}
          >
            {label}
          </Text>
          {sublabel && (
            <Text style={[styles.sublabel, { color: theme.accent.primary }]}>
              {sublabel}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.bar,
            isSelected && { backgroundColor: theme.accent.primary },
          ]}
        />
      </Pressable>
    );
  };

  return (
    <View
      style={styles.row}
      accessibilityRole="tablist"
      accessibilityLabel="Choose billing period"
    >
      {renderOption('monthly', 'Monthly')}
      {renderOption('yearly', 'Annual', annualSavingsLabel)}
    </View>
  );
}

export default memo(BillingPeriodToggle);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 28,
    marginBottom: 24,
  },
  option: {
    alignItems: 'flex-start',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  sublabel: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  bar: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
});
