import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { usePressScale } from '@/hooks/usePressScale';
import { useHapticChoreography } from '@/hooks/useHapticChoreography';
import { billingService } from '@/services/billing';
import { analytics } from '@/services/analytics';
import {
  MAIN_PAYWALL_ID,
  PAYWALL_COPY,
} from '@/constants/subscription';
import {
  useHasActiveSubscription,
  useBillingDiagnostics,
  useEntitlementHealth,
  useSubscriptionCustomer,
  useSubscriptionOffers,
  useSubscriptionStore,
} from '@/store/subscriptionStore';
import { useOnboardingStore } from '@/store';
import type {
  BillingOperation,
  PaywallPlacement,
  SubscriptionOffer,
} from '@/services/billing';

interface PaywallContentProps {
  placement: PaywallPlacement;
  onContinueFree: () => void;
  onDismiss?: () => void;
  onPurchaseSuccess?: () => void;
  compactHeader?: boolean;
}

function formatAccessLabel(
  activeOfferId: string | null,
  hasAccess: boolean,
  isPreview: boolean
): string {
  if (!hasAccess) return 'Free';
  const period = activeOfferId?.endsWith('_annual') ? 'Annual' : 'Monthly';
  const tierLabel = activeOfferId?.startsWith('family_')
    ? 'Family'
    : activeOfferId?.startsWith('solo_')
      ? 'Solo'
      : 'Pro';
  return `${isPreview ? 'Preview ' : ''}${period} ${tierLabel}`;
}

function formatOperationLabel(operation: BillingOperation | null): string {
  switch (operation) {
    case 'initialize':
      return 'Initialize billing';
    case 'load_offers':
      return 'Load offers';
    case 'refresh_customer':
      return 'Refresh access';
    case 'purchase':
      return 'Purchase';
    case 'restore':
      return 'Restore';
    default:
      return 'Not yet';
  }
}

function formatTimestamp(value: number | null): string {
  if (!value) return 'Not yet';
  return new Date(value).toLocaleString();
}

function getHealthAccent(
  status: 'unknown' | 'healthy' | 'degraded' | 'offline',
  theme: ReturnType<typeof useTheme>
): string {
  switch (status) {
    case 'healthy':
      return theme.accent.success;
    case 'degraded':
      return theme.accent.warning;
    case 'offline':
      return theme.accent.secondary;
    default:
      return theme.text.muted;
  }
}

function getHealthLabel(status: 'unknown' | 'healthy' | 'degraded' | 'offline'): string {
  switch (status) {
    case 'healthy':
      return 'Ready';
    case 'degraded':
      return 'Needs Attention';
    case 'offline':
      return 'Offline';
    default:
      return 'Checking';
  }
}

function getPrimaryNeedProfile(painAreas: string[], breakStyle: string[]) {
  if (painAreas.includes('eyes')) {
    return {
      label: 'eye strain relief',
      program: 'Eye Rescue',
      summary: 'screen-heavy eye recovery',
    };
  }
  if (painAreas.includes('neck') || painAreas.includes('shoulders')) {
    return {
      label: 'neck and shoulder relief',
      program: 'Desk Neck Reset',
      summary: 'tight neck and shoulder recovery',
    };
  }
  if (painAreas.includes('upper_back') || painAreas.includes('lower_back')) {
    return {
      label: 'posture recovery',
      program: 'Posture Rescue',
      summary: 'desk posture recovery',
    };
  }
  if (breakStyle.includes('mindful')) {
    return {
      label: 'focus recovery',
      program: 'Focus Reset',
      summary: 'attention and mental reset',
    };
  }
  if (breakStyle.includes('active')) {
    return {
      label: 'energy recovery',
      program: 'Energy Lift',
      summary: 'movement-led energy recovery',
    };
  }

  return {
    label: 'desk recovery',
    program: 'Desk Recovery',
    summary: 'workday recovery',
  };
}

function buildPlacementCopy(
  placement: PaywallPlacement,
  primaryNeed: ReturnType<typeof getPrimaryNeedProfile>,
  fallbackLabel: string
) {
  switch (placement) {
    case 'onboarding':
      return {
        headline: `Unlock your full ${primaryNeed.program.toLowerCase()} plan`,
        subheadline:
          `You have the starter reset. Pro adds the deeper ${primaryNeed.summary} routines, better timing, and weekly recovery guidance that make the habit stick.`,
        primaryFallback: fallbackLabel,
      };
    case 'breaks':
      return {
        headline: `Go beyond starter ${primaryNeed.label}`,
        subheadline:
          `Open the full guided library for ${primaryNeed.label}, including longer routines and deeper programs built for real desk-work fatigue.`,
        primaryFallback: fallbackLabel,
      };
    case 'stats':
      return {
        headline: 'See what your recovery story is missing',
        subheadline:
          `You already have the top-line story. Pro shows the trend, timing, and recovery mix underneath it so you know what to fix next for ${primaryNeed.label}.`,
        primaryFallback: fallbackLabel,
      };
    case 'profile':
    default:
      return {
        headline: 'Upgrade from starter relief to full recovery',
        subheadline:
          `Pro unlocks the full ${primaryNeed.summary} layer: deeper programs, better analytics, and faster access to the sessions you will actually repeat.`,
        primaryFallback: fallbackLabel,
      };
  }
}

function buildFeatureList(
  placement: PaywallPlacement,
  primaryNeed: ReturnType<typeof getPrimaryNeedProfile>
): string[] {
  const firstFeatureByPlacement: Record<PaywallPlacement, string> = {
    onboarding: `A complete ${primaryNeed.program.toLowerCase()} path instead of just the starter reset`,
    profile: `Full guided programs for ${primaryNeed.label}, not just the starter layer`,
    breaks: `The complete ${primaryNeed.program.toLowerCase()} library with longer and deeper guided sessions`,
    stats: `The full recovery pattern layer behind your ${primaryNeed.label} routine`,
  };

  return [
    firstFeatureByPlacement[placement],
    'Weekly recovery story, deeper signals, and clearer next-focus recommendations',
    'Longer guided routines, favorites, and faster access to the sessions you actually repeat',
    'Sync-ready account state across devices as full billing goes live',
  ];
}

export default function PaywallContent({
  placement,
  onContinueFree,
  onDismiss,
  onPurchaseSuccess,
  compactHeader = false,
}: PaywallContentProps) {
  const theme = useTheme();
  const onboardingData = useOnboardingStore((state) => state.data);
  const offers = useSubscriptionOffers();
  const customer = useSubscriptionCustomer();
  const hasActiveSubscription = useHasActiveSubscription();
  const diagnostics = useBillingDiagnostics();
  const entitlementHealth = useEntitlementHealth();
  const markPaywallSeen = useSubscriptionStore((state) => state.markPaywallSeen);
  const isLoading = useSubscriptionStore((state) => state.isLoading);
  const lastError = useSubscriptionStore((state) => state.lastError);
  const lastSyncedAt = useSubscriptionStore((state) => state.lastSyncedAt);
  const { tapBack, confirmTap, selectionTick, successTick } = useHapticChoreography();
  const primaryPress = usePressScale({ pressedScale: 0.97 });
  const secondaryPress = usePressScale({ pressedScale: 0.97 });

  const defaultOfferId = offers.find((offer) => offer.recommended)?.id ?? offers[0]?.id ?? null;
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(defaultOfferId);
  const lastTrackedPlacementRef = useRef<PaywallPlacement | null>(null);

  const primaryNeed = useMemo(
    () => getPrimaryNeedProfile(onboardingData.painAreas, onboardingData.breakStyle),
    [onboardingData.breakStyle, onboardingData.painAreas]
  );
  const baseCopy = PAYWALL_COPY[placement];
  const copy = useMemo(
    () => buildPlacementCopy(placement, primaryNeed, baseCopy.primaryFallback),
    [placement, primaryNeed, baseCopy.primaryFallback]
  );
  const featureList = useMemo(
    () => buildFeatureList(placement, primaryNeed),
    [placement, primaryNeed]
  );

  useEffect(() => {
    if (lastTrackedPlacementRef.current !== placement) {
      analytics.trackPaywallViewed(MAIN_PAYWALL_ID, placement);
      markPaywallSeen(placement);
      lastTrackedPlacementRef.current = placement;
    }
    void (async () => {
      await billingService.getOfferings();
      await billingService.refreshCustomerState();
    })();
  }, [placement, markPaywallSeen]);

  useEffect(() => {
    if (!selectedOfferId && defaultOfferId) {
      setSelectedOfferId(defaultOfferId);
      return;
    }

    if (selectedOfferId && !offers.some((offer) => offer.id === selectedOfferId)) {
      setSelectedOfferId(defaultOfferId);
    }
  }, [defaultOfferId, offers, selectedOfferId]);

  const selectedOffer = useMemo<SubscriptionOffer | null>(
    () => offers.find((offer) => offer.id === selectedOfferId) ?? offers[0] ?? null,
    [offers, selectedOfferId]
  );

  const accessLabel = formatAccessLabel(
    customer.activeOfferId,
    hasActiveSubscription,
    customer.isPreview
  );

  const accessDateLabel = useMemo(() => {
    if (!customer.expiresAt) return null;
    const date = new Date(customer.expiresAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString();
  }, [customer.expiresAt]);

  const healthAccent = getHealthAccent(diagnostics.healthStatus, theme);
  const healthLabel = getHealthLabel(diagnostics.healthStatus);

  const handlePurchase = async () => {
    if (hasActiveSubscription) {
      if (onPurchaseSuccess) {
        onPurchaseSuccess();
        return;
      }
      onContinueFree();
      return;
    }

    if (!selectedOffer) {
      Alert.alert('No Plan Selected', 'Please choose a plan before continuing.');
      return;
    }

    confirmTap();

    analytics.trackOfferSelected({
      paywallId: MAIN_PAYWALL_ID,
      placement,
      offerId: selectedOffer.id,
      offerType: 'subscription',
      billingPeriod: selectedOffer.billingPeriod,
      price: selectedOffer.price,
      currency: selectedOffer.currency,
    });

    const result = await billingService.purchaseOffer(selectedOffer.id, placement);

    if (!result.success) {
      if (result.code === 'cancelled') {
        return;
      }

      Alert.alert('Purchases Unavailable', result.message);
      return;
    }

    successTick();
    Alert.alert(
      'Access Updated',
      result.message,
      [
        {
          text: 'Continue',
          onPress: () => {
            if (onPurchaseSuccess) {
              onPurchaseSuccess();
              return;
            }
            onContinueFree();
          },
        },
      ]
    );
  };

  const handleRestore = async () => {
    tapBack();
    const result = await billingService.restorePurchases();

    if (!result.success) {
      Alert.alert('Restore Purchases', result.message);
      return;
    }

    successTick();
    Alert.alert('Restore Purchases', result.message);
  };

  const primaryButtonLabel = hasActiveSubscription
    ? placement === 'onboarding'
      ? 'Continue to Dashboard'
      : 'Done'
    : selectedOffer?.trialDays
      ? `Start ${selectedOffer.trialDays}-Day Trial`
      : 'Continue with Pro';

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.isDark ? 'rgba(19, 19, 26, 0.92)' : theme.background.card,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        <LinearGradient
          colors={theme.isDark ? ['rgba(255, 209, 102, 0.16)', 'rgba(0, 229, 255, 0.08)'] : ['rgba(255, 149, 0, 0.14)', 'rgba(0, 122, 255, 0.08)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Ionicons
              name={hasActiveSubscription ? 'sparkles' : 'star'}
              size={16}
              color={theme.text.inverse}
            />
            <Text style={styles.heroBadgeText}>{accessLabel}</Text>
          </View>
          {onDismiss && (
            <Pressable
              onPress={onDismiss}
              style={[styles.closeButton, { backgroundColor: theme.border.subtle }]}
              accessibilityRole="button"
              accessibilityLabel="Close subscription screen"
            >
              <Ionicons name="close" size={18} color={theme.text.primary} />
            </Pressable>
          )}
        </View>

        <Text
          style={[
            styles.heroTitle,
            { color: theme.text.primary },
            compactHeader && styles.heroTitleCompact,
          ]}
        >
          {copy.headline}
        </Text>
        <Text style={[styles.heroSubtitle, { color: theme.text.secondary }]}>
          {copy.subheadline}
        </Text>

        {accessDateLabel && (
          <Text style={[styles.accessMeta, { color: theme.text.muted }]}>
            Current access valid through {accessDateLabel}
          </Text>
        )}
      </View>

      <View style={styles.featureList}>
        {featureList.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.isDark ? 'rgba(6, 255, 165, 0.12)' : 'rgba(52, 199, 89, 0.12)' },
              ]}
            >
              <Ionicons name="checkmark" size={16} color={theme.accent.primary} />
            </View>
            <Text style={[styles.featureText, { color: theme.text.primary }]}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.offerList}>
        {offers.map((offer) => {
          const selected = offer.id === selectedOfferId;
          return (
            <Pressable
              key={offer.id}
              onPress={() => {
                selectionTick();
                setSelectedOfferId(offer.id);
              }}
              style={[
                styles.offerCard,
                {
                  borderColor: selected ? theme.accent.warning : theme.border.subtle,
                  backgroundColor: theme.isDark ? 'rgba(19, 19, 26, 0.92)' : theme.background.card,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${offer.title} plan, ${offer.priceLabel}`}
            >
              <View style={styles.offerHeader}>
                <View>
                  <Text style={[styles.offerTitle, { color: theme.text.primary }]}>{offer.title}</Text>
                  <Text style={[styles.offerSubtitle, { color: theme.text.secondary }]}>
                    {offer.subtitle}
                  </Text>
                </View>
                {offer.badge && (
                  <View
                    style={[
                      styles.offerBadge,
                      {
                        backgroundColor: selected ? theme.accent.warning : theme.border.subtle,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.offerBadgeText,
                        { color: selected ? theme.text.inverse : theme.text.primary },
                      ]}
                    >
                      {offer.badge}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.offerPrice, { color: theme.text.primary }]}>
                {offer.priceLabel}
              </Text>
              <Text style={[styles.offerDescription, { color: theme.text.muted }]}>
                {offer.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.noticeCard,
          {
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.background.card,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        <Ionicons
          name={customer.isPreview ? 'construct-outline' : 'information-circle-outline'}
          size={18}
          color={theme.accent.secondary}
        />
        <Text style={[styles.noticeText, { color: theme.text.secondary }]}>
          {customer.isPreview
            ? 'Development preview mode is active. Purchase actions are simulated locally so the full flow can be tested without a billing SDK.'
            : 'Billing is not enabled in this build yet. This paywall is wired to the app so future provider integration can be added without changing navigation or state.'}
        </Text>
      </View>

      <View
        style={[
          styles.healthCard,
          {
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.background.card,
            borderColor: theme.border.subtle,
          },
        ]}
      >
        <View style={styles.healthHeader}>
          <View style={styles.healthHeaderCopy}>
            <Text style={[styles.healthTitle, { color: theme.text.primary }]}>
              Billing Health
            </Text>
            <Text style={[styles.healthSubtitle, { color: theme.text.secondary }]}>
              Provider: {customer.billingProvider}
            </Text>
          </View>
          <View
            style={[
              styles.healthBadge,
              { backgroundColor: `${healthAccent}18`, borderColor: `${healthAccent}33` },
            ]}
          >
            <View style={[styles.healthDot, { backgroundColor: healthAccent }]} />
            <Text style={[styles.healthBadgeText, { color: healthAccent }]}>
              {healthLabel}
            </Text>
          </View>
        </View>

        <View style={styles.healthMetrics}>
          <View style={styles.healthMetric}>
            <Text style={[styles.healthMetricLabel, { color: theme.text.muted }]}>
              Last Operation
            </Text>
            <Text style={[styles.healthMetricValue, { color: theme.text.primary }]}>
              {formatOperationLabel(diagnostics.lastOperation)}
            </Text>
          </View>
          <View style={styles.healthMetric}>
            <Text style={[styles.healthMetricLabel, { color: theme.text.muted }]}>
              Last Sync
            </Text>
            <Text style={[styles.healthMetricValue, { color: theme.text.primary }]}>
              {formatTimestamp(lastSyncedAt)}
            </Text>
          </View>
          <View style={styles.healthMetric}>
            <Text style={[styles.healthMetricLabel, { color: theme.text.muted }]}>
              Last Success
            </Text>
            <Text style={[styles.healthMetricValue, { color: theme.text.primary }]}>
              {formatTimestamp(diagnostics.lastSuccessAt)}
            </Text>
          </View>
        </View>

        {!diagnostics.isInitialized && (
          <Text style={[styles.healthMeta, { color: theme.text.muted }]}>
            Billing has not completed initialization in this session yet.
          </Text>
        )}

        {entitlementHealth.status !== 'healthy' && (
          <View
            style={[
              styles.healthIssueCard,
              {
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : theme.background.elevated,
                borderColor: theme.border.subtle,
              },
            ]}
          >
            <Text style={[styles.healthIssueTitle, { color: theme.text.primary }]}>
              Entitlement Check
            </Text>
            <Text style={[styles.healthIssueText, { color: theme.text.secondary }]}>
              {entitlementHealth.summary}
            </Text>
            {entitlementHealth.issues.slice(1, 3).map((issue) => (
              <Text key={issue} style={[styles.healthIssueBullet, { color: theme.text.muted }]}>
                • {issue}
              </Text>
            ))}
          </View>
        )}

        {diagnostics.lastErrorMessage && (
          <Text style={[styles.healthMeta, { color: theme.text.muted }]}>
            Last billing message: {diagnostics.lastErrorMessage}
          </Text>
        )}
      </View>

      {lastError && (
        <Text style={[styles.inlineError, { color: theme.accent.error }]}>{lastError}</Text>
      )}

      <Animated.View style={primaryPress.style}>
        <Pressable
          {...primaryPress.handlers}
          style={[
            styles.primaryButton,
            { backgroundColor: theme.accent.warning, opacity: isLoading ? 0.7 : 1 },
          ]}
          onPress={handlePurchase}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel={primaryButtonLabel}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.text.inverse} />
          ) : (
            <Text style={[styles.primaryButtonText, { color: theme.text.inverse }]}>
              {primaryButtonLabel}
            </Text>
          )}
        </Pressable>
      </Animated.View>

      {/* Continue free is rendered as a real secondary button with the same
          width and a visible border so it is not hidden as a low-contrast
          link — this is the dark-pattern Calm/Headspace get flagged for in
          mindfulness app reviews. */}
      {!hasActiveSubscription && (
        <Animated.View style={secondaryPress.style}>
          <Pressable
            {...secondaryPress.handlers}
            style={[
              styles.secondaryButton,
              { borderColor: theme.border.subtle, backgroundColor: 'transparent' },
            ]}
            onPress={() => {
              tapBack();
              onContinueFree();
            }}
            accessibilityRole="button"
            accessibilityLabel={copy.primaryFallback}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>
              {copy.primaryFallback}
            </Text>
          </Pressable>
        </Animated.View>
      )}

      <Pressable
        onPress={handleRestore}
        disabled={isLoading}
        style={styles.restoreRow}
        accessibilityRole="button"
        accessibilityLabel="Restore purchases"
      >
        <Text style={[styles.linkButton, { color: theme.accent.secondary }]}>
          Restore Purchases
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroTitleCompact: {
    fontSize: 28,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  accessMeta: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  featureList: {
    gap: 12,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
  },
  offerList: {
    gap: 12,
    marginBottom: 20,
  },
  offerCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  offerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  offerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  offerPrice: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  healthCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  healthHeaderCopy: {
    flex: 1,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  healthSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  healthMetrics: {
    gap: 10,
    marginBottom: 12,
  },
  healthMetric: {
    gap: 2,
  },
  healthMetricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  healthMetricValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  healthMeta: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  healthIssueCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 4,
  },
  healthIssueTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  healthIssueText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  healthIssueBullet: {
    fontSize: 12,
    lineHeight: 17,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  inlineError: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  restoreRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkButton: {
    fontSize: 14,
    fontWeight: '700',
  },
});
