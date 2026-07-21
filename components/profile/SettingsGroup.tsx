/**
 * SettingsGroup — editorial section wrapper: a small-caps label over a plain
 * container of hairline-divided rows. No card / blur / border / shadow.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ThemeColors } from '@/hooks/useTheme';

export function SettingsGroup({
  label,
  theme,
  children,
}: {
  label: string;
  theme: ThemeColors;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text
        style={[styles.header, { color: theme.text.muted }]}
        accessibilityRole="header"
      >
        {label}
      </Text>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 34,
  },
  header: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
});
