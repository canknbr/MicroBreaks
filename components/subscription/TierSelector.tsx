/**
 * TierSelector
 *
 * Three-pill selector that lets the user pick which subscription
 * tier (Solo / Pro / Family) the rest of the paywall should describe.
 * Stateless — the parent owns the selection.
 */

import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import {
  PURCHASABLE_TIERS,
  TIER_LABELS,
  TIER_TAGLINES,
  type Tier,
} from '@/services/subscription/tiers';

type PurchasableTier = Exclude<Tier, 'free'>;

interface TierSelectorProps {
  selected: PurchasableTier;
  onSelect: (tier: PurchasableTier) => void;
  /** Mark one tier as the recommended choice (renders an accent). */
  recommended?: PurchasableTier;
}

function TierSelector({ selected, onSelect, recommended }: TierSelectorProps) {
  const theme = useTheme();

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
      accessibilityLabel="Choose a subscription tier"
    >
      {PURCHASABLE_TIERS.map((tier) => {
        const isSelected = tier === selected;
        const isRecommended = tier === recommended;
        return (
          <Pressable
            key={tier}
            onPress={() => onSelect(tier)}
            style={[
              styles.tab,
              isSelected && {
                backgroundColor: theme.isDark
                  ? 'rgba(255, 209, 102, 0.16)'
                  : 'rgba(255, 149, 0, 0.10)',
                borderColor: theme.accent.warning,
              },
              !isSelected && { borderColor: 'transparent' },
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${TIER_LABELS[tier]} tier. ${TIER_TAGLINES[tier]}`}
            testID={`tier-tab-${tier}`}
          >
            <View style={styles.labelRow}>
              <Text
                style={[
                  styles.label,
                  {
                    color: isSelected
                      ? theme.accent.warning
                      : theme.text.primary,
                  },
                ]}
              >
                {TIER_LABELS[tier]}
              </Text>
              {isRecommended && (
                <View
                  style={[
                    styles.recommendBadge,
                    { backgroundColor: theme.accent.warning },
                  ]}
                  accessibilityLabel="Recommended"
                >
                  <Text
                    style={[
                      styles.recommendText,
                      { color: theme.text.inverse },
                    ]}
                  >
                    ★
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.tagline, { color: theme.text.muted }]}
              numberOfLines={1}
            >
              {TIER_TAGLINES[tier]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(TierSelector);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  recommendBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendText: {
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 12,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
