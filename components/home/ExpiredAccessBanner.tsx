/**
 * ExpiredAccessBanner
 *
 * Soft, non-intrusive prompt for users whose subscription lapsed.
 * Shows above the home greeting when:
 *   - The server entitlement ledger reports `expired` or `refunded`
 *   - AND the user hasn't dismissed it this session
 *
 * Dismissal is per-session (see `winbackState.ts`) — we re-prompt on
 * every cold launch until they either upgrade or stay on Free for
 * good.
 *
 * Copy is warm, not desperate. The whole point is to acknowledge
 * the user's lapse and offer a clear path back without pressuring.
 */

import React, { memo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useServerEntitlement } from '@/hooks/useServerEntitlement';
import {
  dismissWinback,
  isWinbackDismissed,
} from '@/services/subscription/winbackState';

function ExpiredAccessBanner() {
  const theme = useTheme();
  const { entitlement, loaded } = useServerEntitlement();
  const [dismissed, setDismissed] = useState(() => isWinbackDismissed());

  if (!loaded || dismissed) return null;
  if (entitlement.status !== 'expired' && entitlement.status !== 'refunded') {
    return null;
  }

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)?.catch(() => {});
    router.push(
      ({
        pathname: '/subscription',
        params: { placement: 're_engage' },
      } as never)
    );
  };

  const handleDismiss = () => {
    Haptics.selectionAsync()?.catch(() => {});
    dismissWinback();
    setDismissed(true);
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
      accessibilityLabel="Your subscription lapsed. Tap to renew or close to dismiss."
      accessibilityRole="summary"
      testID="expired-access-banner"
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
        colors={[`${theme.accent.warning}22`, 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.row}>
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: `${theme.accent.warning}24` },
          ]}
        >
          <Ionicons name="refresh-circle" size={20} color={theme.accent.warning} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Your subscription lapsed — pick up where you left off?
          </Text>
        </View>
        <Pressable
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          testID="expired-banner-dismiss"
          hitSlop={12}
        >
          <Ionicons name="close" size={20} color={theme.text.muted} />
        </Pressable>
      </View>

      <Pressable
        onPress={handleUpgrade}
        accessibilityRole="button"
        accessibilityLabel="Renew subscription"
        testID="expired-banner-renew"
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: theme.accent.warning,
            opacity: pressed ? 0.86 : 1,
          },
        ]}
      >
        <Text style={[styles.ctaText, { color: theme.text.inverse }]}>
          Renew
        </Text>
        <Ionicons name="arrow-forward" size={14} color={theme.text.inverse} />
      </Pressable>
    </View>
  );
}

export default memo(ExpiredAccessBanner);

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    gap: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  cta: {
    minHeight: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
