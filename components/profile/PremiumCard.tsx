import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import type { PremiumHealthSummary } from '@/services/billing/healthSummary';

export function PremiumCard({
  premiumTitle,
  premiumDescription,
  premiumHealthSummary,
  premiumStyle,
  onPress,
}: {
  premiumTitle: string;
  premiumDescription: string;
  premiumHealthSummary: PremiumHealthSummary;
  premiumStyle: StyleProp<ViewStyle>;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${premiumTitle}. ${premiumDescription}. ${premiumHealthSummary.label}. ${premiumHealthSummary.detail}`}
    >
      <Animated.View style={[styles.container, premiumStyle]}>
        <View style={styles.lead}>
          <View style={styles.bar} />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{premiumTitle}</Text>
          <Text style={styles.description}>{premiumDescription}</Text>
          <View style={styles.healthRow}>
            <Ionicons name={premiumHealthSummary.icon} size={13} color="rgba(255,255,255,0.45)" />
            <Text style={styles.healthText}>
              {premiumHealthSummary.label} · {premiumHealthSummary.detail}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.4)" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 30,
  },
  lead: {
    width: 26,
    justifyContent: 'center',
  },
  bar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
  },
  info: {
    flex: 1,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 18,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  description: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 3,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  healthText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
});
