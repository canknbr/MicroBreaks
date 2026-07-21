/**
 * Library Exercise Row — editorial. A flat hairline list row: GIF thumbnail
 * (real movement art on a white plate), localized name, zone/duration/
 * difficulty meta, favorite + chevron. No card chrome / emoji fallback.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { ThemeColors } from '@/hooks/useTheme';
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
        styles.row,
        { borderBottomColor: theme.border.subtle, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {/* Thumbnail — white plate so the dataset art blends in dark mode */}
      <View style={styles.thumbWrap}>
        {media ? (
          <Image
            source={media.thumb}
            style={styles.thumb}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <Text style={styles.thumbFallback}>{name.charAt(0)}</Text>
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
          color={isFavorite ? '#EB3E38' : theme.text.muted}
        />
      </Pressable>
      <Ionicons name="chevron-forward" size={18} color={theme.text.muted} />
    </Pressable>
  );
}

export const LibraryExerciseRow = memo(LibraryExerciseRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  thumbWrap: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: 60,
    height: 60,
  },
  thumbFallback: {
    fontFamily: 'GeneralSans-Bold',
    fontSize: 24,
    color: '#0B0A0D',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  name: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 16,
    letterSpacing: -0.2,
    lineHeight: 21,
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 7,
  },
  metaText: {
    fontFamily: 'GeneralSans-Medium',
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
