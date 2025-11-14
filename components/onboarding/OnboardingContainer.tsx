/**
 * Onboarding Container
 * Base container for all onboarding screens with consistent styling
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing } from '../../theme';
import { useColorScheme } from '../../hooks/useColorScheme';

interface OnboardingContainerProps {
  children: React.ReactNode;
  showProgress?: boolean;
  progress?: number;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
  showProgress = true,
  progress = 0,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background.primary }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {showProgress && (
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.brand.primary,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
});
