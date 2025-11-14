/**
 * Home Screen - MicroBreaks Dashboard
 * Inspired by "How We Feel" design with pure black background
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.emoji}>🎯</Text>
        </View>

        {/* Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Breaks taken</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>0m</Text>
              <Text style={styles.statLabel}>Time invested</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.actionCard}>
            <Text style={styles.actionEmoji}>⏰</Text>
            <Text style={styles.actionText}>Start a micro break</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    ...Typography.displaySmall,
    color: Colors.dark.text.primary,
  },
  emoji: {
    fontSize: 40,
  },
  card: {
    backgroundColor: Colors.dark.card.background,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.displaySmall,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.xxs,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.dark.text.secondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.border.default,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.md,
  },
  actionCard: {
    backgroundColor: Colors.dark.card.background,
    borderRadius: 16,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  actionText: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.primary,
  },
});
