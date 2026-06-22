import { View, ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { IoniconsName } from '@/types/icons';
import { Spacing } from '@/theme';
import { ThemeColors } from '@/hooks/useTheme';
import { cardShadow } from '@/utils/cardShadow';
import { CATEGORY_DEFINITIONS } from '@/features/recovery/outcomePacks';
import { DURATION_FILTERS } from './constants';

export function FilterChips({
  selectedCategory,
  selectedDuration,
  onCategoryChange,
  onDurationChange,
  theme,
}: {
  selectedCategory: string | null;
  selectedDuration: string;
  onCategoryChange: (_id: string | null) => void;
  onDurationChange: (_id: string) => void;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {/* Category Filters */}
        <Pressable
          style={[
            styles.filterChip,
            {
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
              ...cardShadow(theme.isDark, { height: 1, opacity: 0.06, radius: 3, elevation: 2 }),
            },
            !selectedCategory && [styles.filterChipActive, { backgroundColor: theme.isDark ? 'rgba(6, 255, 165, 0.15)' : `${theme.accent.primary}15` }],
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onCategoryChange(null);
          }}
        >
          <Text style={[styles.filterChipText, { color: theme.text.secondary }, !selectedCategory && styles.filterChipTextActive]}>
            All
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            {
              backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
              ...cardShadow(theme.isDark, { height: 1, opacity: 0.06, radius: 3, elevation: 2 }),
            },
            selectedCategory === 'favorites' && { backgroundColor: 'rgba(255, 107, 107, 0.12)' },
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onCategoryChange('favorites');
          }}
        >
          <Ionicons
            name="heart"
            size={14}
            color={selectedCategory === 'favorites' ? '#FF6B6B' : theme.text.muted}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.filterChipText,
              { color: theme.text.secondary },
              selectedCategory === 'favorites' && { color: '#FF6B6B' },
            ]}
          >
            Favorites
          </Text>
        </Pressable>
        {CATEGORY_DEFINITIONS.map((cat) => (
          <Pressable
            key={cat.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
                ...cardShadow(theme.isDark, { height: 1, opacity: 0.06, radius: 3, elevation: 2 }),
              },
              selectedCategory === cat.id && { backgroundColor: `${cat.color}15` },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onCategoryChange(cat.id);
            }}
          >
            <Ionicons
              name={cat.icon as IoniconsName}
              size={14}
              color={selectedCategory === cat.id ? cat.color : theme.text.muted}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                { color: theme.text.secondary },
                selectedCategory === cat.id && { color: cat.color },
              ]}
            >
              {cat.title.replace(' Breaks', '')}
            </Text>
          </Pressable>
        ))}

        {/* Divider */}
        <View style={[styles.filterDivider, { backgroundColor: theme.isDark ? theme.border.medium : theme.border.strong }]} />

        {/* Duration Filters */}
        {DURATION_FILTERS.map((dur) => (
          <Pressable
            key={dur.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : theme.background.card,
                ...cardShadow(theme.isDark, { height: 1, opacity: 0.06, radius: 3, elevation: 2 }),
              },
              selectedDuration === dur.id && [styles.filterChipActive, { backgroundColor: theme.isDark ? 'rgba(6, 255, 165, 0.15)' : `${theme.accent.primary}15` }],
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              onDurationChange(dur.id);
            }}
          >
            <Text style={[styles.filterChipText, { color: theme.text.secondary }, selectedDuration === dur.id && styles.filterChipTextActive]}>
              {dur.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: 'rgba(6, 255, 165, 0.15)',
    borderColor: '#06FFA5',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  filterChipTextActive: {
    color: '#06FFA5',
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 4,
  },
});
