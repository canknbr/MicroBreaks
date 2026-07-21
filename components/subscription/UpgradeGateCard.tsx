/**
 * UpgradeGateCard — editorial. Drop-in tier-aware upgrade prompt for any
 * paywalled surface: a hairline band with a tier eyebrow, headline, body, and
 * a white pill CTA. No card blur / gradient / icon bubble.
 *
 *   const gate = useTierFeature('weekly_recovery_story');
 *   if (!gate.hasFeature) {
 *     return <UpgradeGateCard requiredTier={gate.requiredTier} ... />;
 *   }
 */

import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { TIER_LABELS, type Tier } from '@/services/subscription/tiers';

interface UpgradeGateCardProps {
  /** The min tier the feature requires. */
  requiredTier: Tier;
  /** Headline override; defaults to "Unlock <Tier>". */
  title?: string;
  /** Short body copy explaining what they get. */
  body: string;
  /** Optional placement signal for analytics on the paywall side. */
  placement?: string;
  /** CTA button label; defaults to "Upgrade to <Tier>". */
  ctaLabel?: string;
}

function UpgradeGateCard({
  requiredTier,
  title,
  body,
  placement,
  ctaLabel,
}: UpgradeGateCardProps) {
  const theme = useTheme();
  const tierLabel = TIER_LABELS[requiredTier];
  const resolvedTitle = title ?? `Unlock ${tierLabel}`;
  const resolvedCta = ctaLabel ?? `Upgrade to ${tierLabel}`;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)?.catch(() => {});
    router.push(
      placement
        ? ({ pathname: '/subscription', params: { placement } } as never)
        : ('/subscription' as never)
    );
  };

  return (
    <View
      style={[styles.card, { borderColor: theme.border.subtle }]}
      accessibilityLabel={`${resolvedTitle}. ${body}`}
      accessibilityRole="summary"
    >
      <Text style={[styles.eyebrow, { color: theme.accent.primary }]}>
        {tierLabel.toUpperCase()}
      </Text>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {resolvedTitle}
      </Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
        {body}
      </Text>

      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={resolvedCta}
        testID="upgrade-gate-cta"
        style={({ pressed }) => [styles.cta, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={styles.ctaText}>{resolvedCta}</Text>
        <Ionicons name="arrow-forward" size={16} color="#0B0A0D" />
      </Pressable>
    </View>
  );
}

export default memo(UpgradeGateCard);

const styles = StyleSheet.create({
  card: {
    paddingVertical: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 11,
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  cta: {
    alignSelf: 'flex-start',
    minHeight: 48,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 22,
  },
  ctaText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 15,
    color: '#0B0A0D',
  },
});
