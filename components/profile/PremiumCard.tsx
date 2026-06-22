import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Spacing } from '@/theme';
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
      <Animated.View style={[styles.premiumCard, premiumStyle]}>
        <LinearGradient
          colors={['#FFD166', '#FF9500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.premiumContent}>
          <View style={styles.premiumIcon}>
            <Ionicons name="star" size={24} color="#000" />
          </View>
          <View style={styles.premiumInfo}>
            <Text style={styles.premiumTitle}>{premiumTitle}</Text>
            <Text style={styles.premiumDescription}>
              {premiumDescription}
            </Text>
            <View style={styles.premiumHealthRow}>
              <View style={styles.premiumHealthBadge}>
                <Ionicons name={premiumHealthSummary.icon} size={14} color="#000" />
                <Text style={styles.premiumHealthBadgeText}>
                  {premiumHealthSummary.label}
                </Text>
              </View>
              <Text style={styles.premiumHealthText}>
                {premiumHealthSummary.detail}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#000" />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  premiumCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  premiumDescription: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  premiumHealthRow: {
    marginTop: 10,
    gap: 8,
  },
  premiumHealthBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  premiumHealthBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
  premiumHealthText: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(0, 0, 0, 0.72)',
  },
});
