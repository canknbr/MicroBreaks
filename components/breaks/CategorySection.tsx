import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import type { IoniconsName } from '@/types/icons';
import { Spacing } from '@/theme';
import { ThemeColors } from '@/hooks/useTheme';
import { BreakCard } from './BreakCard';
import type { BreakCategorySectionData, BreakListItem } from './types';

export function CategorySection({
  category,
  delay,
  onBreakPress,
  favoriteBreaks,
  onToggleFavorite,
  theme,
}: {
  category: BreakCategorySectionData;
  delay: number;
  onBreakPress: (_item: BreakListItem) => void;
  favoriteBreaks: string[];
  onToggleFavorite: (_id: string) => void;
  theme: ThemeColors;
}) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateX.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [delay, opacity, translateX]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.categorySection}>
      <Animated.View style={[styles.categoryHeader, headerStyle]}>
        <View style={[styles.categoryIconContainer, { backgroundColor: `${category.color}20` }]}>
          <Ionicons name={category.icon as IoniconsName} size={20} color={category.color} />
        </View>
        <View>
          <Text style={[styles.categoryTitle, { color: theme.text.primary }]}>{category.title}</Text>
          <Text style={[styles.categorySubtitle, { color: theme.text.muted }]}>{category.subtitle}</Text>
        </View>
      </Animated.View>
      <View style={styles.breaksList}>
        {category.breaks.map((item, index) => (
          <BreakCard
            key={item.id}
            item={item}
            index={index}
            categoryColor={category.color}
            onPress={onBreakPress}
            isFavorite={favoriteBreaks.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categorySection: {
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categorySubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  breaksList: {
    gap: 10,
  },
});
