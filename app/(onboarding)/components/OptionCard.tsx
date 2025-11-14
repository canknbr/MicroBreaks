/**
 * Option Card Component
 * Selectable card for onboarding choices
 */

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/theme';

interface OptionCardProps {
  icon?: string;
  title: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  style?: any;
}

export default function OptionCard({
  icon,
  title,
  description,
  selected = false,
  onPress,
  style,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <View style={styles.textContainer}>
          <Text style={[styles.title, selected && styles.titleSelected]}>
            {title}
          </Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      </View>
      <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card.background,
    borderWidth: 2,
    borderColor: Colors.light.border.default,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    minHeight: 68,
  },
  cardSelected: {
    borderColor: Colors.light.border.focus,
    backgroundColor: Colors.light.status.infoLight,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginRight: Spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...Typography.bodyLargeBold,
    color: Colors.light.text.primary,
    marginBottom: 2,
  },
  titleSelected: {
    color: Colors.light.brand.primary,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.light.text.secondary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  checkboxSelected: {
    backgroundColor: Colors.light.interactive.primary,
    borderColor: Colors.light.interactive.primary,
  },
  checkmark: {
    color: Colors.light.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
