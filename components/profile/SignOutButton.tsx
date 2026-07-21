import { Text, StyleSheet, Pressable } from 'react-native';
import { Spacing } from '@/theme';

export function SignOutButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={styles.signOutButton}
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      onPress={onPress}
    >
      <Text style={styles.signOutText}>Sign Out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: Spacing.md,
  },
  signOutText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 15,
    color: '#EB3E38',
  },
});
