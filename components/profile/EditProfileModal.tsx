import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
} from 'react-native';
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
  modalTitle: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 22,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  editModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1C1922',
    padding: 24,
  },
  inputContainer: {
    marginTop: 20,
  },
  inputLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatarOptionActive: {
    borderColor: '#FF2472',
  },
  avatarInitialOption: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 20,
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
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  saveButtonText: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 16,
    color: '#0B0A0D',
  },
});
