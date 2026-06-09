/**
 * FreeQuotaChip
 *
 * Tiny status pill that shows free-tier users where they stand on
 * the daily break cap. Tap to open the paywall. Hides for paid
 * tiers. Designed to feel like a friendly progress indicator, not
 * an alarm — we want to nudge, not pressure.
 */

import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

interface FreeQuotaChipProps {
  used: number;
  limit: number;
}

function FreeQuotaChip({ used, limit }: FreeQuotaChipProps) {
  const theme = useTheme();
  const remaining = Math.max(0, limit - used);
  const exhausted = used >= limit;
  const tint = exhausted ? theme.accent.warning : theme.accent.primary;

  const handlePress = () => {
    Haptics.selectionAsync()?.catch(() => {});
    router.push(
      ({
        pathname: '/subscription',
        params: { placement: 'free_quota' },
      } as never)
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={
        exhausted
          ? `Free daily limit reached: ${used} of ${limit} breaks. Upgrade for unlimited sessions.`
          : `Free breaks today: ${used} of ${limit}. Tap to upgrade.`
      }
      testID="free-quota-chip"
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: `${tint}1A`,
          borderColor: `${tint}55`,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text style={[styles.label, { color: theme.text.primary }]}>
        {exhausted
          ? 'Daily free limit reached'
          : `${remaining} free break${remaining === 1 ? '' : 's'} left today`}
      </Text>
      <Ionicons name="chevron-forward" size={12} color={theme.text.muted} />
    </Pressable>
  );
}

export default memo(FreeQuotaChip);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
