/**
 * Selection Card
 * Reusable card component for single and multi-select options
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useColorScheme } from '../../hooks/useColorScheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  selected?: boolean;
  onPress: () => void;
  multiSelect?: boolean;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  title,
  subtitle,
  icon,
  selected = false,
  onPress,
  multiSelect = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle = selected
    ? {
        backgroundColor: `${colors.brand.primary}15`,
        borderColor: colors.brand.primary,
        borderWidth: 2,
      }
    : {
        backgroundColor: colors.background.secondary,
        borderColor: colors.border.default,
        borderWidth: 1,
      };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.card, cardStyle, animatedStyle, selected && Shadows.md]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              Typography.labelLarge,
              { color: selected ? colors.brand.primary : colors.text.primary },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                Typography.bodySmall,
                { color: colors.text.secondary },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {selected && (
          <View
            style={[
              styles.checkmark,
              { backgroundColor: colors.brand.primary },
            ]}
          >
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 72,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
