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
      style={styles.list}
      accessibilityRole="tablist"
      accessibilityLabel="Choose a subscription tier"
    >
      {PURCHASABLE_TIERS.map((tier, i) => {
        const isSelected = tier === selected;
        const isRecommended = tier === recommended;
        return (
          <Pressable
            key={tier}
            onPress={() => onSelect(tier)}
            style={[styles.row, i > 0 && styles.divider]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${TIER_LABELS[tier]} tier. ${TIER_TAGLINES[tier]}`}
            testID={`tier-tab-${tier}`}
          >
            <View style={styles.lead}>
              {isSelected ? (
                <View style={[styles.bar, { backgroundColor: theme.accent.primary }]} />
              ) : null}
            </View>
            <View style={styles.body}>
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.label,
                    { color: isSelected ? theme.text.primary : 'rgba(255,255,255,0.34)' },
                  ]}
                >
                  {TIER_LABELS[tier]}
                </Text>
                {isRecommended && (
                  <Text style={[styles.recommend, { color: theme.accent.primary }]}>
                    RECOMMENDED
                  </Text>
                )}
              </View>
              <Text
                style={[styles.tagline, { color: theme.text.muted }]}
                numberOfLines={1}
              >
                {TIER_TAGLINES[tier]}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(TierSelector);

const styles = StyleSheet.create({
  list: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  lead: {
    width: 30,
    justifyContent: 'center',
  },
  bar: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  body: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  recommend: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 10,
    letterSpacing: 1.2,
  },
  tagline: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    marginTop: 3,
  },
});
