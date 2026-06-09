/**
 * UpgradeGateCard
 *
 * Drop-in replacement for any paywalled surface. Renders a
 * tier-aware "Upgrade to <Tier>" card that taps through to the
 * paywall. Use it from `useTierFeature` blocked branches:
 *
 *   const gate = useTierFeature('weekly_recovery_story');
 *   if (!gate.hasFeature) {
 *     return <UpgradeGateCard requiredTier={gate.requiredTier} ... />;
 *   }
 *
 * Visual language mirrors other home/screen cards (border, blur in
 * dark mode) so the upgrade prompt doesn't feel like a foreign
 * dialog interrupting the flow.
 */

import React, { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
      style={[
        styles.card,
        {
          borderColor: theme.border.subtle,
          backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
        },
      ]}
      accessibilityLabel={`${resolvedTitle}. ${body}`}
      accessibilityRole="summary"
    >
      {theme.isDark &&
        (Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(25, 25, 35, 0.92)' },
            ]}
          />
        ))}
      <LinearGradient
        colors={[
          `${theme.accent.warning}22`,
          'transparent',
        ]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.row}>
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: `${theme.accent.warning}24` },
          ]}
        >
          <Ionicons name="lock-closed" size={20} color={theme.accent.warning} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {resolvedTitle}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            {body}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={resolvedCta}
        testID="upgrade-gate-cta"
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: theme.accent.warning,
            opacity: pressed ? 0.86 : 1,
          },
        ]}
      >
        <Text style={[styles.ctaText, { color: theme.text.inverse }]}>
          {resolvedCta}
        </Text>
        <Ionicons name="arrow-forward" size={16} color={theme.text.inverse} />
      </Pressable>
    </View>
  );
}

export default memo(UpgradeGateCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    overflow: 'hidden',
    gap: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  cta: {
    minHeight: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
