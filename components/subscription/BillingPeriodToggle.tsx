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

  const renderPill = (
    period: BillingPeriod,
    label: string,
    sublabel?: string
  ) => {
    const isSelected = period === selected;
    return (
      <Pressable
        key={period}
        onPress={() => onSelect(period)}
        style={[
          styles.pill,
          {
            backgroundColor: isSelected
              ? theme.accent.warning
              : 'transparent',
          },
        ]}
        accessibilityRole="tab"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${label}${sublabel ? `, ${sublabel}` : ''}`}
        testID={`billing-period-${period}`}
      >
        <Text
          style={[
            styles.label,
            {
              color: isSelected ? theme.text.inverse : theme.text.primary,
            },
          ]}
        >
          {label}
        </Text>
        {sublabel && (
          <Text
            style={[
              styles.sublabel,
              {
                color: isSelected
                  ? theme.text.inverse
                  : theme.accent.success,
              },
            ]}
          >
            {sublabel}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme.isDark
            ? 'rgba(255, 255, 255, 0.04)'
            : theme.background.card,
          borderColor: theme.border.subtle,
        },
      ]}
      accessibilityRole="tablist"
      accessibilityLabel="Choose billing period"
    >
      {renderPill('monthly', 'Monthly')}
      {renderPill('yearly', 'Annual', annualSavingsLabel)}
    </View>
  );
}

export default memo(BillingPeriodToggle);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  sublabel: {
    fontSize: 12,
    fontWeight: '800',
  },
});
