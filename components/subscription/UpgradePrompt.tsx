import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';
import { useTheme } from '@/hooks/useTheme';

interface UpgradePromptProps {
  title: string;
  subtitle: string;
  bullets: readonly string[];
  ctaLabel: string;
  onPress: () => void;
  // `icon` is accepted for call-site compatibility but no longer rendered.
  icon?: IoniconsName;
  accentColors?: readonly [string, string];
}

export default function UpgradePrompt({
  title,
  subtitle,
  bullets,
  ctaLabel,
  onPress,
  accentColors = ['#FF2472', '#FF2472'],
}: UpgradePromptProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { borderColor: theme.border.subtle }]}>
      <Text style={[styles.eyebrow, { color: accentColors[0] }]}>PRO</Text>
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
        <Text style={styles.ctaText}>{ctaLabel}</Text>
        <Ionicons name="arrow-forward" size={16} color="#0B0A0D" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  eyebrow: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 11,
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  bulletList: {
    marginBottom: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 7,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  ctaText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 15,
    color: '#0B0A0D',
  },
});
