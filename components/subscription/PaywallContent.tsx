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
  getOffersForTier,
  getTierForOfferId,
  PURCHASABLE_TIERS,
  TIER_HIGHLIGHTS,
  TIER_LABELS,
  type Tier,
} from '@/services/subscription/tiers';
import TierSelector from './TierSelector';
import BillingPeriodToggle, {
  type BillingPeriod,
} from './BillingPeriodToggle';
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
    case 'library':
      return {
        headline: 'Unlock the full movement library',
        subheadline:
          `Every animated move for ${primaryNeed.label} and beyond — guided demo sessions for neck, back, core, legs, and quick cardio resets.`,
        primaryFallback: fallbackLabel,
      };
    case 'stats':
      return {
        headline: 'See what your recovery story is missing',
        subheadline:
          `You already have the top-line story. Pro shows the trend, timing, and recovery mix underneath it so you know what to fix next for ${primaryNeed.label}.`,
        primaryFallback: fallbackLabel,
      };
    case 'weekly_story':
      return {
        headline: 'See the story behind your week',
        subheadline:
          `Weekly recovery summaries show your trend, your best time of day, and the recovery mix that fits your ${primaryNeed.summary} routine.`,
        primaryFallback: fallbackLabel,
      };
    case 'home_missions':
      return {
        headline: 'Three fresh missions every day',
        subheadline:
          'Light variety prompts that keep your routine interesting and award bonus XP — no thinking required.',
        primaryFallback: fallbackLabel,
      };
    case 'free_quota':
      return {
        headline: 'You hit today’s free limit',
        subheadline:
          'Free covers five sessions a day. Upgrade for unlimited breaks plus the full guided library and weekly insights.',
        primaryFallback: fallbackLabel,
      };
    case 're_engage':
      return {
        headline: 'Welcome back — your subscription lapsed',
        subheadline: `Pick up where you left off. Your routines, history, and streak are all still here; just need access to unlock the deeper ${primaryNeed.summary} layer again.`,
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
    library:
      'The complete animated movement library — 100+ desk-friendly moves with guided sessions',
    stats: `The full recovery pattern layer behind your ${primaryNeed.label} routine`,
    weekly_story: `Weekly story showing your ${primaryNeed.label} trends, best windows, and routine mix`,
    home_missions: 'Three fresh daily missions with bonus XP for variety and timing',
    free_quota: `Unlimited break sessions instead of the 5/day cap — keep your ${primaryNeed.label} routine flowing`,
    re_engage: `Your ${primaryNeed.program.toLowerCase()} routine is one tap away — full library, weekly story, and faster timing all return on day one`,
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

  const recommendedOffer = offers.find((offer) => offer.recommended) ?? null;
  const recommendedTier = (
    recommendedOffer ? getTierForOfferId(recommendedOffer.id) : 'pro'
  ) as Exclude<Tier, 'free'>;
  const defaultTier: Exclude<Tier, 'free'> = PURCHASABLE_TIERS.includes(
    recommendedTier as Exclude<Tier, 'free'>
  )
    ? recommendedTier
    : 'pro';
  const defaultPeriod: BillingPeriod = recommendedOffer?.billingPeriod ?? 'yearly';

  const [selectedTier, setSelectedTier] = useState<Exclude<Tier, 'free'>>(defaultTier);
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>(defaultPeriod);
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

  const tierOfferPair = useMemo(
    () => getOffersForTier(selectedTier, offers),
    [selectedTier, offers]
  );

  const selectedOffer = useMemo<SubscriptionOffer | null>(() => {
    if (selectedPeriod === 'monthly') {
      return tierOfferPair.monthly ?? tierOfferPair.annual;
    }
    return tierOfferPair.annual ?? tierOfferPair.monthly;
  }, [tierOfferPair, selectedPeriod]);

  // If the currently selected period isn't offered for the new tier,
  // flip to the one that is so the offer card never goes blank.
  useEffect(() => {
    if (selectedPeriod === 'monthly' && !tierOfferPair.monthly && tierOfferPair.annual) {
      setSelectedPeriod('yearly');
    } else if (selectedPeriod === 'yearly' && !tierOfferPair.annual && tierOfferPair.monthly) {
      setSelectedPeriod('monthly');
    }
  }, [tierOfferPair, selectedPeriod]);

  // Compute annual savings vs. monthly so the toggle can show the
  // discount label honestly. Falls back to no label when one side
  // is missing.
  const annualSavingsLabel = useMemo(() => {
    const monthly = tierOfferPair.monthly;
    const annual = tierOfferPair.annual;
    if (!monthly || !annual || monthly.price <= 0) return undefined;
    const yearlyMonthlyCost = monthly.price * 12;
    if (annual.price >= yearlyMonthlyCost) return undefined;
    const saved = 1 - annual.price / yearlyMonthlyCost;
    const pct = Math.round(saved * 100);
    return pct > 0 ? `Save ${pct}%` : undefined;
  }, [tierOfferPair]);

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
      : `Continue with ${TIER_LABELS[selectedTier]}`;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.eyebrow, { color: theme.text.muted }]}>
            {accessLabel?.toUpperCase()}
          </Text>
          {onDismiss && (
            <Pressable
              onPress={onDismiss}
              style={styles.closeButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close subscription screen"
            >
              <Ionicons name="close" size={24} color={theme.text.muted} />
            </Pressable>
          )}
        </View>

        <Text
          style={[
            styles.headline,
            { color: theme.text.primary },
            compactHeader && styles.headlineCompact,
          ]}
        >
          {copy.headline}
        </Text>
        <Text style={[styles.subhead, { color: theme.text.secondary }]}>
          {copy.subheadline}
        </Text>

        {accessDateLabel && (
          <Text style={[styles.fineMeta, { color: theme.text.muted }]}>
            Current access valid through {accessDateLabel}
          </Text>
        )}
      </View>

      <TierSelector
        selected={selectedTier}
        onSelect={(tier) => {
          selectionTick();
          setSelectedTier(tier);
        }}
        recommended={recommendedTier}
      />

      <BillingPeriodToggle
        selected={selectedPeriod}
        onSelect={(period) => {
          selectionTick();
          setSelectedPeriod(period);
        }}
        annualSavingsLabel={annualSavingsLabel}
      />

      {selectedOffer && (
        <View
          style={styles.planBlock}
          accessibilityLabel={`${selectedOffer.title}, ${selectedOffer.priceLabel}`}
        >
          <View style={styles.planHead}>
            <Text style={[styles.planTitle, { color: theme.text.primary }]}>
              {selectedOffer.title}
            </Text>
            {selectedOffer.badge && (
              <Text style={[styles.planBadge, { color: theme.accent.primary }]}>
                {selectedOffer.badge.toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={[styles.planPrice, { color: theme.text.primary }]}>
            {selectedOffer.priceLabel}
          </Text>
          <Text style={[styles.planDesc, { color: theme.text.muted }]}>
            {selectedOffer.subtitle} · {selectedOffer.description}
          </Text>
        </View>
      )}

      {selectedTier !== 'solo' && (
        <Text style={[styles.tierIncludesHint, { color: theme.text.muted }]}>
          Includes everything in {TIER_LABELS[selectedTier === 'pro' ? 'solo' : 'pro']}, plus:
        </Text>
      )}

      <View style={styles.featureList}>
        {TIER_HIGHLIGHTS[selectedTier].map((feature, i) => (
          <View key={feature} style={[styles.featureRow, i > 0 && styles.featureDivider]}>
            <Text style={[styles.featureCheck, { color: theme.accent.primary }]}>✓</Text>
            <Text style={[styles.featureText, { color: theme.text.primary }]}>{feature}</Text>
          </View>
        ))}
      </View>

      {placement === 'onboarding' && featureList.length > 0 && (
        <View style={styles.whyBlock}>
          <Text style={[styles.whyLabel, { color: theme.text.muted }]}>
            WHY THIS FOR YOU
          </Text>
          <Text style={[styles.whyBody, { color: theme.text.secondary }]}>
            {featureList[0]}
          </Text>
        </View>
      )}

      {lastError && (
        <Text style={[styles.inlineError, { color: theme.accent.error }]}>{lastError}</Text>
      )}

      <Animated.View style={primaryPress.style}>
        <Pressable
          {...primaryPress.handlers}
          style={[styles.primaryButton, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handlePurchase}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel={primaryButtonLabel}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#0B0A0D" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {primaryButtonLabel}
            </Text>
          )}
        </Pressable>
      </Animated.View>

      {/* Continue free stays a full-width, readable text action — never a
          low-contrast link — so it isn't the dark pattern Calm/Headspace get
          flagged for in mindfulness app reviews. */}
      {!hasActiveSubscription && (
        <Animated.View style={secondaryPress.style}>
          <Pressable
            {...secondaryPress.handlers}
            style={styles.secondaryButton}
            onPress={() => {
              tapBack();
              onContinueFree();
            }}
            accessibilityRole="button"
            accessibilityLabel={copy.primaryFallback}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.text.secondary }]}>
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
        <Text style={[styles.linkButton, { color: theme.text.muted }]}>
          Restore purchases
        </Text>
      </Pressable>

      {/* Billing scaffolding — quiet fine print, and full diagnostics only in
          the dev preview build (never fronting a real paywall). */}
      <Text style={[styles.fineNotice, { color: theme.text.muted }]}>
        {customer.isPreview
          ? 'Development preview — purchases are simulated locally so the full flow can be tested without a billing SDK.'
          : 'Billing is not enabled in this build yet.'}
      </Text>

      {customer.isPreview && (
        <View style={[styles.healthBlock, { borderTopColor: theme.border.subtle }]}>
          <Text style={[styles.healthLine, { color: theme.text.muted }]}>
            BILLING · {customer.billingProvider} ·{' '}
            <Text style={{ color: healthAccent }}>{healthLabel}</Text>
          </Text>
          <Text style={[styles.healthMeta, { color: theme.text.muted }]}>
            last sync {formatTimestamp(lastSyncedAt)} · last op{' '}
            {formatOperationLabel(diagnostics.lastOperation)}
          </Text>
          {entitlementHealth.status !== 'healthy' && (
            <Text style={[styles.healthMeta, { color: theme.text.muted }]}>
              {entitlementHealth.summary}
            </Text>
          )}
          {diagnostics.lastErrorMessage && (
            <Text style={[styles.healthMeta, { color: theme.text.muted }]}>
              {diagnostics.lastErrorMessage}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 12,
    letterSpacing: 2.4,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
  },
  headlineCompact: {
    fontSize: 30,
    lineHeight: 34,
  },
  subhead: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
  },
  fineMeta: {
    marginTop: 14,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 12,
  },
  planBlock: {
    marginBottom: 24,
  },
  planHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  planTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  planBadge: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 11,
    letterSpacing: 1.2,
  },
  planPrice: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 36,
    letterSpacing: -1.5,
  },
  planDesc: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  tierIncludesHint: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  featureList: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingVertical: 14,
  },
  featureDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  featureCheck: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 16,
    lineHeight: 24,
  },
  featureText: {
    flex: 1,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  whyBlock: {
    marginBottom: 24,
  },
  whyLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  whyBody: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  inlineError: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 13,
    marginBottom: 14,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    color: '#0B0A0D',
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 15,
  },
  restoreRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkButton: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: 14,
  },
  fineNotice: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 8,
  },
  healthBlock: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  healthLine: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1,
  },
  healthMeta: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
});
