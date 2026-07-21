/**
 * Option row — "Outsiders" editorial redesign.
 * No card / box / blur / icon / checkbox. Choices are type: brightness carries
 * the selection, with a single thin pink accent bar. (The `icon` prop is
 * intentionally ignored — emoji chrome is gone.)
 */

import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

interface OptionCardProps {
  icon?: string;
  title: string;
  description?: string;
  selected?: boolean;
  onPress: () => void;
  variant?: 'default' | 'compact';
  style?: any;
}

export default function OptionCard({
  title,
  description,
  selected = false,
  onPress,
  variant = 'default',
  style,
}: OptionCardProps) {
  const compact = variant === 'compact';

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.row, style]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={description ? `${title}. ${description}` : title}
    >
      <View style={styles.lead}>{selected ? <View style={styles.bar} /> : null}</View>
      <View style={styles.text}>
        <Text style={[compact ? styles.titleCompact : styles.title, selected ? styles.on : styles.off]}>
          {title}
        </Text>
        {description && !compact ? (
          <Text style={[styles.desc, selected && styles.descOn]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  lead: {
    width: 30,
    justifyContent: 'center',
  },
  bar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
  },
  text: {
    flex: 1,
  },
  title: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.4,
  },
  titleCompact: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  on: {
    color: '#FFFFFF',
  },
  off: {
    color: 'rgba(255,255,255,0.34)',
  },
  desc: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 2,
  },
  descOn: {
    color: 'rgba(255,255,255,0.55)',
  },
});
