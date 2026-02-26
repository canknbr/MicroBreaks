/**
 * Terms of Service Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { TERMS_OF_SERVICE } from '@/constants/legal';
import { Spacing } from '@/theme';

export default function TermsOfServiceScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            style={[styles.backButton, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : theme.border.subtle }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={theme.text.primary} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text.primary }]}>Terms of Service</Text>
          <View style={styles.backButton} />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.body, { color: theme.text.secondary }]}>
            {TERMS_OF_SERVICE}
          </Text>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 80,
  },
});
