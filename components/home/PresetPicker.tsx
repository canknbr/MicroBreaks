/**
 * PresetPicker Component
 * Modal for selecting timer presets
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { TIMER_PRESETS } from '@/constants/timer';
import { Spacing } from '@/theme';

interface PresetPickerProps {
  visible: boolean;
  currentPresetId: string;
  onSelect: (_presetId: string) => void;
  onClose: () => void;
}

function PresetPicker({ visible, currentPresetId, onSelect, onClose }: PresetPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content} accessibilityViewIsModal={true}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
          )}
          <Text style={styles.title}>Focus Preset</Text>
          <Text style={styles.subtitle}>Choose your work rhythm</Text>
          <View style={styles.presets}>
            {TIMER_PRESETS.map((preset) => {
              const isActive = preset.id === currentPresetId;
              return (
                <Pressable
                  key={preset.id}
                  style={[
                    styles.presetOption,
                    isActive && [styles.presetOptionActive, { borderColor: preset.color }],
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelect(preset.id);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`${preset.name}: ${preset.workMinutes} minutes work, ${preset.breakMinutes} minutes break`}
                >
                  <Text style={styles.presetIcon}>{preset.icon}</Text>
                  <View style={styles.presetInfo}>
                    <Text style={[styles.presetName, isActive && { color: preset.color }]}>
                      {preset.name}
                    </Text>
                    <Text style={styles.presetDurations}>
                      {preset.id === 'custom'
                        ? 'Set your own timings'
                        : `${preset.workMinutes}m / ${preset.breakMinutes}m / ${preset.longBreakMinutes}m`}
                    </Text>
                  </View>
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: preset.color }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.lg,
  },
  androidFallback: {
    backgroundColor: 'rgba(30, 30, 40, 0.98)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  presets: {
    gap: 10,
  },
  presetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  presetIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  presetDurations: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
});

export default memo(PresetPicker);
