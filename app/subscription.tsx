import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaywallContent } from '@/components/subscription';
import { useTheme } from '@/hooks/useTheme';
import type { PaywallPlacement } from '@/services/billing';

const PAYWALL_PLACEMENTS: PaywallPlacement[] = [
  'onboarding',
  'profile',
  'breaks',
  'stats',
  'weekly_story',
  'home_missions',
  'free_quota',
  're_engage',
];

function parsePlacement(value: string | string[] | undefined): PaywallPlacement {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && PAYWALL_PLACEMENTS.includes(candidate as PaywallPlacement)) {
    return candidate as PaywallPlacement;
  }
  return 'profile';
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ placement?: string | string[] }>();
  const placement = parsePlacement(params.placement);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background.primary }]}>
      <View style={styles.container}>
        <PaywallContent
          placement={placement}
          onDismiss={() => router.back()}
          onContinueFree={() => router.back()}
          onPurchaseSuccess={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
