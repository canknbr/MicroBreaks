import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Spacing } from '@/theme';

const AVATAR_EMOJIS = ['😊', '😎', '🧘', '💪', '🌟', '🔥', '🎯', '🌈', '🦋', '🌸', '🍀', '⭐'];

export function EditProfileModal({
  visible,
  currentName,
  currentAvatar,
  onSave,
  onClose,
}: {
  visible: boolean;
  currentName: string;
  currentAvatar: string | null;
  onSave: (_name: string, _avatar: string | null) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(currentName);
  const [avatar, setAvatar] = useState<string | null>(currentAvatar);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setAvatar(currentAvatar);
    }
  }, [visible, currentName, currentAvatar]);

  const handleSave = () => {
    if (name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave(name.trim(), avatar);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.editModalContent}
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal={true}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.androidModalFallback]} />
          )}
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              maxLength={20}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Avatar</Text>
            <View style={styles.avatarGrid}>
              <Pressable
                style={[styles.avatarOption, !avatar && styles.avatarOptionActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAvatar(null);
                }}
              >
                <Text style={styles.avatarInitialOption}>
                  {name.charAt(0).toUpperCase() || 'U'}
                </Text>
              </Pressable>
              {AVATAR_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[styles.avatarOption, avatar === emoji && styles.avatarOptionActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAvatar(emoji);
                  }}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!name.trim()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </Pressable>
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
  editModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: Spacing.lg,
  },
  inputContainer: {
    marginTop: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionActive: {
    borderColor: '#06FFA5',
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
  },
  avatarInitialOption: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#06FFA5',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(6, 255, 165, 0.3)',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
