/**
 * Screen Header
 * Consistent header for onboarding screens with title and subtitle
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../../theme';
import { useColorScheme } from '../../hooks/useColorScheme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  emoji,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Animated.View entering={FadeInUp.duration(600)} style={styles.container}>
      {emoji && (
        <Text style={styles.emoji}>{emoji}</Text>
      )}
      <Text
        style={[
          styles.title,
          Typography.headlineLarge,
          { color: colors.text.primary },
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            styles.subtitle,
            Typography.bodyLarge,
            { color: colors.text.secondary },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
});
