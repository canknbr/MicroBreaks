/**
 * Zone Circuit Rail
 * Horizontal chips for the auto-composed 3-move zone circuits. Tapping an
 * unlocked circuit starts the chained session directly; locked circuits
 * route to the paywall.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Exercise } from '@/data/exercises';
import type { ThemeColors } from '@/hooks/useTheme';
import { cardShadow } from '@/utils/cardShadow';

interface CircuitRailProps {
  title: string;
  subtitle: string;
  durationLabel: (_minutes: number) => string;
  circuits: readonly Exercise[];
  theme: ThemeColors;
  isLocked: (_id: string) => boolean;
  onPressCircuit: (_circuit: Exercise, _locked: boolean) => void;
}

export function CircuitRail({
  title,
  subtitle,
  durationLabel,
  circuits,
  theme,
  isLocked,
  onPressCircuit,
}: CircuitRailProps) {
  if (circuits.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="repeat" size={15} color={theme.accent.secondary} />
        <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
      </View>
      <Text style={[styles.subtitle, { color: theme.text.muted }]}>{subtitle}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
      >
        {circuits.map((circuit) => {
          const locked = isLocked(circuit.id);
          const minutes = Math.max(1, Math.round(circuit.totalDuration / 60));

          return (
            <Pressable
              key={circuit.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onPressCircuit(circuit, locked);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${circuit.title}, ${durationLabel(minutes)}`}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: theme.isDark
                    ? 'rgba(25, 25, 35, 0.9)'
                    : theme.background.card,
                  borderColor: `${circuit.color}45`,
                  opacity: pressed ? 0.85 : 1,
                  ...cardShadow(theme.isDark, {
                    height: 1,
                    opacity: 0.07,
                    radius: 5,
                    elevation: 2,
                  }),
                },
              ]}
            >
              <Text style={styles.chipIcon} accessibilityElementsHidden>
                {circuit.icon}
              </Text>
              <View style={styles.chipText}>
                <Text
                  style={[styles.chipTitle, { color: theme.text.primary }]}
                  numberOfLines={1}
                >
                  {circuit.title}
                </Text>
                <Text style={[styles.chipMeta, { color: circuit.color }]}>
                  {durationLabel(minutes)}
                </Text>
              </View>
              <Ionicons
                name={locked ? 'lock-closed' : 'play-circle'}
                size={18}
                color={locked ? theme.text.muted : circuit.color}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  rail: {
    gap: 10,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: 230,
  },
  chipIcon: {
    fontSize: 18,
  },
  chipText: {
    flexShrink: 1,
  },
  chipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipMeta: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
});
