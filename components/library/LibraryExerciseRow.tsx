/**
 * Library Exercise Row
 * Compact list card for the movement library: thumbnail, localized name,
 * zone/duration/difficulty meta, and a lock badge for gated moves.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/hooks/useTheme';
import { cardShadow } from '@/utils/cardShadow';
import type { LibraryExerciseRecord } from '@/features/exercise-library/types';
import {
  getLibraryMedia,
  localizedName,
  zoneMetaForRecord,
  type LibraryLocale,
} from '@/features/exercise-library/catalog';
import { estimateSessionSeconds } from '@/features/exercise-library/session';

export interface LibraryRowLabels {
  zone: string;
  difficulty: string;
  lockedHint: string;
  startHint: string;
}

interface LibraryExerciseRowProps {
  record: LibraryExerciseRecord;
  locale: LibraryLocale;
  labels: LibraryRowLabels;
  isLocked: boolean;
  isFavorite: boolean;
  theme: ThemeColors;
  onPress: (_record: LibraryExerciseRecord) => void;
  onToggleFavorite: (_id: string) => void;
}

function DifficultyDots({ level, color }: { level: 1 | 2 | 3; color: string }) {
  return (
    <View style={styles.dotsRow} accessibilityElementsHidden>
      {[1, 2, 3].map((dot) => (
        <View
          key={dot}
          style={[
            styles.dot,
            { backgroundColor: dot <= level ? color : 'rgba(128, 128, 128, 0.25)' },
          ]}
        />
      ))}
    </View>
  );
}

function LibraryExerciseRowComponent({
  record,
  locale,
  labels,
  isLocked,
  isFavorite,
  theme,
  onPress,
  onToggleFavorite,
}: LibraryExerciseRowProps) {
  const zone = zoneMetaForRecord(record);
  const media = getLibraryMedia(record);
  const name = localizedName(record, locale);
  const minutes = Math.max(1, Math.round(estimateSessionSeconds(record) / 60));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(record);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${labels.zone}. ${minutes} min. ${labels.difficulty}.`}
      accessibilityHint={isLocked ? labels.lockedHint : labels.startHint}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.isDark ? 'rgba(25, 25, 35, 0.9)' : theme.background.card,
          borderColor: theme.isDark ? theme.border.subtle : 'transparent',
          opacity: pressed ? 0.85 : 1,
          ...cardShadow(theme.isDark, { height: 2, opacity: 0.07, radius: 6, elevation: 3 }),
        },
      ]}
    >
      {/* Thumbnail — white plate so the dataset art blends in dark mode */}
      <View style={[styles.thumbWrap, { borderColor: `${zone.color}30` }]}>
        {media ? (
          <Image
            source={media.thumb}
            style={styles.thumb}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text style={styles.thumbFallback}>{zone.icon}</Text>
        )}
        {isLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.zoneDot, { backgroundColor: zone.color }]} />
          <Text style={[styles.metaText, { color: theme.text.muted }]} numberOfLines={1}>
            {labels.zone} · {minutes}m
          </Text>
          <DifficultyDots level={record.difficulty} color={zone.color} />
        </View>
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggleFavorite(record.id);
        }}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={name}
        accessibilityState={{ selected: isFavorite }}
        style={styles.favoriteButton}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={19}
          color={isFavorite ? '#FF6B6B' : theme.text.muted}
        />
      </Pressable>
      <Ionicons name="chevron-forward" size={18} color={theme.text.muted} />
    </Pressable>
  );
}

export const LibraryExerciseRow = memo(LibraryExerciseRowComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  thumbWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: 56,
    height: 56,
  },
  thumbFallback: {
    fontSize: 26,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  metaText: {
    fontSize: 12,
    flexShrink: 1,
  },
  favoriteButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    marginLeft: 8,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
