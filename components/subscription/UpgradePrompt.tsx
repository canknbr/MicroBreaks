import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';
import { useTheme } from '@/hooks/useTheme';

interface UpgradePromptProps {
  title: string;
  subtitle: string;
  bullets: readonly string[];
  ctaLabel: string;
  onPress: () => void;
  icon?: IoniconsName;
  accentColors?: readonly [string, string];
}

export default function UpgradePrompt({
  title,
  subtitle,
  bullets,
  ctaLabel,
  onPress,
  icon = 'lock-closed',
  accentColors = ['#FFD166', '#FF9500'],
}: UpgradePromptProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          backgroundColor: theme.isDark ? 'rgba(19, 19, 26, 0.92)' : theme.background.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: theme.isDark ? 0 : 0.08,
          shadowRadius: 12,
          elevation: theme.isDark ? 0 : 5,
        },
      ]}
    >
      <LinearGradient
        colors={[`${accentColors[0]}22`, `${accentColors[1]}12`]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Ionicons name={icon} size={14} color={theme.text.inverse} />
          <Text style={styles.badgeText}>PRO</Text>
        </View>
      </View>

      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>{subtitle}</Text>

      <View style={styles.bulletList}>
        {bullets.map((bullet) => (
          <View key={bullet} style={styles.bulletRow}>
            <View style={[styles.bulletDot, { backgroundColor: accentColors[0] }]} />
            <Text style={[styles.bulletText, { color: theme.text.primary }]}>{bullet}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onPress}
        style={styles.ctaButton}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
      >
        <LinearGradient
          colors={[accentColors[0], accentColors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color="#000000" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  bulletList: {
    gap: 10,
    marginBottom: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  ctaButton: {
    alignSelf: 'flex-start',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ctaText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
