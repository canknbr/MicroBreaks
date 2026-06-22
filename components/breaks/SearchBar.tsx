import { View, StyleSheet, Platform, Pressable, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/theme';
import { ThemeColors } from '@/hooks/useTheme';
import { cardShadow } from '@/utils/cardShadow';

export function SearchBar({
  value,
  onChangeText,
  onClear,
  theme,
}: {
  value: string;
  onChangeText: (_text: string) => void;
  onClear: () => void;
  theme: ThemeColors;
}) {
  return (
    <View style={[
      styles.searchContainer,
      {
        borderColor: theme.isDark ? theme.border.subtle : 'transparent',
        backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
        ...cardShadow(theme.isDark, { height: 1, opacity: 0.06, radius: 4, elevation: 2 }),
      }
    ]}>
      {/* BlurView only for dark mode */}
      {theme.isDark && (
        Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
        )
      )}
      <Ionicons name="search" size={18} color={theme.text.muted} />
      <TextInput
        style={[styles.searchInput, { color: theme.text.primary }]}
        placeholder="Search breaks..."
        placeholderTextColor={theme.text.muted}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={theme.text.muted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
});
