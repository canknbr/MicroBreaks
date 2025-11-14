/**
 * Explore Screen - MicroBreaks Resources & Information
 * Sleek, professional, icon-free black-white design
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/theme';

export default function ExploreScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>
            Learn about wellness practices and break strategies
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Smart Break Reminders</Text>
            <Text style={styles.cardDescription}>
              Customizable notifications that adapt to your work patterns and help you maintain consistent wellness habits.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guided Exercises</Text>
            <Text style={styles.cardDescription}>
              Quick, effective movements designed to reduce strain and increase energy throughout your workday.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progress Tracking</Text>
            <Text style={styles.cardDescription}>
              Monitor your wellness journey with simple, meaningful metrics that show your commitment to self-care.
            </Text>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>

          <View style={styles.benefitRow}>
            <View style={styles.benefitDot} />
            <Text style={styles.benefitText}>Reduce physical strain and prevent injury</Text>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitDot} />
            <Text style={styles.benefitText}>Improve focus and mental clarity</Text>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitDot} />
            <Text style={styles.benefitText}>Boost energy levels naturally</Text>
          </View>

          <View style={styles.benefitRow}>
            <View style={styles.benefitDot} />
            <Text style={styles.benefitText}>Create sustainable wellness habits</Text>
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
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.displaySmall,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.dark.text.secondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.dark.card.background,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: Colors.dark.text.primary,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.secondary,
    lineHeight: 22,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.text.primary,
    marginRight: Spacing.md,
  },
  benefitText: {
    ...Typography.bodyMedium,
    color: Colors.dark.text.primary,
    flex: 1,
    lineHeight: 22,
  },
});
