import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IoniconsName } from '@/types/icons';
import * as Haptics from 'expo-haptics';

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

function PickerRow({
  label,
  active,
  icon,
  first,
  onPress,
}: {
  label: string;
  active: boolean;
  icon?: IoniconsName;
  first?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.option, !first && styles.optionDivider]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <View style={styles.lead}>{active ? <View style={styles.bar} /> : null}</View>
      {icon ? (
        <Ionicons
          name={icon}
          size={19}
          color={active ? '#FF2472' : 'rgba(255,255,255,0.4)'}
          style={styles.optionIcon}
        />
      ) : null}
      <Text style={[styles.optionText, active ? styles.optionTextActive : styles.optionTextInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

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
          <Text style={styles.modalTitle}>Reminder Interval</Text>
          <Text style={styles.modalSubtitle}>How often should we remind you?</Text>
          <View style={styles.options}>
            {REMINDER_INTERVALS.map((interval, i) => (
              <PickerRow
                key={interval.value}
                label={interval.label}
                active={currentValue === interval.value}
                first={i === 0}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(interval.value);
                  onClose();
                }}
              />
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
          <Text style={styles.modalTitle}>App Theme</Text>
          <Text style={styles.modalSubtitle}>Choose your preferred appearance</Text>
          <View style={styles.options}>
            {THEME_OPTIONS.map((option, i) => (
              <PickerRow
                key={option.value}
                label={option.label}
                active={currentValue === option.value}
                icon={themeIcons[option.value]}
                first={i === 0}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(option.value);
                  onClose();
                }}
              />
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
    width: '82%',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1C1922',
    paddingHorizontal: 24,
    paddingVertical: 26,
  },
  modalTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 12,
  },
  options: {
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  lead: {
    width: 28,
    justifyContent: 'center',
  },
  bar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FF2472',
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  optionTextInactive: {
    color: 'rgba(255,255,255,0.34)',
  },
});
