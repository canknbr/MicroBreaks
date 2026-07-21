/**
 * Zone Circuit Rail — editorial. Horizontal list of auto-composed 3-move zone
 * circuits: a play/lock affordance + type, no emoji / card chrome.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { Exercise } from '@/data/exercises';
import type { ThemeColors } from '@/hooks/useTheme';

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
      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
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
              style={({ pressed }) => [styles.chip, { opacity: pressed ? 0.7 : 1 }]}
            >
              <Ionicons
                name={locked ? 'lock-closed' : 'play-circle'}
                size={30}
                color={locked ? theme.text.muted : circuit.color}
              />
              <View style={styles.chipText}>
                <Text
                  style={[styles.chipTitle, { color: theme.text.primary }]}
                  numberOfLines={1}
                >
                  {circuit.title}
                </Text>
                <Text style={[styles.chipMeta, { color: theme.text.muted }]}>
                  {durationLabel(minutes)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  rail: {
    gap: 30,
    paddingRight: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: 250,
  },
  chipText: {
    flexShrink: 1,
  },
  chipTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  chipMeta: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    marginTop: 3,
  },
});
