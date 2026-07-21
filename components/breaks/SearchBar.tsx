import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/theme';
import { ThemeColors } from '@/hooks/useTheme';

export function SearchBar({
  value,
  onChangeText,
  onClear,
  theme,
  placeholder = 'Search breaks...',
}: {
  value: string;
  onChangeText: (_text: string) => void;
  onClear: () => void;
  theme: ThemeColors;
  placeholder?: string;
}) {
  return (
    <View
      style={[
        styles.searchContainer,
        {
          borderColor: theme.border.subtle,
          backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.background.card,
        },
      ]}
    >
      <Ionicons name="search" size={18} color={theme.text.muted} />
      <TextInput
        style={[styles.searchInput, { color: theme.text.primary }]}
        placeholder={placeholder}
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
    marginBottom: Spacing.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'GeneralSans-Medium',
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
});
