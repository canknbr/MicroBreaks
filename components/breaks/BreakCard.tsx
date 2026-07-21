import { useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { ThemeColors } from '@/hooks/useTheme';
import { cardShadow } from '@/utils/cardShadow';
import type { BreakListItem } from './types';

export function BreakCard({
  item,
  index,
  categoryColor,
  onPress,
  isFavorite,
  onToggleFavorite,
  theme,
}: {
  item: BreakListItem;
  index: number;
  categoryColor: string;
  onPress: (_item: BreakListItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (_id: string) => void;
  theme: ThemeColors;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 400 }));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(item);
  };

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite(item.id);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.duration}, ${item.description}`}
      accessibilityHint={
        item.isLocked
          ? 'Double tap to preview Pro access for this break'
          : 'Double tap to start this break exercise'
      }
    >
      <Animated.View style={[
        styles.breakCard,
        {
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          backgroundColor: theme.isDark ? 'transparent' : theme.background.card,
          ...cardShadow(theme.isDark, { height: 2, opacity: 0.08, radius: 8, elevation: 4 }),
        },
        animatedStyle,
      ]}>
        {/* BlurView only for dark mode */}
        {theme.isDark && (
          Platform.OS === 'ios' ? (
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(25, 25, 35, 0.9)' }]} />
          )
        )}
        <View style={styles.breakCardContent}>
          <View style={[styles.breakIconContainer, { backgroundColor: `${categoryColor}15` }]}>
            <Text style={styles.breakIcon} accessibilityElementsHidden>{item.icon}</Text>
          </View>
          <View style={styles.breakInfo}>
            <Text style={[styles.breakTitle, { color: theme.text.primary }]}>{item.title}</Text>
            <Text style={[styles.breakDescription, { color: theme.text.muted }]}>
              {item.isLocked ? `Pro • ${item.description}` : item.description}
            </Text>
          </View>
          <View style={styles.breakActions}>
            <Pressable
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
              accessibilityState={{ selected: isFavorite }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EB3E38' : theme.text.muted}
              />
            </Pressable>
            <Text
              style={[
                styles.durationText,
                { color: item.isLocked ? theme.text.muted : categoryColor },
              ]}
              accessibilityLabel={`Duration: ${item.duration}`}
            >
              {item.duration}
            </Text>
            <Ionicons
              name={item.isLocked ? 'lock-closed' : 'play-circle'}
              size={24}
              color={item.isLocked ? theme.text.muted : categoryColor}
              accessibilityElementsHidden
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  breakCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  breakCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  breakIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  breakIcon: {
    fontSize: 22,
  },
  breakInfo: {
    flex: 1,
  },
  breakTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  breakDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  breakActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
