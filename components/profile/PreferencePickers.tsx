import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';

const REMINDER_INTERVALS = [
  { label: '15 min', value: 15 },
  { label: '25 min', value: 25 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
];

const THEME_OPTIONS: { label: string; value: 'dark' | 'light' | 'system' }[] = [
  { label: 'Dark', value: 'dark' },
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
];

export function IntervalPickerModal({
  visible,
  currentValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentValue: number;
  onSelect: (_value: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent} accessibilityViewIsModal={true}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidModalFallback]} />
          )}
          <Text style={styles.modalTitle}>Reminder Interval</Text>
          <Text style={styles.modalSubtitle}>How often should we remind you?</Text>
          <View style={styles.intervalOptions}>
            {REMINDER_INTERVALS.map((interval) => (
              <Pressable
                key={interval.value}
                style={[
                  styles.intervalOption,
                  currentValue === interval.value && styles.intervalOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(interval.value);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.intervalOptionText,
                    currentValue === interval.value && styles.intervalOptionTextActive,
                  ]}
                >
                  {interval.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

export function ThemePickerModal({
  visible,
  currentValue,
  onSelect,
  onClose,
}: {
  visible: boolean;
  currentValue: 'dark' | 'light' | 'system';
  onSelect: (_value: 'dark' | 'light' | 'system') => void;
  onClose: () => void;
}) {
  const themeIcons: Record<string, IoniconsName> = {
    dark: 'moon',
    light: 'sunny',
    system: 'phone-portrait',
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent} accessibilityViewIsModal={true}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidModalFallback]} />
          )}
          <Text style={styles.modalTitle}>App Theme</Text>
          <Text style={styles.modalSubtitle}>Choose your preferred appearance</Text>
          <View style={styles.intervalOptions}>
            {THEME_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.intervalOption,
                  styles.themeOption,
                  currentValue === option.value && styles.intervalOptionActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(option.value);
                  onClose();
                }}
              >
                <Ionicons
                  name={themeIcons[option.value]}
                  size={20}
                  color={
                    currentValue === option.value
                      ? '#06FFA5'
                      : 'rgba(255, 255, 255, 0.6)'
                  }
                  style={styles.themeOptionIcon}
                />
                <Text
                  style={[
                    styles.intervalOptionText,
                    currentValue === option.value && styles.intervalOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.lg,
  },
  androidModalFallback: {
    backgroundColor: 'rgba(30, 30, 40, 0.98)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  intervalOptions: {
    gap: 10,
  },
  intervalOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  intervalOptionActive: {
    backgroundColor: 'rgba(6, 255, 165, 0.2)',
    borderWidth: 1,
    borderColor: '#06FFA5',
  },
  intervalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  intervalOptionTextActive: {
    color: '#06FFA5',
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  themeOptionIcon: {
    marginRight: 12,
  },
});
