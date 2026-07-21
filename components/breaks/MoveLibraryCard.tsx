/**
 * Move Library Entry Card
 * Breaks-tab entry point into the animated movement library. Shows a small
 * collage of demo thumbnails plus the library size.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/hooks/useTheme';
import { cardShadow } from '@/utils/cardShadow';
import {
  getLibraryExerciseRecord,
  getLibraryExercises,
  getLibraryMedia,
} from '@/features/exercise-library/catalog';

/** Stable, always-free sample thumbnails for the collage. */
const PREVIEW_IDS = ['lib-1403', 'lib-3533', 'lib-1365'] as const;

interface MoveLibraryCardProps {
  title: string;
  subtitle: string;
  badge: string;
  theme: ThemeColors;
  onPress: () => void;
}

export function MoveLibraryCard({
  title,
  subtitle,
  badge,
  theme,
  onPress,
}: MoveLibraryCardProps) {
  const previews = useMemo(
    () =>
      PREVIEW_IDS.map((id) => {
        const record = getLibraryExerciseRecord(id);
        return record ? getLibraryMedia(record) : undefined;
      }).filter((media): media is NonNullable<typeof media> => media != null),
    []
  );
  const count = useMemo(() => getLibraryExercises().length, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card,
          borderColor: theme.isDark ? 'rgba(6, 255, 165, 0.25)' : 'rgba(6, 255, 165, 0.45)',
          opacity: pressed ? 0.88 : 1,
          ...cardShadow(theme.isDark, { height: 3, opacity: 0.1, radius: 10, elevation: 5 }),
        },
      ]}
    >
      {/* Thumbnail collage */}
      <View style={styles.collage}>
        {previews.map((media, index) => (
          <View
            key={index}
            style={[
              styles.collageItem,
              {
                marginLeft: index === 0 ? 0 : -14,
                zIndex: previews.length - index,
              },
            ]}
          >
            <Image
              source={media.thumb}
              style={styles.collageImage}
              contentFit="cover"
              accessibilityIgnoresInvertColors
            />
          </View>
        ))}
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: theme.text.muted }]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <View style={[styles.countPill, { backgroundColor: 'rgba(6, 255, 165, 0.14)' }]}>
        <Text style={styles.countText}>{count}</Text>
        <Ionicons name="chevron-forward" size={14} color="#FF2472" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  collage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collageItem: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(6, 255, 165, 0.35)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  collageImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
  },
  badge: {
    backgroundColor: '#FF2472',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 2,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF2472',
  },
});
