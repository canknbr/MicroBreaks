import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { BootstrapIssue } from '@/services/bootstrap';

interface BootstrapStatusScreenProps {
  issue: BootstrapIssue;
  onRetry: () => void;
}

export function BootstrapStatusScreen({
  issue,
  onRetry,
}: BootstrapStatusScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.eyebrow}>Startup Blocked</Text>
        <Text style={styles.title}>MicroBreaks couldn&apos;t finish loading.</Text>
        <Text style={styles.message}>{issue.message}</Text>
        <Text style={styles.meta}>Failed step: {issue.step}</Text>
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Retry startup</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#101010',
    padding: 24,
    gap: 12,
  },
  eyebrow: {
    color: '#FFD166',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  message: {
    color: '#D0D0D0',
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: '#808080',
    fontSize: 13,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#06FFA5',
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#00140D',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default BootstrapStatusScreen;
